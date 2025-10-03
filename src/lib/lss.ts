import xml from "../external-lib/xml.js";
import { Game } from "../store/game-slice";
import { createLiveSplitIconData } from "./image-util";
import { SplitDefinition } from "./hollowknight-splits";
import { splitsFunctions } from "./splits";
// import DefaultLayout from "./default-layout.xml";

export interface Config {
  startTriggeringAutosplit?: string;
  splitIds: Array<string>;
  names?: Record<string, string | Array<string>>;
  icons?: Record<string, string | Array<string>>;
  ordered?: boolean;
  endTriggeringAutosplit?: boolean;
  endingSplit?: {
    name?: string;
    icon?: string;
  };
  categoryName: string;
  gameName: string;
  variables?: Record<string, string>;
  offset?: string;
}

interface ParsedHKAutoSplitterSettings {
  startTriggeringAutosplit?: string;
  // autosplitIds vs splitIds: autosplitIds do not contain "-" for subsplits, splitIds can
  autosplitIds: Array<string>;
  ordered?: boolean;
  endTriggeringAutosplit: boolean;
}

interface ParsedSSAutosplitterSettings {
  autosplitIds: Array<string>;
}

interface ParsedSplitId {
  autosplitId: string;
  subsplit: boolean;
  name: string;
  iconId: string;
}

const DEFAULT_OFFSET = "00:00:00";

export const SUB_SPLIT_RE = /-(?<name>.+)/;

