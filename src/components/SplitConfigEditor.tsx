import JSON5 from "json5";
import type { editor } from "monaco-editor";
import type { ReactElement, ReactNode } from "react";
import { lazy, Suspense, useCallback, useRef } from "react";
import {
  TiArrowMaximise,
  TiArrowMinimise,
  TiArrowMove,
  TiChevronRight,
  TiDelete,
  TiPlus,
} from "react-icons/ti";
import type { ItemInterface } from "react-sortablejs";
import { ReactSortable } from "react-sortablejs";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import { useCurrentGame } from "../hooks";
import { parseSplitsDefinitions as hollowKnightParseSplitsDefinitions } from "../lib/hollowknight-splits";
import type { Config } from "../lib/lss";
import { SUB_SPLIT_RE } from "../lib/lss";
import { parseSplitsDefinitions as silksongParseSplitsDefinitions } from "../lib/silksong-splits";
import type { SplitOption } from "./SplitSelect";
import SplitSelect from "./SplitSelect";
import Tooltip from "./Tooltip";
import "react-tabs/style/react-tabs.css";

const SplitConfigJsonEditor = lazy(() => import("./SplitConfigJsonEditor"));

interface Props {
  value: string;
  onChange: (value: string | undefined) => void;
}

const hkSplitDefinitions = hollowKnightParseSplitsDefinitions();
const ssSplitDefinitions = silksongParseSplitsDefinitions();

type SplitOptionWithSubsplit = SplitOption & {
  subsplit: boolean;
};
function useSplitOption(splitId: string): SplitOptionWithSubsplit | undefined {
  let autosplitId = splitId;
  let subsplit = false;
  const subSplitMatch = SUB_SPLIT_RE.exec(autosplitId);
  if (subSplitMatch) {
    if (!subSplitMatch.groups) {
      throw new Error(`Failed to parse name out of "${splitId}"`);
    }
    autosplitId = subSplitMatch.groups.name;
    subsplit = true;
  }
  const game = useCurrentGame();
  const splitDefinitions =
    game === "hollowknight" ? hkSplitDefinitions : ssSplitDefinitions;
  const split = splitDefinitions.get(autosplitId);
  if (!split) {
    return undefined;
  }
  return {
    value: split.id,
    label: split.description,
    tooltip: split.tooltip,
    subsplit,
  };
}

function SubsplitIndicator(): ReactNode {
  return (
    <Tooltip content="This is a subsplit">
      <TiChevronRight size="1.5em" />
    </Tooltip>
  );
}

function MoveAnchor(): ReactNode {
  return (
    <span style={{ cursor: "grab" }}>
      <TiArrowMove size="1.5em" />
    </span>
  );
}

interface DeleteAutosplitProps {
  index: number;
  onChange: (newConfig: Partial<Config>) => void;
  parsedConfig: Partial<Config>;
}

function DeleteAutosplit({
  index,
  onChange,
  parsedConfig,
}: DeleteAutosplitProps): ReactNode {
  const deleteOnChange = useCallback((): void => {
    if (!parsedConfig.splitIds) {
      return;
    }
    onChange({
      ...parsedConfig,
      splitIds: [
        ...parsedConfig.splitIds.slice(0, index),
        ...parsedConfig.splitIds.slice(index + 1),
      ],
    });
  }, [index, onChange, parsedConfig]);
  return (
    <Tooltip content="Delete this autosplit">
      <TiDelete
        size="1.5em"
        style={{ cursor: "pointer" }}
        onClick={deleteOnChange}
      />
    </Tooltip>
  );
}

interface AddAutosplitProps {
  index: number;
  parsedConfig: Partial<Config>;
  onChange: (newConfig: Partial<Config>) => void;
}

function AddAutosplit({
  parsedConfig,
  onChange,
  index,
}: AddAutosplitProps): ReactNode {
  const game = useCurrentGame();
  const defaultSplit = game === "hollowknight" ? "AbyssShriek" : "SilkSpear";
  const addOnChange = useCallback((): void => {
    if (!parsedConfig.splitIds) {
      return;
    }
    onChange({
      ...parsedConfig,
      splitIds: [
        ...parsedConfig.splitIds.slice(0, index + 1),
        defaultSplit,
        ...parsedConfig.splitIds.slice(index + 1),
      ],
    });
  }, [parsedConfig, index, onChange, defaultSplit]);
  return (
    <div style={{ alignItems: "center", display: "flex" }}>
      <TiPlus size="1em" style={{ cursor: "pointer" }} onClick={addOnChange} />
      <span>Add autosplit</span>
    </div>
  );
}

