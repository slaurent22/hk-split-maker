import xml from "../external-lib/xml.js";
import { createLiveSplitIconData } from "./image-util";
import { getIconURLs, parseSplitsDefinitions } from "./splits";

export interface Config {
    startTriggeringAutosplit?: string;
    splitIds: Array<string>;
    names?: Record<string, string|Array<string>>;
    icons?: Record<string, string|Array<string>>;
    ordered: true;
    endTriggeringAutosplit: true;
    endingSplit?: {
        name?: string;
        icon?: string;
    };
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
    const variablesNode = { Variables: [] as Array<xml.XmlObject>, };

    if (config.variables?.glitch) {
        const glitchAttrName = `${config.categoryName} Glitch`;
        variablesNode.Variables.push(
            getVariableNode(glitchAttrName, config.variables.glitch)
        );
    }
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
        endingSplit,
        categoryName,
        gameName,
        names,
        icons,
    } = config;

    const splitDefinitions = parseSplitsDefinitions();
    const allIconURLs = getIconURLs();
    const iconURLsToFetch = new Set<string>();
    const liveSplitIconData = new Map<string, string>();

    const splitIdCount = new Map<string, number>();
    const parsedSplitIds = splitIds.map(splitId => {
        let autosplitId = splitId;
        let subsplit = false;
        let name = "";
        const manualSplitMatch = MANUAL_SPLIT_RE.exec(splitId);
        if (manualSplitMatch) {
            const parsedName = manualSplitMatch.groups?.name;
            if (!parsedName) {
                throw new Error(`Failed to parse name out of "${splitId}"`);
            }
            autosplitId = "ManualSplit";
            name = parsedName;
        }

        const subSplitMatch = SUB_SPLIT_RE.exec(autosplitId);
        if (subSplitMatch) {
            if (!subSplitMatch.groups) {
                throw new Error(`Failed to parse name out of "${splitId}"`);
            }
            autosplitId = subSplitMatch.groups.name;
            subsplit = true;
        }

        const splitDefinition = splitDefinitions.get(autosplitId);
        if (!splitDefinition) {
            throw new Error(`Failed to find a definition for split id ${autosplitId}`);
        }

        if (!splitIdCount.has(autosplitId)) {
            splitIdCount.set(autosplitId, 0);
        }
        const currentSplitIdCount = splitIdCount.get(autosplitId) as number;

        const nameOverride = names && names[autosplitId];
        if (nameOverride) {
            let nameTemplate = "";
            if (typeof nameOverride === "string") {
                nameTemplate = nameOverride;
            }
            else {
                nameTemplate = nameOverride[currentSplitIdCount];
            }
            if (nameTemplate) {
                name = nameTemplate.replace("%s", splitDefinition.name);
            }
        }

        if (!name) {
            name = splitDefinition.name;
        }

        let iconId = autosplitId;
        const iconOverride = icons && icons[autosplitId];
        if (typeof iconOverride === "string") {
            iconId = iconOverride;
        }
        else if (iconOverride?.length) {
            iconId = iconOverride[currentSplitIdCount];
        }

        splitIdCount.set(autosplitId, 1 + currentSplitIdCount);
        return {
            autosplitId,
            subsplit,
            name,
            iconId,
        };
    });

    parsedSplitIds.forEach(({ iconId, }) => {
        const url = allIconURLs.get(iconId);
        if (url) {
            iconURLsToFetch.add(url);
        }
    });
    if (!endTriggeringAutosplit && endingSplit?.icon) {
        const url = allIconURLs.get(endingSplit.icon);
        if (url) {
            iconURLsToFetch.add(url);
        }
    }

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

    const segments = parsedSplitIds.map(({ subsplit, name, iconId, }) => {
        const iconURL = allIconURLs.get(iconId);
        let icon = "";
        if (iconURL) {
            icon = liveSplitIconData.get(iconURL) ?? "";
        }
        const namePrefix = subsplit ? "-" : "";
        return getSegmentNode(`${namePrefix}${name}`, icon);
    });

    if (!endTriggeringAutosplit) {
        const endingSplitName = endingSplit?.name ?? categoryName;
        let icon = "";
        if (endingSplit?.icon) {
            const url = allIconURLs.get(endingSplit.icon);
            if (url) {
                icon = liveSplitIconData.get(url) ?? "";
            }

        }
        segments.push(getSegmentNode(endingSplitName, icon));
    }

    const autosplits = parsedSplitIds
        .map(({ autosplitId, }) => {
            return { Split: autosplitId, };
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
                { AutosplitStartRuns: config.startTriggeringAutosplit ?? "", },
                { Splits: autosplits, }
            ], }
        ],
    }, {
        declaration: true,
        indent: "  ",
    });

}
