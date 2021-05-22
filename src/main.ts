import * as fs from "fs/promises";
import type { Config } from "./lss";
import { createSplitsXml } from "./lss";

const config: Config = {
    splitIds: [
        "KingsPass",
        "VengefulSpirit",
        "Greenpath",
        "MothwingCloak",
        "Aluba"
    ],
    ordered: true,
    endTriggeringAutosplit: true,
    gameName: "Hollow Knight Category Extensions",
    categoryName: "Aluba%",
    variables: {
        platform: "PC",
        patch: "1.2.2.1",
    },
};

async function main() {
    const lss = await createSplitsXml(config);
    await fs.writeFile("./splits.lss", lss);
}

void main();
