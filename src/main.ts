import * as fs from "fs/promises";
import { createSplitsXml } from "./lss";

async function main() {
    const configSource = (await fs.readFile("./sample-configs/aluba.json")).toString("utf-8");
    const lss = await createSplitsXml(JSON.parse(configSource));
    await fs.writeFile("./splits.lss", lss);
}

void main();
