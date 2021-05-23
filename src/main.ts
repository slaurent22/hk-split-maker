import * as fs from "fs/promises";
import { Command } from "commander";
import { createSplitsXml } from "./lss";

function getArgs(): [string, string] {
    const program = new Command();
    program
        .version("0.1.0")
        .arguments("<splitconfig> <outfile>")
        .description("test command", {
            splitconfig: "json config for the splits",
            outfile: "file for the output LiveSplit lss file",
        });

    program.parse();
    return program.args as [string, string];

}

async function main() {
    const [splitconfig, outfile] = getArgs();

    console.log(`Reading from ${splitconfig}`);
    const configSource = (await fs.readFile(splitconfig)).toString("utf-8");
    const output = await createSplitsXml(JSON.parse(configSource));
    console.log(`Writing to ${outfile}`);
    await fs.writeFile(outfile, output);
    console.log("Done!");
}

void main();
