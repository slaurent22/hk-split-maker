import splits from "../asset/silksong/splits.json";
import Icons from "../asset/silksong/icons/icons";

export const DESCRIPTION_NAME_REGEXP = /(?<name>.+)\s+\((?<qualifier>.+)\)/;

let splitDefinitions: Map<string, SplitDefinition> | null = null;
let groupedSplitDefinitions: Map<string, Array<SplitDefinition>> | null = null;

interface SelectOptionGroup {
  label: string;
  options: Array<{ value: string; label: string; tooltip: string }>;
}
let selectOptionGroups: Array<SelectOptionGroup> | null = null;

export interface SplitDefinition {
  description: string;
  tooltip: string;
  id: string;
  name: string;
  group: string;
}

function getNameAndGroup({
  description,
  id,
}: Pick<SplitDefinition, "description" | "id">): [string, string] {
  const match = DESCRIPTION_NAME_REGEXP.exec(description);
  let name = description;
  let qualifier = "Other";

  if (match && match.groups) {
    ({ name, qualifier } = match.groups);
  }
  // eslint-disable-next-line default-case
  switch (qualifier) {
    case "Flea":
      if (name.startsWith("Rescued")) {
        return [name.substring("Rescued ".length), qualifier];
      }
      break;
    case "Bellway":
      return [`${name} Bellway`, qualifier];
    case "Ventrica":
      return [`${name} Ventrica`, qualifier];
  }
  // eslint-disable-next-line default-case
  switch (id) {
    case "MossMotherTrans":
    case "SilkSpearTrans":
    case "BellBeastTrans":
    case "SwiftStepTrans":
    case "Lace1Trans":
    case "DriftersCloakTrans":
    case "MoorwingTrans":
    case "ClingGripTrans":
    case "TrobbioTrans":
    case "ClawlineTrans":
    case "VaultkeepersMelodyTrans":
    case "ArchitectsMelodyTrans":
    case "ConductorsMelodyTrans":
    case "ReaperCrestTrans":
      return [`${name} Exit`, qualifier];
  }
  return [name, qualifier];
}

export function parseSplitsDefinitions(): Map<string, SplitDefinition> {
  if (splitDefinitions) {
    return splitDefinitions;
  }
  splitDefinitions = new Map<string, SplitDefinition>();
  for (const { description, key, tooltip } of splits) {
    const id = key;
    const [name, group] = getNameAndGroup({ description, id });
    splitDefinitions.set(id, {
      description,
      id,
      tooltip: tooltip.replace("\\n", ".\n"),
      name,
      group,
    });
  }

  return splitDefinitions;
}

function getGroupedSplitDefinitions() {
  if (groupedSplitDefinitions) {
    return groupedSplitDefinitions;
  }
  const splitDefs = parseSplitsDefinitions();
  groupedSplitDefinitions = new Map<string, Array<SplitDefinition>>();
  for (const split of splitDefs.values()) {
    if (!groupedSplitDefinitions.has(split.group)) {
      groupedSplitDefinitions.set(split.group, []);
    }
    const group = groupedSplitDefinitions.get(
      split.group
    ) as Array<SplitDefinition>;
    group.push(split);
  }
  return groupedSplitDefinitions;
}

export function getSelectOptionGroups(): Array<SelectOptionGroup> {
  if (selectOptionGroups) {
    return selectOptionGroups;
  }
  const groupedSplits = getGroupedSplitDefinitions();
  selectOptionGroups = [...groupedSplits].map(([groupName, splitDefs]) => {
    return Object.freeze({
      label: groupName,
      options: splitDefs.map((split) => ({
        value: split.id,
        label: split.description,
        tooltip: split.tooltip,
      })),
    });
  });
  return selectOptionGroups;
}

export function getIconURLs(): Map<string, string> {
  const result = new Map<string, string>();
  for (const [key, url] of Object.entries(Icons)) {
    result.set(key, url);
  }
  return result;
}
