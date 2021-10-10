import splits from "../asset/splits.txt";
import Icons from "../asset/icons/icons";

// const SPLITS_DEFINITIONS_FILE = "./asset/splits.txt";
const SPLITS_DEFINITIONS_REGEXP =
    /\[Description\("(?<description>.+)"\), ToolTip\("(?<tooltip>.+)"\)\]\s+(?<id>\w+),/g;
export const DESCRIPTION_NAME_REGEXP = /(?<name>.+)\s+\((?<qualifier>.+)\)/;

export interface SplitDefinition {
    description: string;
    tooltip: string;
    id: string;
    name: string;
    group: string;
}

function getNameAndGroup(description: string): [string, string] {
    const match = DESCRIPTION_NAME_REGEXP.exec(description);
    if (!match) {
        throw new Error(`Invalid Description: ${description}`);
    }
    if (!match.groups) {
        throw new Error("RegExp match must have groups");
    }

    const { name, qualifier, } = match.groups;

    switch (qualifier) {
        case "Charm Notch":
            return [`${name} Notch`, qualifier];
        case "Stag Station":
            return [`${name} Stag`, qualifier];
        case "Grub": {
            return [name.substr("Rescued ".length), qualifier];
        }
        case "Transition":
            switch (name) {
                case "Ancient Basin":
                case "Crystal Peak":
                case "Fog Canyon":
                case "Greenpath":
                case "Greenpath w/ Unlocked Overcharm":
                case "Hive":
                case "Kingdom's Edge":
                case "Kingdom's Edge Overcharmed":
                case "NKG Dream":
                case "Sanctum":
                case "Sanctum w/ Shade Soul":
                case "Pantheon 1-4":
                case "Pantheon 5":
                case "Waterways Manhole": {
                    return [`Enter ${name}`, qualifier];
                }
                case "Queen's Garden - QGA/Mound Entry": {
                    return ["Enter Queen's Gardens", qualifier];
                }
                default: break;
            }
            break;
        case "Essence": {
            return [`${name} Essence`, qualifier];
        }
        case "Boss":
            switch (name) {
                case "Segment Practice - Radiance":
                case "Segment Practice - THK": {
                    return [name, "Practice"];
                }
                default: break;
            }
            break;
        case "Obtain":
            if (/Dream Nail/.test(name)) {
                return [name, "Essence"];
            }
            return [name, "Item"];
        default: {
            break;
        }
    }

    switch (name) {
        case "Dream Nail - Awoken": {
            return ["Awoken Dream Nail", qualifier];
        }
        case "Crystal Guardian 1": {
            return ["Crystal Guardian", qualifier];
        }
        case "Crystal Guardian 2": {
            return ["Enraged Guardian", qualifier];
        }
        case "Chains Broken - Hollow Knight": {
            return ["Hollow Knight Scream", qualifier];
        }
        case "Radiance Dream Entry": {
            return ["Hollow Knight", qualifier];
        }
        case "Colosseum Fight 1": {
            return ["Trial of the Warrior", qualifier];
        }
        case "Colosseum Fight 2": {
            return ["Trial of the Conqueror", qualifier];
        }
        case "Colosseum Fight 3": {
            return ["Trial of the Fool", qualifier];
        }
        case "Pantheon 1": {
            return ["Pantheon of the Master", qualifier];
        }
        case "Pantheon 2": {
            return ["Pantheon of the Artist", qualifier];
        }
        case "Pantheon 3": {
            return ["Pantheon of the Sage", qualifier];
        }
        case "Pantheon 4": {
            return ["Pantheon of the Knight", qualifier];
        }
        case "Pantheon 5": {
            return ["Pantheon of Hallownest", qualifier];
        }
        case "Aspid Hunter": {
            return ["Aspid Arena", qualifier];
        }
        case "Husk Miner": {
            return ["Myla", qualifier];
        }
        case "Kingsoul Fragment - Queen's": {
            return ["Queen Fragment", qualifier];
        }
        case "Kingsoul Fragment - King's": {
            return ["King Fragment", qualifier];
        }
        case "Relic Dealer Lemm":
        case "Relic Dealer Lemm Shop": {
            return [name.substr("Relic Dealer ".length), qualifier];
        }
        case "Whispering Root": {
            // qualifier is the area
            return [`${qualifier} Root`, "Whispering Root"];
        }
        case "Zote Rescued Vengefly King": {
            return ["Vengefly King", qualifier];
        }
        case "Mega Moss Charger": {
            return ["Massive Moss Charger", qualifier];
        }
        case "Nightmare Lantern Destroyed": {
            return ["Banishment", qualifier];
        }
        default: {
            break;
        }
    }

    return [name, qualifier];
}

export function parseSplitsDefinitions(): Map<string, SplitDefinition> {
    const matches = splits.matchAll(SPLITS_DEFINITIONS_REGEXP);
    const definitions = new Map<string, SplitDefinition>();
    for (const match of matches) {
        if (!match.groups) {
            throw new Error("RegExp match must have groups");
        }

        const {
            description,
            id,
            tooltip,
        } = match.groups;
        const [name, group] = getNameAndGroup(description);
        definitions.set(id, {
            description,
            id,
            tooltip,
            name,
            group,
        });
    }

    return definitions;
}

export function getIconURLs(): Map<string, string> {
    const result = new Map<string, string>();
    for (const [key, url] of Object.entries(Icons)) {
        result.set(key, url);
    }
    return result;
}

// export async function getIconData(name: string): Promise<Map<string, string>> {
//     assertIsIconClass(name);
//     const icons = await Icons[name]();
//     return new Map(Object.entries(icons));
// }
