import splits from "../asset/splits.txt";
import type { IconDefinition } from "../asset/icons/icon-directory.json";
import type { IconClass } from "./icons";
import Icons, { getIconDirectory } from "./icons";

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

    if (name === "Whispering Root") {
        // qualifier is the area
        return `${qualifier} Root`;
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
