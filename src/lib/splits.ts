import splits from "../asset/splits.txt";

// const SPLITS_DEFINITIONS_FILE = "./asset/splits.txt";
const SPLITS_DEFINITIONS_REGEXP =
    /\[Description\("(?<description>.+)"\), ToolTip\("(?<tooltip>.+)"\)\]\s+(?<id>\w+),/g;
// const DESCRIPTION_NAME_REGEXP = /(?<name>.+)\s+\(.+\)/;

interface SplitDefinition {
    description: string;
    tooltip: string;
    id: string;
    name: string;
}
interface IconDefinition {
    imageId: string;
    file: string;
}

function getName(description: string) {
    return description;
    // const match = DESCRIPTION_NAME_REGEXP.exec(description);
    // assert(match, `Invalid Description: ${description}`);
    // assert(match.groups, "RegExp match must have groups");
    // return match.groups.name;
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
    const { default: icons, } = await import("../asset/icons.json");
    const result = new Map<string, IconDefinition>();
    Object.keys(icons).forEach(key => result.set(key, icons[key]));
    return result;
}

export async function getIconData(name: string): Promise<Map<string, string>> {
    const { default: icons, } = await import(`../asset/${name}-icons.json`) as Record<string, string>;
    return new Map(Object.entries(icons));
}
