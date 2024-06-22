import xml from "../external-lib/xml.js";
import { createLiveSplitIconData } from "./image-util";
import {
  SplitDefinition,
  getIconURLs,
  parseSplitsDefinitions,
} from "./hollowknight-splits";

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
}

interface ParsedSplitId {
  autosplitId: string;
  subsplit: boolean;
  name: string;
  iconId: string;
}

const MANUAL_SPLIT_RE = /%(?<name>.+)/;
export const SUB_SPLIT_RE = /-(?<name>.+)/;

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

export async function createSplitsXml(config: Config): Promise<string> {
  const {
    splitIds,
    ordered = true,
    endTriggeringAutosplit,
    endingSplit,
    categoryName,
    gameName,
    names,
    icons,
  } = config;

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

  const autosplits = parsedSplitIds.map(({ autosplitId }) => {
    return { Split: autosplitId };
  });

  return xml(
    {
      Run: [
        { _attr: { version: "1.7.0" } },
        { GameIcon: "" },
        { GameName: gameName },
        { CategoryName: categoryName },
        getMetadataNode(config),
        { Offset: "00:00:00" },
        { AttemptCount: "0" },
        { AttemptHistory: "" },
        { Segments: segments },
        {
          AutoSplitterSettings: [
            { Ordered: boolRepr(ordered) },
            { AutosplitEndRuns: boolRepr(endTriggeringAutosplit) },
            { AutosplitStartRuns: config.startTriggeringAutosplit ?? "" },
            { Splits: autosplits },
          ],
        },
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
  if (splitDefinition?.name && nameOverride.includes(splitDefinition?.name)) {
    return nameOverride.replace(new RegExp(splitDefinition.name, "g"), "%s");
  }
  return nameOverride;
}

export function importSplitsXml(str: string): Config {
  // xml parse
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(str, "text/xml");
  // GameName, CategoryName -> gameName, categoryName
  const xmlDocGameName = xmlDoc.getElementsByTagName("GameName")[0];
  if (!xmlDocGameName) {
    throw new Error(`Failed to import splits: missing GameName`);
  }
  const gameName = xmlDocGameName.textContent?.trim() || "";
  const xmlDocCategoryName = xmlDoc.getElementsByTagName("CategoryName")[0];
  if (!xmlDocCategoryName) {
    throw new Error(`Failed to import splits: missing CategoryName`);
  }
  const categoryName = xmlDocCategoryName.textContent?.trim() || "";
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
          xmlDocVariables[i].textContent?.trim() || "";
        hasVariables = true;
      }
    }
  }
  // AutoSplitterSettings -> startTriggeringAutosplit, splitIds, endTriggeringAutosplit
  const autoSplitterSettings = xmlDoc.getElementsByTagName(
    "AutoSplitterSettings"
  )[0];
  if (!autoSplitterSettings) {
    throw new Error(`Failed to import splits: missing AutoSplitterSettings`);
  }
  const xmlDocOrdered = autoSplitterSettings.getElementsByTagName("Ordered")[0];
  const orderedStr = xmlDocOrdered && xmlDocOrdered.textContent?.trim();
  if (orderedStr != "True") {
    throw new Error(`Failed to import splits: Ordered must be True to import`);
  }
  const autosplitStartRuns =
    autoSplitterSettings.getElementsByTagName("AutosplitStartRuns")[0];
  const autoStart =
    (autosplitStartRuns && autosplitStartRuns.textContent?.trim()) || "";
  // autosplitIds vs splitIds: autosplitIds do not contain "-" for subsplits, splitIds can
  const parsedSplitIds: ParsedSplitId[] = [];
  const xmlDocSplits = autoSplitterSettings.getElementsByTagName("Splits")[0];
  if (!xmlDocSplits) {
    throw new Error(
      `Failed to import splits: missing AutoSplitterSettings Splits`
    );
  }
  xmlDocSplits.childNodes.forEach((c) => {
    if (c.nodeName === "Split") {
      const autosplitId = c.textContent?.trim() || "";
      parsedSplitIds.push({
        autosplitId,
        subsplit: false,
        name: "",
        iconId: "",
      });
    }
  });
  const autosplitEndRuns =
    autoSplitterSettings.getElementsByTagName("AutosplitEndRuns")[0];
  const endTriggeringAutosplit =
    autosplitEndRuns && autosplitEndRuns.textContent?.trim() == "True";
  // Segments Segment Name -> names, endingSplit name
  const xmlDocSegments0 = xmlDoc.getElementsByTagName("Segments")[0];
  if (!xmlDocSegments0) {
    throw new Error(`Failed to import splits: missing Segments`);
  }
  const segments = xmlDocSegments0.getElementsByTagName("Segment");
  // subsplitNames vs names: names do not contain "-" for subsplits, subsplitNames can
  let endName = "";
  for (let i = 0; i < segments.length; i++) {
    const xmlDocName = segments[i].getElementsByTagName("Name")[0];
    if (!xmlDocName) {
      throw new Error(`Failed to import splits: missing Segment Name`);
    }
    const subsegmentName = xmlDocName.textContent?.trim() || "";
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
      splitNames.every((aName) => aName === splitDefinition.name)
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
  return {
    categoryName,
    startTriggeringAutosplit: autoStart.length > 0 ? autoStart : undefined,
    splitIds,
    names: hasNameOverrides ? potentialNameOverrides : undefined,
    endTriggeringAutosplit,
    endingSplit: endName.length > 0 ? { name: endName } : undefined,
    gameName,
    variables: hasVariables ? potentialVariables : undefined,
  };
}
