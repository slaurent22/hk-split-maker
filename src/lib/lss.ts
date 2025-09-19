import xml from "../external-lib/xml.js";
import { Game } from "../store/game-slice";
import { createLiveSplitIconData } from "./image-util";
import { SplitDefinition } from "./hollowknight-splits";
import { splitsFunctions } from "./splits";

export interface Config {
  startTriggeringAutosplit?: string;
  splitIds: Array<string>;
  names?: Record<string, string | Array<string>>;
  icons?: Record<string, string | Array<string>>;
  ordered?: boolean;
  endTriggeringAutosplit: boolean;
  endingSplit?: {
    name?: string;
    icon?: string;
  };
  categoryName: string;
  gameName: string;
  variables?: Record<string, string>;
  offset?: string;
}

interface ParsedAutoSplitterSettings {
  startTriggeringAutosplit?: string;
  // autosplitIds vs splitIds: autosplitIds do not contain "-" for subsplits, splitIds can
  autosplitIds: Array<string>;
  ordered?: boolean;
  endTriggeringAutosplit: boolean;
}

interface ParsedSplitId {
  autosplitId: string;
  subsplit: boolean;
  name: string;
  iconId: string;
}

const DEFAULT_OFFSET = "00:00:00";

const MANUAL_SPLIT_RE = /%(?<name>.+)/;
export const SUB_SPLIT_RE = /-(?<name>.+)/;