interface AddFirstAutosplitProps {
  parsedConfig: Partial<Config>;
  onChange: (newConfig: Partial<Config>) => void;
}

function AddFirstAutosplit({
  parsedConfig,
  onChange,
}: AddFirstAutosplitProps): ReactNode {
  const addOnChange = useCallback((): void => {
    if (!parsedConfig) {
      return;
    }
    onChange({
      ...parsedConfig,
      splitIds: ["AbyssShriek"],
    });
  }, [parsedConfig, onChange]);
  return (
    <div style={{ alignItems: "center", display: "flex" }}>
      <TiPlus
        size="1.5em"
        style={{ cursor: "pointer" }}
        onClick={addOnChange}
      />
      <span style={{ fontSize: "1.5em" }}>Add autosplit</span>
    </div>
  );
}

interface ToggleSubsplitProps {
  index: number;
  subsplit?: boolean;
  parsedConfig: Partial<Config>;
  onChange: (newConfig: Partial<Config>) => void;
}

function ToggleSubsplit({
  index,
  subsplit,
  parsedConfig,
  onChange,
}: ToggleSubsplitProps): ReactNode {
  const Component = subsplit ? TiArrowMaximise : TiArrowMinimise;
  const tooltip = subsplit ? "Convert to normal split" : "Convert to subsplit";
  const toggleOnClick = useCallback((): void => {
    if (!parsedConfig.splitIds) {
      return;
    }
    const currentSplit = parsedConfig.splitIds[index];
    const toggledSplit = subsplit ? currentSplit.slice(1) : `-${currentSplit}`;
    onChange({
      ...parsedConfig,
      splitIds: [
        ...parsedConfig.splitIds.slice(0, index),
        toggledSplit,
        ...parsedConfig.splitIds.slice(index + 1),
      ],
    });
  }, [index, parsedConfig, onChange, subsplit]);
  return (
    <Tooltip content={tooltip}>
      <Component
        size="1.5em"
        style={{ cursor: "pointer" }}
        onClick={toggleOnClick}
      />
    </Tooltip>
  );
}

interface SingleAutosplitSelectProps {
  splitId: string;
  index: number;
  parsedConfig: Partial<Config>;
  onChange: (newConfig: Partial<Config>) => void;
}

function SingleAutosplitSelect({
  splitId,
  index,
  parsedConfig,
  onChange,
}: SingleAutosplitSelectProps): ReactNode {
  const value = useSplitOption(splitId);
  const splitSelectOnChange = useCallback(
    (val: SplitOption | null): void => {
      if (!(parsedConfig.splitIds && val)) {
        return;
      }
      onChange({
        ...parsedConfig,
        splitIds: [
          ...parsedConfig.splitIds.slice(0, index),
          `${value?.subsplit ? "-" : ""}${val.value}`,
          ...parsedConfig.splitIds.slice(index + 1),
        ],
      });
    },
    [index, onChange, parsedConfig, value],
  );
  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
        }}
      >
        <MoveAnchor />
        {value?.subsplit && <SubsplitIndicator />}
        <SplitSelect
          value={value}
          controlStyleOverrides={{ margin: "8px 8px 8px 8px" }}
          onChange={splitSelectOnChange}
        />
        <DeleteAutosplit
          index={index}
          onChange={onChange}
          parsedConfig={parsedConfig}
        />
        <ToggleSubsplit
          index={index}
          subsplit={value?.subsplit}
          onChange={onChange}
          parsedConfig={parsedConfig}
        />
      </div>
      <AddAutosplit
        index={index}
        parsedConfig={parsedConfig}
        onChange={onChange}
      />
    </div>
  );
}

