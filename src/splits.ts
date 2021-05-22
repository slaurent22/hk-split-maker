import * as fs from "fs/promises";

const SPLITS_DEFINITIONS_FILE = "./asset/splits.txt";
const SPLITS_DEFINITIONS_REGEXP =
    /\[Description\("(?<description>.+)"\), ToolTip\("(?<tooltip>.+)"\)\]\s+(?<id>\w+),/g;

interface SplitDefinition {
    description: string;
    tooltip: string;
    id: string;
}

export async function parseSplitsDefinitions(): Promise<Map<string, SplitDefinition>> {
    const definitionsSource = await fs.readFile(SPLITS_DEFINITIONS_FILE, {
        encoding: "utf-8",
    });
    const matches = definitionsSource.matchAll(SPLITS_DEFINITIONS_REGEXP);

    const definitions = new Map<string, SplitDefinition>();

    for (const match of matches) {
        if (!match.groups) {
            throw new Error("unexpected");
        }

        const {
            description, id, tooltip,
        } = match.groups;
        definitions.set(id, {
            description, id, tooltip,
        });
    }

    return definitions;
}
