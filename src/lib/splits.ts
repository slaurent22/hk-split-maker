import type { IconDefinition } from "../asset/icons/icon-directory.json";
import Splits from "../splits.json";
import type { IconClass } from "./icons";
import Icons, { getIconDirectory } from "./icons";

const DESCRIPTION_NAME_REGEXP = /(?<name>.+)\s+\((?<qualifier>.+)\)/;
interface SplitDefinition {
    description: string;
    id: string;
    name: string;
    title: string;
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
            return "Hollow Knight (Dreamnailed)";
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

export function getSplitsDefinitions(): Map<string, SplitDefinition> {
    const definitions = new Map<string, SplitDefinition>();
    for (const split of Splits) {
        const {
            description,
            id,
            title,
        } = split;
        const name = getName(title);
        definitions.set(id, {
            description,
            id,
            name,
            title,
        });
    }

    return definitions;
}

export async function getIconLocations(): Promise<Map<string, IconDefinition>> {
    const iconDirectory = await getIconDirectory();
    const result = new Map<string, IconDefinition>();
    Object.keys(iconDirectory).forEach(key => result.set(key, iconDirectory[key]));
    return result;
}

function assertIsIconClass(name: string): asserts name is IconClass {
    switch (name) {
        case "boss":
        case "charm":
        case "collectible":
        case "enemy":
        case "event":
        case "item":
        case "location":
        case "skill":
            return;
        default:
            throw new Error(`Unknown icon class '${name}'`);
    }
}

export async function getIconData(name: string): Promise<Map<string, string>> {
    assertIsIconClass(name);
    const icons = await Icons[name]();
    return new Map(Object.entries(icons));
}