interface EndTriggeringAutosplitProps {
  parsedConfig: Partial<Config>;
  onChange: (newConfig: Partial<Config>) => void;
}
function EndTriggeringAutosplit({
  onChange,
  parsedConfig,
}: EndTriggeringAutosplitProps): ReactNode {
  const message = parsedConfig.endTriggeringAutosplit
    ? "Time will end on last autosplit"
    : "Time will end on game-ending/credits";
  const inputOnChange = useCallback((): void => {
    onChange({
      ...parsedConfig,
      endTriggeringAutosplit: !parsedConfig.endTriggeringAutosplit,
    });
  }, [parsedConfig, onChange]);
  return (
    <>
      <div style={{ fontSize: "1.5em", margin: "5px" }}>
        <input
          id="end-triggering-autosplit"
          type="checkbox"
          onChange={inputOnChange}
          checked={parsedConfig.endTriggeringAutosplit ?? false}
        />
        <label htmlFor="end-triggering-autosplit">
          End-triggering autosplit
        </label>
      </div>
      <div>
        <span style={{ fontStyle: "italic" }}>{message}</span>
      </div>
    </>
  );
}

type SplitIdItemInterface = ItemInterface & { splitId: string };

function getItemInterfaceArr(
  splitIds: Array<string>,
): Array<SplitIdItemInterface> {
  return splitIds.map((splitId, index) => {
    return {
      id: index,
      splitId,
    };
  });
}

function hasSplits(parsedConfig: Partial<Config>): parsedConfig is Config {
  return parsedConfig.splitIds ? parsedConfig.splitIds.length > 0 : false;
}

export default function SplitConfigEditor(props: Props): ReactElement {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const handleEditorDidMount = (
    editorInstance: editor.IStandaloneCodeEditor,
  ): void => {
    editorRef.current = editorInstance;
  };

  const onChange = (value: string | undefined): void => {
    props.onChange(value ?? "");
  };

  const onChangeParsedConfig = (value: Partial<Config>): void => {
    onChange(JSON.stringify(value, null, 4));
  };

  const onChangeSplitSelect = (split: SplitOption | null): void => {
    if (!(split && editorRef?.current)) {
      return;
    }
    const currentValue = editorRef.current.getValue();
    if (!currentValue) {
      console.error("Could not get value from editorRef");
      return;
    }
    try {
      const currentConfig = JSON5.parse<Config>(currentValue);
      currentConfig.splitIds.push(split.value);
      editorRef.current.setValue(`${JSON.stringify(currentConfig, null, 4)}\n`);
    } catch (e) {
      console.error("Failed to parse config from editor:", e);
    }
  };

  let parsedConfig: Partial<Config> = {};
  try {
    parsedConfig = JSON5.parse(props.value);
  } catch (e) {
    console.error(e);
  }

  const game = useCurrentGame();

  const sortableSetList = (items: Array<SplitIdItemInterface>): void => {
    const newConfig = {
      ...parsedConfig,
      splitIds: items.map(({ splitId }) => splitId),
    };
    onChangeParsedConfig(newConfig);
  };

  return (
    <Tabs focusTabOnClick={false}>
      <TabList>
        <Tab>JSON</Tab>
        <Tab>UI (Beta)</Tab>
      </TabList>

      <TabPanel>
        <SplitSelect onChange={onChangeSplitSelect} />
        <div className="hk-split-maker-monaco-editor">
          <Suspense fallback={<div>Loading editor...</div>}>
            <SplitConfigJsonEditor
              value={props.value}
              onChange={onChange}
              onMount={handleEditorDidMount}
            />
          </Suspense>
        </div>
      </TabPanel>
      <TabPanel>
        {hasSplits(parsedConfig) ? (
          <ReactSortable
            ghostClass="autosplits-sortable-ghost-class"
            dragClass="autosplits-sortable-drag-class"
            list={getItemInterfaceArr(parsedConfig.splitIds)}
            setList={sortableSetList}
          >
            {parsedConfig.splitIds.map((splitId, index) => (
              <SingleAutosplitSelect
                // biome-ignore lint/suspicious/noArrayIndexKey: designing a robust unique-key system for this list is too complicated for now
                key={index}
                splitId={splitId}
                index={index}
                parsedConfig={parsedConfig}
                onChange={onChangeParsedConfig}
              />
            ))}
          </ReactSortable>
        ) : (
          <AddFirstAutosplit
            onChange={onChangeParsedConfig}
            parsedConfig={parsedConfig}
          />
        )}
        {game === "hollowknight" && (
          <EndTriggeringAutosplit
            onChange={onChangeParsedConfig}
            parsedConfig={parsedConfig}
          />
        )}
      </TabPanel>
    </Tabs>
  );
}
