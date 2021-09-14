import splits from "../asset/splits.txt";
import Icons from "../asset/icons/icons";

// const SPLITS_DEFINITIONS_FILE = "./asset/splits.txt";
const SPLITS_DEFINITIONS_REGEXP =
    /\[Description\("(?<description>.+)"\), ToolTip\("(?<tooltip>.+)"\)\]\s+(?<id>\w+),/g;
const DESCRIPTION_NAME_REGEXP = /(?<name>.+)\s+\((?<qualifier>.+)\)/;

interface SplitDefinition {
    description: string;
    tooltip: string;
    id: string;
    name: string;
}

function getName(description: string) {
    const match = DESCRIPTION_NAME_REGEXP.exec(description);
    if (!match) {
        throw new Error(`Invalid Description: ${description}`);
    }
    if (!match.groups) {
        throw new Error("RegExp match must have groups");
    }

    const { name, qualifier, } = match.groups;

    switch (name) {
        case "Dream Nail - Awoken": {
            return "Awoken Dream Nail";
        }
        case "Crystal Guardian 1": {
            return "Crystal Guardian";
        }
        case "Crystal Guardian 2": {
            return "Enraged Guardian";
        }
        case "Chains Broken - Hollow Knight": {
            return "Hollow Knight Scream";
        }
        case "Radiance Dream Entry": {
            return "Hollow Knight";
        }
        case "Colosseum Fight 1": {
            return "Trial of the Warrior";
        }
        case "Colosseum Fight 2": {
            return "Trial of the Conqueror";
        }
        case "Colosseum Fight 3": {
            return "Trial of the Fool";
        }
        case "Pantheon 1": {
            return "Pantheon of the Master";
        }
        case "Pantheon 2": {
            return "Pantheon of the Artist";
        }
        case "Pantheon 3": {
            return "Pantheon of the Sage";
        }
        case "Pantheon 4": {
            return "Pantheon of the Knight";
        }
        case "Pantheon 5": {
            return "Pantheon of Hallownest";
        }
        case "Aspid Hunter": {
            return "Aspid Arena";
        }
        case "Husk Miner": {
            return "Myla";
        }
        case "Kingsoul Fragment - Queen's": {
            return "Queen Fragment";
        }
        case "Kingsoul Fragment - King's": {
            return "King Fragment";
        }
        case "Relic Dealer Lemm":
        case "Relic Dealer Lemm Shop": {
            return name.substr("Relic Dealer ".length);
        }
        case "Whispering Root": {
            // qualifier is the area
            return `${qualifier} Root`;
        }
        case "Zote Rescued Vengefly King": {
            return "Vengefly King";
        }
        case "Mega Moss Charger": {
            return "Massive Moss Charger";
        }
        default: {
            break;
        }
    }

    switch (qualifier) {
        case "Charm Notch":
            return `${name} Notch`;
        case "Stag Station":
            return `${name} Stag`;
        case "Grub": {
            return name.substr("Rescued ".length);
        }
        default:
            return name;
    }
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
        const name = getName(description);
        definitions.set(id, {
            description,
            id,
            tooltip,
            name,
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
