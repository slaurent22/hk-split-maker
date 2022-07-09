import splits from "../asset/hollowknight/splits.txt";
import Icons from "../asset/hollowknight/icons/icons";

const SPLITS_DEFINITIONS_REGEXP =
  /\[Description\("(?<description>.+)"\), ToolTip\("(?<tooltip>.+)"\)\]\s+(?<id>\w+),/g;
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

  switch (id) {
    case "AspidHunter":
      return ["Aspid Arena", qualifier];
    case "ColosseumBronze":
      return ["Trial of the Warrior", qualifier];
    case "ColosseumGold":
      return ["Trial of the Fool", qualifier];
    case "ColosseumSilver":
      return ["Trial of the Conqueror", qualifier];
    case "CrystalGuardian1":
      return ["Crystal Guardian", qualifier];
    case "CrystalGuardian2":
      return ["Enraged Guardian", qualifier];
    case "DreamNail2":
      return ["Awoken Dream Nail", qualifier];
    case "HollowKnightDreamnail":
      return ["Hollow Knight", qualifier];
    case "HuskMiner":
      return ["Myla", qualifier];
    case "MegaMossCharger":
      return ["Massive Moss Charger", qualifier];
    case "NightmareLanternDestroyed":
      return ["Banishment", qualifier];
    case "Pantheon1":
      return ["Pantheon of the Master", qualifier];
    case "Pantheon2":
      return ["Pantheon of the Artist", qualifier];
    case "Pantheon3":
      return ["Pantheon of the Sage", qualifier];
    case "Pantheon4":
      return ["Pantheon of the Knight", qualifier];
    case "Pantheon5":
      return ["Pantheon of Hallownest", qualifier];
    case "UnchainedHollowKnight":
      return ["THK Scream", qualifier];
    case "WhiteFragmentLeft":
      return ["Queen Fragment", qualifier];
    case "WhiteFragmentRight":
      return ["King Fragment", qualifier];
    case "Zote1":
      return ["Vengefly King (Zote)", qualifier];
    case "BasinEntry":
    case "EnterGreenpath":
    case "EnterNKG":
    case "EnterSanctum":
    case "EnterSanctumWithShadeSoul":
    case "FogCanyonEntry":
    case "HiveEntry":
    case "KingdomsEdgeEntry":
    case "Pantheon1to4Entry":
    case "Pantheon5Entry":
    case "WaterwaysEntry":
      return [`Enter ${name}`, qualifier];
    case "QueensGardensEntry":
      return ["Enter Queen's Gardens", qualifier];
    case "PathOfPainEntry":
      return ["Enter Path of Pain", qualifier];
    case "RadianceBoss":
    case "HollowKnightBoss":
      return [name, "Practice"];
    case "BeastsDenTrapBench":
      return ["Trap Bench", qualifier];
    case "WatcherChandelier":
      return ["Chandelier", qualifier];
    case "Hegemol":
      return ["Herrah", qualifier];
    case "Lurien":
      return ["Lurien", qualifier];
    case "Monomon":
      return ["Monomon", qualifier];
    case "PureSnail":
      return ["Pure Snail", qualifier];
    case "QueensGardensPostArenaTransition":
      return ["QG Arena Exit", qualifier];
    case "SoulTyrantEssenceWithSanctumGrub":
      return ["S. Tyrant w/ Sanctum Grub", qualifier];
    default:
      break;
  }

  switch (qualifier) {
    case "Charm Notch":
      return [`${name} Notch`, qualifier];
    case "Essence": {
      if (name.includes("Essence")) {
        return [name, qualifier];
      }
      return [`${name} Essence`, qualifier];
    }
    case "Fragment":
      return [name, "Upgrade"];
    case "Grub":
      return [name.substr("Rescued ".length), qualifier];
    case "Pantheon":
      return [name, "Boss"];
    case "Room":
      return [name, "Transition"];
    case "Stag Station":
      return [`${name} Stag`, qualifier];
    case "Completed":
    case "Dreamgate":
    case "Lever":
    case "Spot":
    case "Tram":
      return [name, "Event"];
    case "Killed":
    case "Mini Boss":
      return [name, "Enemy"];
    case "Obtain":
      if (/Dream Nail/.test(name)) {
        return [name, "Essence"];
      }
      return [name, "Item"];
    case "Old Dreamer Timing":
      return [name, "Dreamer"];
    default:
      break;
  }

  switch (name) {
    case "Whispering Root":
      return [`${qualifier} Root`, "Whispering Root"];
    default:
      break;
  }

  return [name, qualifier];
}

export function parseSplitsDefinitions(): Map<string, SplitDefinition> {
  if (splitDefinitions) {
    return splitDefinitions;
  }
  const matches = splits.matchAll(SPLITS_DEFINITIONS_REGEXP);
  splitDefinitions = new Map<string, SplitDefinition>();
  for (const match of matches) {
    if (!match.groups) {
      throw new Error("RegExp match must have groups");
    }

    const { description, id, tooltip } = match.groups;
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
