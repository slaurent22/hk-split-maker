import { parseSplitsDefinitions } from "./splits";

async function main() {
    const defs = await parseSplitsDefinitions();
    console.log(defs);
}

try {
    void main();
}
catch (e) {
    console.error(e);
}