export function buildSplitsFileName(splitsConfig: Config): string {
  const filename = (splitsConfig?.categoryName || "splits")
    .toLowerCase() // Make file name compatible:
    .replace(/['"]/g, "") // remove ' and "
    .replace(/[^a-z0-9]/gi, "_") // replace non-alphanum with _
    .replace(/^_+|_+$/g, "") // remove outer _
    .replace(/^_+|_+$/g, "") // remove outer _
    .replace(/_{2,}/g, "_"); // join multiple _
  let suffix = "";
  if (splitsConfig.variables?.glitch) {
    const glitch = splitsConfig.variables?.glitch;
    switch (glitch) {
      case "No Main Menu Storage":
        suffix = "-nmms";
        break;
      case "All Glitches":
        suffix = "-ag";
        break;
      default:
        break; // nmg categories don't need suffix
    }
  }
  return `${filename}${suffix}`;
}

function boolRepr(bool: boolean): string {
  return bool ? "True" : "False";
}

function getSegmentNode(name: string, iconData?: string): xml.XmlObject {
  const iconNode: xml.XmlObject = {
    Icon: iconData ? { _cdata: iconData } : "",
  };
  return {
    Segment: [
      { Name: name },
      iconNode,
      { SplitTimes: [{ SplitTime: { _attr: { name: "Personal Best" } } }] },
      { BestSegmentTime: "" },
      { SegmentHistory: "" },
    ],
  };
}

function getVariableNode(name: string, value: string): xml.XmlObject {
  return {
    Variable: [{ _attr: { name } }, value],
  };
}

function getVariablesNode(config: Config): xml.XmlObject {
  const variablesNode = { Variables: [] as Array<xml.XmlObject> };

  if (config.variables) {
    for (const [key, value] of Object.entries(config.variables)) {
      variablesNode.Variables.push(getVariableNode(key, value));
    }
  }

  return variablesNode;
}

function getMetadataNode(config: Config): xml.XmlObject {
  const platformAttr = { _attr: { usesEmulator: boolRepr(false) } };
  const platformNode = config.variables?.platform
    ? { Platform: [platformAttr, config.variables.platform] }
    : { Platform: platformAttr };

  return {
    Metadata: [
      { Run: { _attr: { id: "" } } },
      platformNode,
      getVariablesNode(config),
    ],
  };
}

function isAutosplitIdSubsplit(autosplitId: string): {
  subsplit: boolean;
  autosplitId: string;
} {
  const subSplitMatch = SUB_SPLIT_RE.exec(autosplitId);
  if (subSplitMatch) {
    if (!subSplitMatch.groups) {
      throw new Error(`Failed to parse name out of "${autosplitId}"`);
    }
    return { subsplit: true, autosplitId: subSplitMatch.groups.name };
  } else {
    return { subsplit: false, autosplitId };
  }
}

const SILKSONG_SCRIPT_NAME_NODE = {
  Setting: {
    _attr: {
      id: "script_name",
      type: "string",
      value: "silksong_autosplit_wasm",
    },
  },
};

export async function createSplitsXml(
  config: Config,
  game: Game
): Promise<string> {
  const {
    ordered = true,
    endTriggeringAutosplit = true,
    endingSplit,
    categoryName,
    gameName,
    names,
    icons,
    offset,
  } = config;

  // for silksong, first autosplit is start trigger
  const splitIds =
    game === "silksong" ? config.splitIds.slice(1) : config.splitIds;
  const autosplitIds = config.splitIds;

  const { parseSplitsDefinitions, getIconURLs } = splitsFunctions(game);

  const splitDefinitions = parseSplitsDefinitions();
  const allIconURLs = getIconURLs();
  const iconURLsToFetch = new Set<string>();
  const liveSplitIconData = new Map<string, string>();

  const splitIdCount = new Map<string, number>();
  const parsedSplitIds: ParsedSplitId[] = splitIds.map((splitId) => {
    let name = "";

    const { subsplit, autosplitId } = isAutosplitIdSubsplit(splitId);

    const splitDefinition = splitDefinitions.get(autosplitId);
    if (!splitDefinition) {
      throw new Error(
        `Failed to find a definition for split id ${autosplitId}`
      );
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
      } else {
        nameTemplate = nameOverride[currentSplitIdCount];
      }
      if (nameTemplate) {
        name = nameTemplate.replace(
          new RegExp("%s", "g"),
          splitDefinition.name
        );
      }
    }

    if (!name) {
      name = splitDefinition.name;
    }

    let iconId = autosplitId;
    const iconOverride = icons && icons[autosplitId];
    if (typeof iconOverride === "string") {
      iconId = iconOverride;
    } else if (iconOverride?.length) {
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

  parsedSplitIds.forEach(({ iconId }) => {
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
    [...iconURLsToFetch].map(async (url) => {
      try {
        const iconData = await createLiveSplitIconData(url);
        liveSplitIconData.set(url, iconData);
      } catch (e) {
        console.error(`Failed to create icon data for ${url}`);
        console.error(e);
      }
    })
  );

  const segments = parsedSplitIds.map(({ subsplit, name, iconId }) => {
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

  const autosplits = autosplitIds.map((splitId) => {
    const { autosplitId } = isAutosplitIdSubsplit(splitId);
    return { Split: autosplitId };
  });

  const silksongAutosplits = autosplitIds.map((splitId) => {
    const { autosplitId } = isAutosplitIdSubsplit(splitId);
    return { Setting: [{ _attr: { type: "string", value: autosplitId } }] };
  });

  let autosplitterSettings: Array<xml.XmlObject> = [];
  switch (game) {
    case "hollowknight":
      autosplitterSettings = [
        { Ordered: boolRepr(ordered) },
        { AutosplitEndRuns: boolRepr(endTriggeringAutosplit) },
        { AutosplitStartRuns: config.startTriggeringAutosplit ?? "" },
        { Splits: autosplits },
      ];
      break;
    case "silksong":
      autosplitterSettings = [
        { Version: "1.0" },
        {
          CustomSettings: [
            SILKSONG_SCRIPT_NAME_NODE,
            {
              Setting: [
                { _attr: { id: "splits", type: "list" } },
                ...silksongAutosplits,
              ],
            },
          ],
        },
      ];
      break;
    default:
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      throw new Error(`Invalid game ${game}`);
  }

  return xml(
    {
      Run: [
        { _attr: { version: "1.7.0" } },
        { GameIcon: "" },
        { GameName: gameName },
        { CategoryName: categoryName },
        getMetadataNode(config),
        { Offset: offset ?? DEFAULT_OFFSET },
        { AttemptCount: "0" },
        { AttemptHistory: "" },
        { Segments: segments },
        { AutoSplitterSettings: autosplitterSettings },
      ],
    },
    {
      declaration: true,
      indent: "  ",
    }
  );
}

function makeAutoSplittingRuntimeComponent(
  splitIds: Array<string>
): Record<string, unknown> {
  const splitList = [
    {
      Setting: [
        { _attr: { id: "splits", type: "list" } },
        ...splitIds.map((name) => ({
          Setting: { _attr: { type: "string", value: name } },
        })),
      ],
    },
    ...splitIds.map((name, i) => ({
      Setting: {
        _attr: { id: `splits_${i}_item`, type: "string", value: name },
      },
    })),
    {
      Setting: [{ _attr: { id: "hit_counter", type: "bool" } }, "True"],
    },
    {
      Setting: [{ _attr: { id: "splits_insert_0", type: "bool" } }, "False"],
    },
    ...splitIds.map((_, i) => ({
      Setting: {
        _attr: { id: `splits_${i}_action`, type: "string", value: "None" },
      },
    })),
  ];

  return {
    Component: [
      { Path: "LiveSplit.AutoSplittingRuntime.dll" },
      {
        Settings: [
          { Version: "1.0" },
          { ScriptPath: "C:\\silksong_autosplit_wasm_stable.wasm" },
          { CustomSettings: [SILKSONG_SCRIPT_NAME_NODE, ...splitList] },
        ],
      },
    ],
  };
}

export function createLayoutXml(config: Config, game: Game): string {
  if (game !== "silksong") {
    throw new Error("layout generation only supported for silksong");
  }
  const layoutObj = [
    {
      Layout: [
        { _attr: { version: "1.6.1" } },
        { Mode: "Vertical" },
        { X: "0" },
        { Y: "0" },
        { VerticalWidth: "286" },
        { VerticalHeight: "519" },
        { HorizontalWidth: "-1" },
        { HorizontalHeight: "-1" },
        {
          Settings: [
            { TextColor: "FFFFFFFF" },
            { BackgroundColor: "FF0F0F0F" },
            { BackgroundColor2: "00000000" },
            { ThinSeparatorsColor: "03FFFFFF" },
            { SeparatorsColor: "24FFFFFF" },
            { PersonalBestColor: "FF16A6FF" },
            { AheadGainingTimeColor: "FF00CC36" },
            { AheadLosingTimeColor: "FF52CC73" },
            { BehindGainingTimeColor: "FFCC5C52" },
            { BehindLosingTimeColor: "FFCC1200" },
            { BestSegmentColor: "FFD8AF1F" },
            { UseRainbowColor: "False" },
            { NotRunningColor: "FFACACAC" },
            { PausedColor: "FF7A7A7A" },
            { TextOutlineColor: "00000000" },
            { ShadowsColor: "80000000" },
            {
              TimesFont: {
                _cdata:
                  "AAEAAAD/////AQAAAAAAAAAMAgAAAFFTeXN0ZW0uRHJhd2luZywgVmVyc2lvbj00LjAuMC4wLCBDdWx0dXJlPW5ldXRyYWwsIFB1YmxpY0tleVRva2VuPWIwM2Y1ZjdmMTFkNTBhM2EFAQAAABNTeXN0ZW0uRHJhd2luZy5Gb250BAAAAAROYW1lBFNpemUFU3R5bGUEVW5pdAEABAQLGFN5c3RlbS5EcmF3aW5nLkZvbnRTdHlsZQIAAAAbU3lzdGVtLkRyYXdpbmcuR3JhcGhpY3NVbml0AgAAAAIAAAAGAwAAAAhTZWdvZSBVSQAAgEEF/P///xhTeXN0ZW0uRHJhd2luZy5Gb250U3R5bGUBAAAAB3ZhbHVlX18ACAIAAAABAAAABfv///8bU3lzdGVtLkRyYXdpbmcuR3JhcGhpY3NVbml0AQAAAAd2YWx1ZV9fAAgCAAAAAgAAAAs=",
              },
            },
            {
              TimerFont: {
                _cdata:
                  "AAEAAAD/////AQAAAAAAAAAMAgAAAFFTeXN0ZW0uRHJhd2luZywgVmVyc2lvbj00LjAuMC4wLCBDdWx0dXJlPW5ldXRyYWwsIFB1YmxpY0tleVRva2VuPWIwM2Y1ZjdmMTFkNTBhM2EFAQAAABNTeXN0ZW0uRHJhd2luZy5Gb250BAAAAAROYW1lBFNpemUFU3R5bGUEVW5pdAEABAQLGFN5c3RlbS5EcmF3aW5nLkZvbnRTdHlsZQIAAAAbU3lzdGVtLkRyYXdpbmcuR3JhcGhpY3NVbml0AgAAAAIAAAAGAwAAAAdDYWxpYnJpAAAvQgX8////GFN5c3RlbS5EcmF3aW5nLkZvbnRTdHlsZQEAAAAHdmFsdWVfXwAIAgAAAAEAAAAF+////xtTeXN0ZW0uRHJhd2luZy5HcmFwaGljc1VuaXQBAAAAB3ZhbHVlX18ACAIAAAACAAAACw==",
              },
            },
            {
              TextFont: {
                _cdata:
                  "AAEAAAD/////AQAAAAAAAAAMAgAAAFFTeXN0ZW0uRHJhd2luZywgVmVyc2lvbj00LjAuMC4wLCBDdWx0dXJlPW5ldXRyYWwsIFB1YmxpY0tleVRva2VuPWIwM2Y1ZjdmMTFkNTBhM2EFAQAAABNTeXN0ZW0uRHJhd2luZy5Gb250BAAAAAROYW1lBFNpemUFU3R5bGUEVW5pdAEABAQLGFN5c3RlbS5EcmF3aW5nLkZvbnRTdHlsZQIAAAAbU3lzdGVtLkRyYXdpbmcuR3JhcGhpY3NVbml0AgAAAAIAAAAGAwAAAAhTZWdvZSBVSQAAgEEF/P///xhTeXN0ZW0uRHJhd2luZy5Gb250U3R5bGUBAAAAB3ZhbHVlX18ACAIAAAAAAAAABfv///8bU3lzdGVtLkRyYXdpbmcuR3JhcGhpY3NVbml0AQAAAAd2YWx1ZV9fAAgCAAAAAgAAAAs=",
              },
            },
            { AlwaysOnTop: "True" },
            { ShowBestSegments: "True" },
            { AntiAliasing: "True" },
            { DropShadows: "True" },
            { BackgroundType: "SolidColor" },
            { BackgroundImage: {} },
            { ImageOpacity: "1" },
            { ImageBlur: "0" },
            { Opacity: "1" },
            { MousePassThroughWhileRunning: "False" },
          ],
        },
        {
          Components: [
            makeAutoSplittingRuntimeComponent(config.splitIds),
            {
              Component: [
                { Path: "LiveSplit.Title.dll" },
                {
                  Settings: [
                    { Version: "1.7.3" },
                    { ShowGameName: "True" },
                    { ShowCategoryName: "True" },
                    { ShowAttemptCount: "True" },
                    { ShowFinishedRunsCount: "False" },
                    { OverrideTitleFont: "False" },
                    { OverrideTitleColor: "False" },
                    {
                      TitleFont: {
                        _cdata:
                          "AAEAAAD/////AQAAAAAAAAAMAgAAAFFTeXN0ZW0uRHJhd2luZywgVmVyc2lvbj00LjAuMC4wLCBDdWx0dXJlPW5ldXRyYWwsIFB1YmxpY0tleVRva2VuPWIwM2Y1ZjdmMTFkNTBhM2EFAQAAABNTeXN0ZW0uRHJhd2luZy5Gb250BAAAAAROYW1lBFNpemUFU3R5bGUEVW5pdAEABAQLGFN5c3RlbS5EcmF3aW5nLkZvbnRTdHlsZQIAAAAbU3lzdGVtLkRyYXdpbmcuR3JhcGhpY3NVbml0AgAAAAIAAAAGAwAAAAhTZWdvZSBVSQAAgEEF/P///xhTeXN0ZW0uRHJhd2luZy5Gb250U3R5bGUBAAAAB3ZhbHVlX18ACAIAAAAAAAAABfv///8bU3lzdGVtLkRyYXdpbmcuR3JhcGhpY3NVbml0AQAAAAd2YWx1ZV9fAAgCAAAAAgAAAAs=",
                      },
                    },
                    { SingleLine: "False" },
                    { TitleColor: "FFFFFFFF" },
                    { BackgroundColor: "FF2A2A2A" },
                    { BackgroundColor2: "FF131313" },
                    { BackgroundGradient: "Vertical" },
                    { DisplayGameIcon: "True" },
                    { ShowRegion: "False" },
                    { ShowPlatform: "False" },
                    { ShowVariables: "True" },
                    { TextAlignment: "0" },
                  ],
                },
              ],
            },
            {
              Component: [
                { Path: "LiveSplit.Splits.dll" },
                {
                  Settings: [
                    { Version: "1.6" },
                    { CurrentSplitTopColor: "FF3373F4" },
                    { CurrentSplitBottomColor: "FF153574" },
                    { VisualSplitCount: "16" },
                    { SplitPreviewCount: "1" },
                    { DisplayIcons: "True" },
                    { ShowThinSeparators: "True" },
                    { AlwaysShowLastSplit: "True" },
                    { SplitWidth: "20" },
                    { SplitTimesAccuracy: "Seconds" },
                    { AutomaticAbbreviations: "False" },
                    { BeforeNamesColor: "FFFFFFFF" },
                    { CurrentNamesColor: "FFFFFFFF" },
                    { AfterNamesColor: "FFFFFFFF" },
                    { OverrideTextColor: "False" },
                    { BeforeTimesColor: "FFFFFFFF" },
                    { CurrentTimesColor: "FFFFFFFF" },
                    { AfterTimesColor: "FFFFFFFF" },
                    { OverrideTimesColor: "False" },
                    { ShowBlankSplits: "True" },
                    { LockLastSplit: "True" },
                    { IconSize: "24" },
                    { IconShadows: "True" },
                    { SplitHeight: "3.6" },
                    { CurrentSplitGradient: "Vertical" },
                    { BackgroundColor: "00FFFFFF" },
                    { BackgroundColor2: "01FFFFFF" },
                    { BackgroundGradient: "Alternating" },
                    { SeparatorLastSplit: "True" },
                    { DeltasAccuracy: "Tenths" },
                    { DropDecimals: "True" },
                    { OverrideDeltasColor: "False" },
                    { DeltasColor: "FFFFFFFF" },
                    { Display2Rows: "False" },
                    { ShowColumnLabels: "False" },
                    { LabelsColor: "FFFFFFFF" },
                    {
                      Columns: [
                        {
                          Settings: [
                            { Version: "1.5" },
                            { Name: "+/-" },
                            { Type: "Delta" },
                            { Comparison: "Current Comparison" },
                            { TimingMethod: "Current Timing Method" },
                          ],
                        },
                        {
                          Settings: [
                            { Version: "1.5" },
                            { Name: "Time" },
                            { Type: "SplitTime" },
                            { Comparison: "Current Comparison" },
                            { TimingMethod: "Current Timing Method" },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              Component: [
                { Path: "LiveSplit.Timer.dll" },
                {
                  Settings: [
                    { Version: "1.5" },
                    { TimerHeight: "69" },
                    { TimerWidth: "225" },
                    { TimerFormat: "1.23" },
                    { OverrideSplitColors: "False" },
                    { ShowGradient: "True" },
                    { TimerColor: "FFAAAAAA" },
                    { BackgroundColor: "00000000" },
                    { BackgroundColor2: "FF222222" },
                    { BackgroundGradient: "Plain" },
                    { CenterTimer: "False" },
                    { TimingMethod: "Current Timing Method" },
                    { DecimalsSize: "35" },
                  ],
                },
              ],
            },
            {
              Component: [
                { Path: "LiveSplit.PreviousSegment.dll" },
                {
                  Settings: [
                    { Version: "1.6" },
                    { TextColor: "FFFFFFFF" },
                    { OverrideTextColor: "False" },
                    { BackgroundColor: "FF1C1C1C" },
                    { BackgroundColor2: "FF0D0D0D" },
                    { BackgroundGradient: "Vertical" },
                    { DeltaAccuracy: "Tenths" },
                    { DropDecimals: "True" },
                    { Comparison: "Current Comparison" },
                    { Display2Rows: "False" },
                    { ShowPossibleTimeSave: "False" },
                    { TimeSaveAccuracy: "Tenths" },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ];
  return xml(layoutObj, {
    declaration: true,
    indent: "  ",
  });
}

function transformNameOverrideForImport(
  nameOverride: string,
  splitDefinition?: SplitDefinition
): string {
  if (nameOverride === "") {
    return "%s";
  }
  if (splitDefinition?.name && nameOverride.includes(splitDefinition?.name)) {
    return nameOverride.replace(new RegExp(splitDefinition.name, "g"), "%s");
  }
  return nameOverride;
}

function getTextContent(element: Element | ChildNode): string | undefined {
  return element.textContent?.trim();
}

function getTextContentByTagName(
  element: Element | Document,
  tagName: string
): string | undefined {
  const elementByTagName = element.getElementsByTagName(tagName)[0];
  return elementByTagName ? getTextContent(elementByTagName) : "";
}

function parseHKAutoSplitterSettings(
  autoSplitterSettings: Element
): ParsedHKAutoSplitterSettings {
  const xmlDocSplits = autoSplitterSettings.getElementsByTagName("Splits")[0];
  const xmlDocCustomSettings =
    autoSplitterSettings.getElementsByTagName("CustomSettings")[0];
  if (xmlDocSplits) {
    // Default autosplitter
    const autosplitEndRuns = getTextContentByTagName(
      autoSplitterSettings,
      "AutosplitEndRuns"
    );
    const orderedStr = getTextContentByTagName(autoSplitterSettings, "Ordered");
    const autoStart =
      getTextContentByTagName(autoSplitterSettings, "AutosplitStartRuns") || "";
    // autosplitIds vs splitIds: autosplitIds do not contain "-" for subsplits, splitIds can
    const autosplitIds: Array<string> = [];
    xmlDocSplits.childNodes.forEach((c) => {
      if (c.nodeName === "Split") {
        const autosplitId = getTextContent(c) || "";
        autosplitIds.push(autosplitId);
      }
    });
    const endTriggeringAutosplit = autosplitEndRuns == "True";
    return {
      ordered: orderedStr == "True",
      startTriggeringAutosplit: autoStart.length > 0 ? autoStart : undefined,
      autosplitIds,
      endTriggeringAutosplit,
    };
  } else if (xmlDocCustomSettings) {
    // WASM autosplitter
    const xmlDocSettings = xmlDocCustomSettings.getElementsByTagName("Setting");
    const autostartsplitIds: Array<string> = [];
    for (let i = 0; i < xmlDocSettings.length; i++) {
      if (xmlDocSettings[i].getAttribute("id") == "splits") {
        const xmlDocSplitsSettings =
          xmlDocSettings[i].getElementsByTagName("Setting");
        for (let j = 0; j < xmlDocSplitsSettings.length; j++) {
          autostartsplitIds.push(
            xmlDocSplitsSettings[j].getAttribute("value") || ""
          );
        }
      }
    }
    const autostartId = autostartsplitIds[0];
    return {
      ordered: true,
      startTriggeringAutosplit:
        autostartId == "LegacyStart" ? undefined : autostartId,
      autosplitIds: autostartsplitIds.slice(1),
      endTriggeringAutosplit: true,
    };
  } else {
    throw new Error(
      `Failed to import splits: missing AutoSplitterSettings Splits`
    );
  }
}

function parseSSAutoSplitterSettings(
  autoSplitterSettings: Element
): ParsedSSAutosplitterSettings {
  const xmlDocCustomSettings =
    autoSplitterSettings.getElementsByTagName("CustomSettings")[0];
  const xmlDocSplits = xmlDocCustomSettings.querySelector('[id="splits"]');
  if (!xmlDocSplits) {
    throw new Error("Failed to import splits: missing splits");
  }
  const autosplitIds: Array<string> = [];
  const xmlDocSettings = xmlDocSplits.getElementsByTagName("Setting");
  for (let i = 0; i < xmlDocSettings.length; i++) {
    const settingsNode = xmlDocSettings[i];
    const autosplitId = settingsNode.getAttribute("value") ?? "ManualSplit";
    autosplitIds.push(autosplitId);
  }
  return { autosplitIds };
}

function importHKSplitsXml(str: string): Config {
  // xml parse
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(str, "text/xml");
  // GameName, CategoryName -> gameName, categoryName
  const gameName =
    getTextContentByTagName(xmlDoc, "GameName") || "Hollow Knight";
  const categoryName = getTextContentByTagName(xmlDoc, "CategoryName") || "";
  const offset = getTextContentByTagName(xmlDoc, "Offset");
  // Metadata Variables -> variables
  const xmlDocVariables0 = xmlDoc.getElementsByTagName("Variables")[0];
  const xmlDocVariables =
    xmlDocVariables0 && xmlDocVariables0.getElementsByTagName("Variable");
  const potentialVariables: Record<string, string> = {};
  let hasVariables = false;
  if (xmlDocVariables && xmlDocVariables.length > 0) {
    for (let i = 0; i < xmlDocVariables.length; i++) {
      const variableName = xmlDocVariables[i].getAttribute("name");
      if (variableName) {
        potentialVariables[variableName] =
          getTextContent(xmlDocVariables[i]) || "";
        hasVariables = true;
      }
    }
  }
  // AutoSplitterSettings -> startTriggeringAutosplit, splitIds, endTriggeringAutosplit
  let autoSplitterSettings = xmlDoc.getElementsByTagName(
    "AutoSplitterSettings"
  )[0];
  if (!autoSplitterSettings) {
    const xmlDocComponents0 = xmlDoc.getElementsByTagName("Components")[0];
    const xmlDocComponents =
      (xmlDocComponents0 &&
        xmlDocComponents0.getElementsByTagName("Component")) ||
      [];
    for (let i = 0; i < xmlDocComponents.length; i++) {
      const xmlDocComponent = xmlDocComponents[i];
      const path = getTextContentByTagName(xmlDocComponent, "Path");
      if (path === "LiveSplit.AutoSplittingRuntime.dll") {
        autoSplitterSettings =
          xmlDocComponent.getElementsByTagName("Settings")[0];
        break;
      }
    }
    if (!autoSplitterSettings) {
      throw new Error(`Failed to import splits: missing AutoSplitterSettings`);
    }
  }
  const {
    ordered,
    startTriggeringAutosplit,
    autosplitIds,
    endTriggeringAutosplit,
  } = parseHKAutoSplitterSettings(autoSplitterSettings);
  if (!ordered) {
    throw new Error(`Failed to import splits: Ordered must be True to import`);
  }
  // autosplitIds vs splitIds: autosplitIds do not contain "-" for subsplits, splitIds can
  const parsedSplitIds: ParsedSplitId[] = [];
  autosplitIds.forEach((autosplitId) => {
    parsedSplitIds.push({
      autosplitId,
      subsplit: false,
      name: "",
      iconId: "",
    });
  });
  // Segments Segment Name -> names, endingSplit name
  const xmlDocSegments0 = xmlDoc.getElementsByTagName("Segments")[0];
  const segments =
    (xmlDocSegments0 && xmlDocSegments0.getElementsByTagName("Segment")) || [];
  // subsplitNames vs names: names do not contain "-" for subsplits, subsplitNames can
  let endName = "";
  for (let i = 0; i < segments.length; i++) {
    const subsegmentName = getTextContentByTagName(segments[i], "Name") || "";
    if (i < parsedSplitIds.length) {
      if (subsegmentName.startsWith("-")) {
        parsedSplitIds[i].subsplit = true;
        parsedSplitIds[i].name = subsegmentName.substring(1);
      } else {
        parsedSplitIds[i].subsplit = false;
        parsedSplitIds[i].name = subsegmentName;
      }
    } else if (i === parsedSplitIds.length) {
      // endingSplit cannot be a subsplit
      endName = subsegmentName;
    }
  }
  // Deal with "-" subsplit markers
  const splitIds: string[] = parsedSplitIds.map(({ autosplitId, subsplit }) => {
    const namePrefix = subsplit ? "-" : "";
    return `${namePrefix}${autosplitId}`;
  });
  const uniqueAutosplitIds: Set<string> = new Set(
    parsedSplitIds.map(({ autosplitId }) => autosplitId)
  );
  const { parseSplitsDefinitions } = splitsFunctions("hollowknight");
  const splitDefinitions = parseSplitsDefinitions();
  const potentialNameOverrides: Record<string, string | string[]> = {};
  let hasNameOverrides = false;
  uniqueAutosplitIds.forEach((uniqueAutosplitId) => {
    const splitNames = parsedSplitIds
      .filter(({ autosplitId }) => autosplitId === uniqueAutosplitId)
      .map(({ name }) => name);
    const splitDefinition = splitDefinitions.get(uniqueAutosplitId);
    if (
      splitDefinition &&
      splitNames.every(
        (aName) => aName === "" || aName === splitDefinition.name
      )
    ) {
      // do nothing
    } else if (splitNames.length === 1) {
      potentialNameOverrides[uniqueAutosplitId] =
        transformNameOverrideForImport(splitNames[0], splitDefinition);
      hasNameOverrides = true;
    } else {
      const nameOverrides = [...splitNames];
      nameOverrides.forEach((nameOverride, index) => {
        nameOverrides[index] = transformNameOverrideForImport(
          nameOverride,
          splitDefinition
        );
      });

      potentialNameOverrides[uniqueAutosplitId] = nameOverrides;
      hasNameOverrides = true;
    }
  });
  let config: Config = {
    categoryName,
    startTriggeringAutosplit,
    splitIds,
    names: hasNameOverrides ? potentialNameOverrides : undefined,
    endTriggeringAutosplit,
    endingSplit: endName.length > 0 ? { name: endName } : undefined,
    gameName,
    variables: hasVariables ? potentialVariables : undefined,
  };
  if (offset && offset !== DEFAULT_OFFSET) {
    config = { offset, ...config };
  }
  return config;
}

function importSSSplitsXml(str: string): Config {
  // xml parse
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(str, "text/xml");
  // GameName, CategoryName -> gameName, categoryName
  const gameName =
    getTextContentByTagName(xmlDoc, "GameName") || "Hollow Knight: Silksong";
  const categoryName =
    getTextContentByTagName(xmlDoc, "CategoryName") || "Any%";
  const offset = getTextContentByTagName(xmlDoc, "Offset") || DEFAULT_OFFSET;
  // Metadata Variables -> variables
  const xmlDocVariables0 = xmlDoc.getElementsByTagName("Variables")[0];
  const xmlDocVariables =
    xmlDocVariables0 && xmlDocVariables0.getElementsByTagName("Variable");
  const potentialVariables: Record<string, string> = {};
  let hasVariables = false;
  if (xmlDocVariables && xmlDocVariables.length > 0) {
    for (let i = 0; i < xmlDocVariables.length; i++) {
      const variableName = xmlDocVariables[i].getAttribute("name");
      if (variableName) {
        potentialVariables[variableName] =
          getTextContent(xmlDocVariables[i]) || "";
        hasVariables = true;
      }
    }
  }
  let autoSplitterSettings = xmlDoc.getElementsByTagName(
    "AutoSplitterSettings"
  )[0];
  if (!autoSplitterSettings) {
    const xmlDocComponents0 = xmlDoc.getElementsByTagName("Components")[0];
    const xmlDocComponents =
      (xmlDocComponents0 &&
        xmlDocComponents0.getElementsByTagName("Component")) ||
      [];
    for (let i = 0; i < xmlDocComponents.length; i++) {
      const xmlDocComponent = xmlDocComponents[i];
      const path = getTextContentByTagName(xmlDocComponent, "Path");
      if (path === "LiveSplit.AutoSplittingRuntime.dll") {
        autoSplitterSettings =
          xmlDocComponent.getElementsByTagName("Settings")[0];
        break;
      }
    }
    if (!autoSplitterSettings) {
      throw new Error(`Failed to import splits: missing AutoSplitterSettings`);
    }
  }
  const { autosplitIds } = parseSSAutoSplitterSettings(autoSplitterSettings);
  // autosplitIds vs splitIds: autosplitIds do not contain "-" for subsplits, splitIds can
  const parsedSplitIds: ParsedSplitId[] = [];
  autosplitIds.forEach((autosplitId) => {
    parsedSplitIds.push({
      autosplitId,
      subsplit: false,
      name: "",
      iconId: "",
    });
  });
  // Segments Segment Name -> names, endingSplit name
  const xmlDocSegments0 = xmlDoc.getElementsByTagName("Segments")[0];
  const segments =
    (xmlDocSegments0 && xmlDocSegments0.getElementsByTagName("Segment")) || [];
  // subsplitNames vs names: names do not contain "-" for subsplits, subsplitNames can
  let endName = "";
  for (let i = 0; i < segments.length; i++) {
    const subsegmentName = getTextContentByTagName(segments[i], "Name") || "";
    if (i < parsedSplitIds.length) {
      // segments are offset by one because start trigger is in list
      if (subsegmentName.startsWith("-")) {
        parsedSplitIds[i + 1].subsplit = true;
        parsedSplitIds[i + 1].name = subsegmentName.substring(1);
      } else {
        parsedSplitIds[i + 1].subsplit = false;
        parsedSplitIds[i + 1].name = subsegmentName;
      }
    } else if (i === parsedSplitIds.length) {
      // endingSplit cannot be a subsplit
      endName = subsegmentName;
    }
  }
  // Deal with "-" subsplit markers
  const splitIds: string[] = parsedSplitIds.map(({ autosplitId, subsplit }) => {
    const namePrefix = subsplit ? "-" : "";
    return `${namePrefix}${autosplitId}`;
  });
  const uniqueAutosplitIds: Set<string> = new Set(
    parsedSplitIds.map(({ autosplitId }) => autosplitId)
  );
  const { parseSplitsDefinitions } = splitsFunctions("silksong");
  const splitDefinitions = parseSplitsDefinitions();
  const potentialNameOverrides: Record<string, string | string[]> = {};
  let hasNameOverrides = false;
  uniqueAutosplitIds.forEach((uniqueAutosplitId) => {
    const splitNames = parsedSplitIds
      .filter(({ autosplitId }) => autosplitId === uniqueAutosplitId)
      .map(({ name }) => name);
    const splitDefinition = splitDefinitions.get(uniqueAutosplitId);
    if (
      splitDefinition &&
      splitNames.every(
        (aName) => aName === "" || aName === splitDefinition.name
      )
    ) {
      // do nothing
    } else if (splitNames.length === 1) {
      potentialNameOverrides[uniqueAutosplitId] =
        transformNameOverrideForImport(splitNames[0], splitDefinition);
      hasNameOverrides = true;
    } else {
      const nameOverrides = [...splitNames];
      nameOverrides.forEach((nameOverride, index) => {
        nameOverrides[index] = transformNameOverrideForImport(
          nameOverride,
          splitDefinition
        );
      });

      potentialNameOverrides[uniqueAutosplitId] = nameOverrides;
      hasNameOverrides = true;
    }
  });
  let config: Config = {
    categoryName,
    splitIds,
    names: hasNameOverrides ? potentialNameOverrides : undefined,
    endingSplit: endName.length > 0 ? { name: endName } : undefined,
    gameName,
    variables: hasVariables ? potentialVariables : undefined,
  };
  if (offset && offset !== DEFAULT_OFFSET) {
    config = { offset, ...config };
  }
  return config;
}

export function importSplitsXml(str: string, game: Game): Config {
  switch (game) {
    case "hollowknight":
      return importHKSplitsXml(str);
    case "silksong":
      return importSSSplitsXml(str);
    default:
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      throw new Error(`invalid game ${game}`);
  }
}