export function buildSplitsFileName(splitsConfig: Config): string {
  const filename = (splitsConfig?.categoryName || "splits")
    .toLowerCase() // Make file name compatible:
    .replace(/['"]/g, "") // remove ' and "
    .replace(/[^a-z0-9]/gi, "_") // replace non-alphanum with _
    .replace(/^_+|_+$/g, "") // remove outer _
    .replace(/^_+|_+$/g, "") // remove outer _
    .replace(/_{2,}/g, "_"); // join multiple _
  let suffix = "";
  if (splitsConfig.variables?.glitch) {
    const glitch = splitsConfig.variables?.glitch;
    switch (glitch) {
      case "No Main Menu Storage":
        suffix = "-nmms";
        break;
      case "All Glitches":
        suffix = "-ag";
        break;
      default:
        break; // nmg categories don't need suffix
    }
  }
  return `${filename}${suffix}`;
}

function boolRepr(bool: boolean): string {
  return bool ? "True" : "False";
}

function getSegmentNode(name: string, iconData?: string): xml.XmlObject {
  const iconNode: xml.XmlObject = {
    Icon: iconData ? { _cdata: iconData } : "",
  };
  return {
    Segment: [
      { Name: name },
      iconNode,
      { SplitTimes: [{ SplitTime: { _attr: { name: "Personal Best" } } }] },
      { BestSegmentTime: "" },
      { SegmentHistory: "" },
    ],
  };
}

function getVariableNode(name: string, value: string): xml.XmlObject {
  return {
    Variable: [{ _attr: { name } }, value],
  };
}

function getVariablesNode(config: Config): xml.XmlObject {
  const variablesNode = { Variables: [] as Array<xml.XmlObject> };

  if (config.variables) {
    for (const [key, value] of Object.entries(config.variables)) {
      variablesNode.Variables.push(getVariableNode(key, value));
    }
  }

  return variablesNode;
}

function getMetadataNode(config: Config): xml.XmlObject {
  const platformAttr = { _attr: { usesEmulator: boolRepr(false) } };
  const platformNode = config.variables?.platform
    ? { Platform: [platformAttr, config.variables.platform] }
    : { Platform: platformAttr };

  return {
    Metadata: [
      { Run: { _attr: { id: "" } } },
      platformNode,
      getVariablesNode(config),
    ],
  };
}

export async function createSplitsXml(
  config: Config,
  game: Game
): Promise<string> {
  const {
    ordered = true,
    endTriggeringAutosplit = true,
    endingSplit,
    categoryName,
    gameName,
    names,
    icons,
    offset,
  } = config;

  // for silksong, first autosplit is start trigger
  const splitIds =
    game === "silksong" ? config.splitIds.slice(1) : config.splitIds;
  const autosplitIds = config.splitIds;

  const { parseSplitsDefinitions, getIconURLs } = splitsFunctions(game);

  const splitDefinitions = parseSplitsDefinitions();
  const allIconURLs = getIconURLs();
  const iconURLsToFetch = new Set<string>();
  const liveSplitIconData = new Map<string, string>();

  const splitIdCount = new Map<string, number>();
  const parsedSplitIds: ParsedSplitId[] = splitIds.map((splitId) => {
    let autosplitId = splitId;
    let subsplit = false;
    let name = "";
    const manualSplitMatch = MANUAL_SPLIT_RE.exec(splitId);
    if (manualSplitMatch) {
      const parsedName = manualSplitMatch.groups?.name;
      if (!parsedName) {
        throw new Error(`Failed to parse name out of "${splitId}"`);
      }
      autosplitId = "ManualSplit";
      name = parsedName;
    }

    const subSplitMatch = SUB_SPLIT_RE.exec(autosplitId);
    if (subSplitMatch) {
      if (!subSplitMatch.groups) {
        throw new Error(`Failed to parse name out of "${splitId}"`);
      }
      autosplitId = subSplitMatch.groups.name;
      subsplit = true;
    }

    const splitDefinition = splitDefinitions.get(autosplitId);
    if (!splitDefinition) {
      throw new Error(
        `Failed to find a definition for split id ${autosplitId}`
      );
    }

    if (!splitIdCount.has(autosplitId)) {
      splitIdCount.set(autosplitId, 0);
    }
    const currentSplitIdCount = splitIdCount.get(autosplitId) as number;

    const nameOverride = names && names[autosplitId];
    if (nameOverride) {
      let nameTemplate = "";
      if (typeof nameOverride === "string") {
        nameTemplate = nameOverride;
      } else {
        nameTemplate = nameOverride[currentSplitIdCount];
      }
      if (nameTemplate) {
        name = nameTemplate.replace(
          new RegExp("%s", "g"),
          splitDefinition.name
        );
      }
    }

    if (!name) {
      name = splitDefinition.name;
    }

    let iconId = autosplitId;
    const iconOverride = icons && icons[autosplitId];
    if (typeof iconOverride === "string") {
      iconId = iconOverride;
    } else if (iconOverride?.length) {
      iconId = iconOverride[currentSplitIdCount];
    }

    splitIdCount.set(autosplitId, 1 + currentSplitIdCount);
    return {
      autosplitId,
      subsplit,
      name,
      iconId,
    };
  });

  parsedSplitIds.forEach(({ iconId }) => {
    const url = allIconURLs.get(iconId);
    if (url) {
      iconURLsToFetch.add(url);
    }
  });
  if (!endTriggeringAutosplit && endingSplit?.icon) {
    const url = allIconURLs.get(endingSplit.icon);
    if (url) {
      iconURLsToFetch.add(url);
    }
  }

  await Promise.all(
    [...iconURLsToFetch].map(async (url) => {
      try {
        const iconData = await createLiveSplitIconData(url);
        liveSplitIconData.set(url, iconData);
      } catch (e) {
        console.error(`Failed to create icon data for ${url}`);
        console.error(e);
      }
    })
  );

  const segments = parsedSplitIds.map(({ subsplit, name, iconId }) => {
    const iconURL = allIconURLs.get(iconId);
    let icon = "";
    if (iconURL) {
      icon = liveSplitIconData.get(iconURL) ?? "";
    }
    const namePrefix = subsplit ? "-" : "";
    return getSegmentNode(`${namePrefix}${name}`, icon);
  });

  if (!endTriggeringAutosplit) {
    const endingSplitName = endingSplit?.name ?? categoryName;
    let icon = "";
    if (endingSplit?.icon) {
      const url = allIconURLs.get(endingSplit.icon);
      if (url) {
        icon = liveSplitIconData.get(url) ?? "";
      }
    }
    segments.push(getSegmentNode(endingSplitName, icon));
  }

  const autosplits = autosplitIds.map((autosplitId) => {
    return { Split: autosplitId };
  });

  const silksongAutosplits = autosplitIds.map((autosplitId) => {
    return { Setting: [{ _attr: { type: "string", value: autosplitId } }] };
  });

  let autosplitterSettings: Array<xml.XmlObject> = [];
  switch (game) {
    case "hollowknight":
      autosplitterSettings = [
        { Ordered: boolRepr(ordered) },
        { AutosplitEndRuns: boolRepr(endTriggeringAutosplit) },
        { AutosplitStartRuns: config.startTriggeringAutosplit ?? "" },
        { Splits: autosplits },
      ];
      break;
    case "silksong":
      autosplitterSettings = [
        { Version: "1.0" },
        {
          CustomSettings: [
            {
              Setting: [
                { _attr: { id: "splits", type: "list" } },
                ...silksongAutosplits,
              ],
            },
          ],
        },
      ];
      break;
    default:
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      throw new Error(`Invalid game ${game}`);
  }

  return xml(
    {
      Run: [
        { _attr: { version: "1.7.0" } },
        { GameIcon: "" },
        { GameName: gameName },
        { CategoryName: categoryName },
        getMetadataNode(config),
        { Offset: offset ?? DEFAULT_OFFSET },
        { AttemptCount: "0" },
        { AttemptHistory: "" },
        { Segments: segments },
        { AutoSplitterSettings: autosplitterSettings },
      ],
    },
    {
      declaration: true,
      indent: "  ",
    }
  );
}

function transformNameOverrideForImport(
  nameOverride: string,
  splitDefinition?: SplitDefinition
): string {
  if (nameOverride === "") {
    return "%s";
  }
  if (splitDefinition?.name && nameOverride.includes(splitDefinition?.name)) {
    return nameOverride.replace(new RegExp(splitDefinition.name, "g"), "%s");
  }
  return nameOverride;
}

function getTextContent(element: Element | ChildNode): string | undefined {
  return element.textContent?.trim();
}

function getTextContentByTagName(
  element: Element | Document,
  tagName: string
): string | undefined {
  const elementByTagName = element.getElementsByTagName(tagName)[0];
  return getTextContent(elementByTagName);
}

function parseAutoSplitterSettings(
  autoSplitterSettings: Element
): ParsedAutoSplitterSettings {
  const xmlDocSplits = autoSplitterSettings.getElementsByTagName("Splits")[0];
  const xmlDocCustomSettings =
    autoSplitterSettings.getElementsByTagName("CustomSettings")[0];
  if (xmlDocSplits) {
    // Default autosplitter
    const autosplitEndRuns = getTextContentByTagName(
      autoSplitterSettings,
      "AutosplitEndRuns"
    );
    const orderedStr = getTextContentByTagName(autoSplitterSettings, "Ordered");
    const autoStart =
      getTextContentByTagName(autoSplitterSettings, "AutosplitStartRuns") || "";
    // autosplitIds vs splitIds: autosplitIds do not contain "-" for subsplits, splitIds can
    const autosplitIds: Array<string> = [];
    xmlDocSplits.childNodes.forEach((c) => {
      if (c.nodeName === "Split") {
        const autosplitId = getTextContent(c) || "";
        autosplitIds.push(autosplitId);
      }
    });
    const endTriggeringAutosplit = autosplitEndRuns == "True";
    return {
      ordered: orderedStr == "True",
      startTriggeringAutosplit: autoStart.length > 0 ? autoStart : undefined,
      autosplitIds,
      endTriggeringAutosplit,
    };
  } else if (xmlDocCustomSettings) {
    // WASM autosplitter
    const xmlDocSettings = xmlDocCustomSettings.getElementsByTagName("Setting");
    const autostartsplitIds: Array<string> = [];
    for (let i = 0; i < xmlDocSettings.length; i++) {
      if (xmlDocSettings[i].getAttribute("id") == "splits") {
        const xmlDocSplitsSettings =
          xmlDocSettings[i].getElementsByTagName("Setting");
        for (let j = 0; j < xmlDocSplitsSettings.length; j++) {
          autostartsplitIds.push(
            xmlDocSplitsSettings[j].getAttribute("value") || ""
          );
        }
      }
    }
    const autostartId = autostartsplitIds[0];
    return {
      ordered: true,
      startTriggeringAutosplit:
        autostartId == "LegacyStart" ? undefined : autostartId,
      autosplitIds: autostartsplitIds.slice(1),
      endTriggeringAutosplit: true,
    };
  } else {
    throw new Error(
      `Failed to import splits: missing AutoSplitterSettings Splits`
    );
  }
}

export function importSplitsXml(str: string, game: Game): Config {
  // xml parse
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(str, "text/xml");
  // GameName, CategoryName -> gameName, categoryName
  const gameName =
    getTextContentByTagName(xmlDoc, "GameName") || "Hollow Knight";
  const categoryName = getTextContentByTagName(xmlDoc, "CategoryName") || "";
  const offset = getTextContentByTagName(xmlDoc, "Offset");
  // Metadata Variables -> variables
  const xmlDocVariables0 = xmlDoc.getElementsByTagName("Variables")[0];
  const xmlDocVariables =
    xmlDocVariables0 && xmlDocVariables0.getElementsByTagName("Variable");
  const potentialVariables: Record<string, string> = {};
  let hasVariables = false;
  if (xmlDocVariables && xmlDocVariables.length > 0) {
    for (let i = 0; i < xmlDocVariables.length; i++) {
      const variableName = xmlDocVariables[i].getAttribute("name");
      if (variableName) {
        potentialVariables[variableName] =
          getTextContent(xmlDocVariables[i]) || "";
        hasVariables = true;
      }
    }
  }
  // AutoSplitterSettings -> startTriggeringAutosplit, splitIds, endTriggeringAutosplit
  let autoSplitterSettings = xmlDoc.getElementsByTagName(
    "AutoSplitterSettings"
  )[0];
  if (!autoSplitterSettings) {
    const xmlDocComponents0 = xmlDoc.getElementsByTagName("Components")[0];
    const xmlDocComponents =
      (xmlDocComponents0 &&
        xmlDocComponents0.getElementsByTagName("Component")) ||
      [];
    for (let i = 0; i < xmlDocComponents.length; i++) {
      const xmlDocComponent = xmlDocComponents[i];
      const path = getTextContentByTagName(xmlDocComponent, "Path");
      if (path === "LiveSplit.AutoSplittingRuntime.dll") {
        autoSplitterSettings =
          xmlDocComponent.getElementsByTagName("Settings")[0];
        break;
      }
    }
    if (!autoSplitterSettings) {
      throw new Error(`Failed to import splits: missing AutoSplitterSettings`);
    }
  }
  const {
    ordered,
    startTriggeringAutosplit,
    autosplitIds,
    endTriggeringAutosplit,
  } = parseAutoSplitterSettings(autoSplitterSettings);
  if (!ordered) {
    throw new Error(`Failed to import splits: Ordered must be True to import`);
  }
  // autosplitIds vs splitIds: autosplitIds do not contain "-" for subsplits, splitIds can
  const parsedSplitIds: ParsedSplitId[] = [];
  autosplitIds.forEach((autosplitId) => {
    parsedSplitIds.push({
      autosplitId,
      subsplit: false,
      name: "",
      iconId: "",
    });
  });
  // Segments Segment Name -> names, endingSplit name
  const xmlDocSegments0 = xmlDoc.getElementsByTagName("Segments")[0];
  const segments =
    (xmlDocSegments0 && xmlDocSegments0.getElementsByTagName("Segment")) || [];
  // subsplitNames vs names: names do not contain "-" for subsplits, subsplitNames can
  let endName = "";
  for (let i = 0; i < segments.length; i++) {
    const subsegmentName = getTextContentByTagName(segments[i], "Name") || "";
    if (i < parsedSplitIds.length) {
      if (subsegmentName.startsWith("-")) {
        parsedSplitIds[i].subsplit = true;
        parsedSplitIds[i].name = subsegmentName.substring(1);
      } else {
        parsedSplitIds[i].subsplit = false;
        parsedSplitIds[i].name = subsegmentName;
      }
    } else if (i === parsedSplitIds.length) {
      // endingSplit cannot be a subsplit
      endName = subsegmentName;
    }
  }
  // Deal with "-" subsplit markers
  const splitIds: string[] = parsedSplitIds.map(({ autosplitId, subsplit }) => {
    const namePrefix = subsplit ? "-" : "";
    return `${namePrefix}${autosplitId}`;
  });
  const uniqueAutosplitIds: Set<string> = new Set(
    parsedSplitIds.map(({ autosplitId }) => autosplitId)
  );
  const { parseSplitsDefinitions } = splitsFunctions(game);
  const splitDefinitions = parseSplitsDefinitions();
  const potentialNameOverrides: Record<string, string | string[]> = {};
  let hasNameOverrides = false;
  uniqueAutosplitIds.forEach((uniqueAutosplitId) => {
    const splitNames = parsedSplitIds
      .filter(({ autosplitId }) => autosplitId === uniqueAutosplitId)
      .map(({ name }) => name);
    const splitDefinition = splitDefinitions.get(uniqueAutosplitId);
    if (
      splitDefinition &&
      splitNames.every(
        (aName) => aName === "" || aName === splitDefinition.name
      )
    ) {
      // do nothing
    } else if (splitNames.length === 1) {
      potentialNameOverrides[uniqueAutosplitId] =
        transformNameOverrideForImport(splitNames[0], splitDefinition);
      hasNameOverrides = true;
    } else {
      const nameOverrides = [...splitNames];
      nameOverrides.forEach((nameOverride, index) => {
        nameOverrides[index] = transformNameOverrideForImport(
          nameOverride,
          splitDefinition
        );
      });

      potentialNameOverrides[uniqueAutosplitId] = nameOverrides;
      hasNameOverrides = true;
    }
  });
  let config: Config = {
    categoryName,
    startTriggeringAutosplit,
    splitIds,
    names: hasNameOverrides ? potentialNameOverrides : undefined,
    endTriggeringAutosplit,
    endingSplit: endName.length > 0 ? { name: endName } : undefined,
    gameName,
    variables: hasVariables ? potentialVariables : undefined,
  };
  if (offset && offset !== DEFAULT_OFFSET) {
    config = { offset, ...config };
  }
  return config;
}
