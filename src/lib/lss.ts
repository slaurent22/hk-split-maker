import xml from "../external-lib/xml.js";
import { getIconData, parseSplitsDefinitions } from './splits';

export interface Config {
    splitIds: Array<string>;
    ordered: true;
    endTriggeringAutosplit: true;
    categoryName: string;
    gameName: string;
    variables?: {
        platform?: string;
        patch?: string;
        glitch?: string;
    };
}

function boolRepr(bool: boolean): string {
    return bool ? "True" : "False";
}

function getSegmentNode(name: string, iconData?: string): xml.XmlObject {
    const iconNode: xml.XmlObject = {
        Icon: iconData ? { _cdata: iconData, } : "",
    };
    return { Segment: [
        { Name: name, },
        iconNode,
        { SplitTimes: [
            { SplitTime: { _attr: { name: "Personal Best", }, }, }
        ], },
        { BestSegmentTime: "", },
        { SegmentHistory: "", }
    ], };
}

function getVariableNode(name: string, value: string): xml.XmlObject {
    return {
        Variable: [
            { _attr: { name, }, },
            value
        ],
    };
}

function getVariablesNode(config: Config): xml.XmlObject {
    const glitchAttrName = `${config.categoryName} Glitch`;
    const glitch = config.variables?.glitch || "No Major Glitches";
    const glitchVarNode = getVariableNode(glitchAttrName, glitch);

    const variablesNode = {
        Variables: [
            glitchVarNode
        ],
    };

    if (config.variables?.patch) {
        variablesNode.Variables.push(
            getVariableNode("Patch", config.variables.patch)
        );
    }

    return variablesNode;
}

function getMetadataNode(config: Config): xml.XmlObject {
    const platformAttr = { _attr: { usesEmulator: boolRepr(false), }, };
    const platformNode = config.variables?.platform ?
        { Platform: [ platformAttr, config.variables.platform ], } :
        { Platform: platformAttr, };


    return { Metadata: [
        { Run: { _attr: { id: "", }, }, },
        platformNode,
        getVariablesNode(config)
    ], };
}

export async function createSplitsXml(config: Config): Promise<string> {
    const {
        splitIds,
        ordered,
        endTriggeringAutosplit,
        categoryName,
        gameName,
    } = config;

    const splitDefinitions = parseSplitsDefinitions();
    const icons = await getIconData();

    const segments = splitIds.map(splitId => {
        const splitDefinition = splitDefinitions.get(splitId);
        if (!splitDefinition) {
            throw new Error(`Failed to find a definition for split id ${splitId}`);
        }
        const iconData = icons.get(splitId);
        return getSegmentNode(splitDefinition.name, iconData);
    });

    if (!endTriggeringAutosplit) {
        segments.push(getSegmentNode(categoryName));
    }

    const autosplits = splitIds.map(Split => ({ Split, }));
    return xml({
        Run: [
            { _attr: { version: "1.7.0", }, },
            { GameIcon: "", },
            { GameName: gameName, },
            { CategoryName: categoryName, },
            getMetadataNode(config),
            { Offset: "00:00:00", },
            { AttemptCount: "0", },
            { AttemptHistory: "", },
            { Segments: segments, },
            { AutoSplitterSettings: [
                { Ordered: boolRepr(ordered), },
                { AutosplitEndRuns: boolRepr(endTriggeringAutosplit), },
                { Splits: autosplits, }
            ], }
        ],
    }, {
        declaration: true,
        indent: "  ",
    });
}
