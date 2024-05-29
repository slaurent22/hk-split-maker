import xml from "../external-lib/xml.js";
import { createLiveSplitIconData } from "./image-util";
import { getIconURLs, parseSplitsDefinitions } from "./hollowknight-splits";

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
  const parsedSplitIds = splitIds.map((splitId) => {
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
        name = nameTemplate.replace("%s", splitDefinition.name);
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

export function importSplitsXml(str: string) : Config {
  // xml parse
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(str, "text/xml");
  // GameName, CategoryName -> gameName, categoryName
  const gameName = xmlDoc.getElementsByTagName("GameName")[0].textContent?.trim() || "";
  const categoryName = xmlDoc.getElementsByTagName("CategoryName")[0].textContent?.trim() || "";
  // Metadata Variables -> variables
  const variablesVariables = xmlDoc.getElementsByTagName("Variables")[0].getElementsByTagName("Variable");
  var variables: Record<string, string> = {};
  for (var i = 0; i < variablesVariables.length; i++) {
    const variableName = variablesVariables[i].getAttribute("name");
    if (variableName) {
      variables[variableName] = variablesVariables[i].textContent?.trim() || "";
    }
  }
  // AutoSplitterSettings -> startTriggeringAutosplit, splitIds, endTriggeringAutosplit
  const autoSplitterSettings = xmlDoc.getElementsByTagName("AutoSplitterSettings")[0];
  const ordered = autoSplitterSettings.getElementsByTagName("Ordered")[0].textContent?.trim() != "False";
  const startTriggeringAutosplit = autoSplitterSettings.getElementsByTagName("AutosplitStartRuns")[0].textContent?.trim() || "";
  var splitIds: string[] = [];
  autoSplitterSettings.getElementsByTagName("Splits")[0].childNodes.forEach((c) => {
    if (c.nodeName === "Split") {
      splitIds.push(c.textContent?.trim() || "");
    }
  });
  const endTriggeringAutosplit = autoSplitterSettings.getElementsByTagName("AutosplitEndRuns")[0].textContent?.trim() != "False";
  // Segments Segment Name -> names, endingSplit name
  const segments = xmlDoc.getElementsByTagName("Segments")[0].getElementsByTagName("Segment");
  var names: Record<string, Array<string>> = {};
  var endingSplit: { name?: string; } = {};
  for (var i = 0; i < segments.length; i++) {
    let segmentName = segments[i].getElementsByTagName("Name")[0].textContent?.trim() || "";
    if (i < splitIds.length) {
      if (!names[splitIds[i]]) {
        names[splitIds[i]] = [];
      }
      names[splitIds[i]].push(segmentName);
    } else if (i === splitIds.length) {
      endingSplit.name = segmentName;
    }
  }
  return {
    gameName,
    categoryName,
    ordered,
    startTriggeringAutosplit: startTriggeringAutosplit === "" ? undefined : startTriggeringAutosplit,
    splitIds,
    endTriggeringAutosplit,
    names,
    endingSplit,
  };
}
