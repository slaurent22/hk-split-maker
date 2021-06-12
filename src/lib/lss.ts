import xml from "../external-lib/xml.js";
import { createLiveSplitIconData } from "./image-util";
import { getIconURLs, parseSplitsDefinitions } from "./splits";

export interface Config {
    splitIds: Array<string>;
    names?: Record<string, string|Array<string>>;
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
        names,
    } = config;

    const splitDefinitions = parseSplitsDefinitions();
    const allIconURLs = getIconURLs();
    const iconURLsToFetch = new Set<string>();
    const liveSplitIconData = new Map<string, string>();

    const splitIdCount = new Map<string, number>();
    const parsedSplitIds = splitIds.map(splitId => {
        if (!splitIdCount.has(splitId)) {
            splitIdCount.set(splitId, 0);
        }
        const currentSplitIdCount = splitIdCount.get(splitId) as number;

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

        let name = splitDefinition ? splitDefinition.name : rawId;
        const nameOverride = names && names[splitId];
        if (nameOverride) {
            let nameTemplate = "";
            if (typeof nameOverride === "string") {
                nameTemplate = nameOverride;
            }
            else {
                nameTemplate = nameOverride[currentSplitIdCount];
            }
            name = nameTemplate.replace("%s", name);
        }

        splitIdCount.set(splitId, 1 + currentSplitIdCount);
        return {
            rawId,
            manual,
            subsplit,
            name,
        };
    });

    parsedSplitIds.forEach(({ rawId, }) => {
        const url = allIconURLs.get(rawId);
        if (url) {
            iconURLsToFetch.add(url);
        }
    });

    await Promise.all(
        [...iconURLsToFetch].map(async url => {
            try {
                const iconData = await createLiveSplitIconData(url);
                liveSplitIconData.set(url, iconData);
            }
            catch (e) {
                console.error(`Failed to create icon data for ${url}`);
                console.error(e);
            }
        })
    );

    const segments = parsedSplitIds.map(({ rawId, subsplit, name, }) => {
        const iconURL = allIconURLs.get(rawId);
        let icon = "";
        if (iconURL) {
            icon = liveSplitIconData.get(iconURL) || "";
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
