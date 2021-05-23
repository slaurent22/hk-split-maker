import assert from "assert";
import * as fs from "fs/promises";

const SPLITS_DEFINITIONS_FILE = "./asset/splits.txt";
const SPLITS_DEFINITIONS_REGEXP =
    /\[Description\("(?<description>.+)"\), ToolTip\("(?<tooltip>.+)"\)\]\s+(?<id>\w+),/g;
// const DESCRIPTION_NAME_REGEXP = /(?<name>.+)\s+\(.+\)/;

interface SplitDefinition {
    description: string;
    tooltip: string;
    id: string;
    name: string;
}

function getName(description: string) {
    return description;
    // const match = DESCRIPTION_NAME_REGEXP.exec(description);
    // assert(match, `Invalid Description: ${description}`);
    // assert(match.groups, "RegExp match must have groups");
    // return match.groups.name;
}

export async function parseSplitsDefinitions(): Promise<Map<string, SplitDefinition>> {
    const definitionsSource = await fs.readFile(SPLITS_DEFINITIONS_FILE, {
        encoding: "utf-8",
    });
    const matches = definitionsSource.matchAll(SPLITS_DEFINITIONS_REGEXP);

    const definitions = new Map<string, SplitDefinition>();

    for (const match of matches) {
        assert(match.groups, "RegExp match must have groups");

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

export async function getIconData(): Promise<Map<string, string>> {
    const iconDataSource = await fs.readFile("./asset/icons.json");
    const iconDataObject = JSON.parse(iconDataSource.toString()) as Record<string, string>;
    return new Map(Object.entries(iconDataObject));
}
