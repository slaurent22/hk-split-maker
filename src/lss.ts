import xml from "xml";
import { parseSplitsDefinitions } from "./splits";

const GAME_NAMES = {
    HK: "Hollow Knight",
    HKMEMES: "Hollow Knight Category Extensions",
    HKMODS: "Hollow Knight Mods"
};

const CATEGORY_NAMES = {
    ALUBA: "Aluba%"
}

type Config = {
    splitIds: Array<string>,
    ordered: true,
    endTriggeringAutosplit: true,
    categoryName: string;
    gameName: string;
    variables?: {
        platform?: string;
        patch?: string;
    }
};

function boolRepr(bool: boolean): string {
    return bool ? "True" : "False";
}

function getSegmentNode(id: string): xml.XmlObject {
    return { Segment: [
        { Name: id },
        { Icon: "" },
        { SplitTimes: [
            { SplitTime: { _attr: { name: "Personal Best" } } },
        ]},
        { BestSegmentTime: "" },
        { SegmentHistory: "" }
    ] }
}

function getVariableNode(name: string, value: string): xml.XmlObject {
    return {
        Variable: [
            { _attr: { name } },
            value
        ]
    }
}

function getVariablesNode(config: Config): xml.XmlObject {
    const glitchAttrName = `${config.categoryName} Glitch`;
    const glitchVarNode = getVariableNode(glitchAttrName, "No Major Glitches");

    const variablesNode = {
        Variables: [
            glitchVarNode
        ]
    };

    if (config.variables?.patch) {
        variablesNode.Variables.push(
            getVariableNode("Patch", config.variables.patch)
        )
    }

    return variablesNode;
}

function getMetadataNode(config: Config): xml.XmlObject {
    const platformAttr = { _attr: { usesEmulator: boolRepr(false) }};
    const platformNode = config.variables?.platform ?
        { Platform: [ platformAttr, config.variables.platform ] } :
        { Platform: platformAttr };


    return { Metadata: [
        { Run: { _attr: { id: "" }}},
        platformNode,
        getVariablesNode(config)
    ] };
}

function createSplitsXml(config: Config): string {
    const {
        splitIds,
        ordered,
        endTriggeringAutosplit,
        categoryName,
        gameName
    } = config;

    const segments = splitIds.map(getSegmentNode);
    const autosplits = splitIds.map(Split => ({ Split }))
    return xml({
        Run: [
            { _attr: { version: "1.7.0" } },
            { GameIcon: "" },
            { GameName: gameName },
            { CategoryName: categoryName },
            getMetadataNode(config),
            { Offset: "00:00:00" },
            { AttemptCount: "0" },
            { AttemptHistory: "" },
            { Segments: segments },
            { AutoSplitterSettings: [
                { Ordered: boolRepr(ordered) },
                { AutosplitEndRuns: boolRepr(endTriggeringAutosplit) },
                { Splits: autosplits }
            ] },
        ]
    }, {
        declaration: true,
        indent: "  "
    });
}




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
    gameName: GAME_NAMES.HKMEMES,
    categoryName: CATEGORY_NAMES.ALUBA,
    variables: {
        platform: "PC",
        patch: "1.2.2.1"
    }
};

const lss = createSplitsXml(config);
console.log(lss);
