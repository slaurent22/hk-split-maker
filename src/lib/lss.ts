import xml from "../external-lib/xml.js";
import { getIconData, getIconLocations, parseSplitsDefinitions } from "./splits";

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

const MANUAL_SPLIT_RE = /%(?<name>.+)/;
const SUB_SPLIT_RE = /-(?<name>.+)/;

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
    const iconLocations = await getIconLocations();
    const iconFiles = new Set<string>();
    const iconData = new Map<string, string>();

    const parsedSplitIds = splitIds.map(splitId => {
        let rawId = splitId;
        let manual = false;
        let subsplit = false;
        const manualSplitMatch = MANUAL_SPLIT_RE.exec(splitId);
        if (manualSplitMatch) {
            const name = manualSplitMatch.groups?.name;
            if (!name) {
                throw new Error(`Failed to parse name out of "${splitId}"`);
            }
            rawId = name;
            manual = true;
        }

        const subSplitMatch = SUB_SPLIT_RE.exec(rawId);
        if (subSplitMatch) {
            if (!subSplitMatch.groups) {
                throw new Error(`Failed to parse name out of "${splitId}"`);
            }
            rawId = subSplitMatch.groups.name;
            subsplit = true;
        }

        const splitDefinition = splitDefinitions.get(rawId);
        if (!splitDefinition && !manual) {
            throw new Error(`Failed to find a definition for split id ${rawId}`);
        }

        const name = splitDefinition ? splitDefinition.name : rawId;

        return {
            rawId,
            manual,
            subsplit,
            name,
        };
    });

    parsedSplitIds.forEach(({ rawId, }) => {
        const file = iconLocations.get(rawId)?.file;
        if (file) {
            iconFiles.add(file);
        }
    });
    const iconLookups = await Promise.all(
        // Load all required files
        Array.from(iconFiles).map(file => getIconData(file))
    );
    iconLookups.forEach(icons => {
        // no Object.assign for Maps
        icons.forEach((value, key) => iconData.set(key, value));
    });

    const segments = parsedSplitIds.map(({ rawId, subsplit, name, }) => {
        const iconInfo = iconLocations.get(rawId);
        let icon = "";
        if (iconInfo) {
            icon = iconData.get(iconInfo.imageId) || "";
        }
        const namePrefix = subsplit ? "-" : "";
        return getSegmentNode(`${namePrefix}${name}`, icon);
    });

    if (!endTriggeringAutosplit) {
        segments.push(getSegmentNode(categoryName));
    }

    const autosplits = parsedSplitIds
        .filter(({ manual, }) => {
            return !manual;
        })
        .map(({ rawId, }) => {
            return { Split: rawId, };
        });

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
