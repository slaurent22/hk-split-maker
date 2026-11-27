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
import EditorLoading from "./EditorLoading";

const SplitConfigJsonEditor = lazy(() => import("./SplitConfigJsonEditor"));

interface Props {
  isLoading?: boolean;
  onChange: (value: string | undefined) => void;
  value: string;
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
    label: split.description,
    subsplit,
    tooltip: split.tooltip,
    value: split.id,
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
        onClick={deleteOnChange}
        size="1.5em"
        style={{ cursor: "pointer" }}
      />
    </Tooltip>
  );
}

interface AddAutosplitProps {
  index: number;
  onChange: (newConfig: Partial<Config>) => void;
  parsedConfig: Partial<Config>;
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
      <TiPlus onClick={addOnChange} size="1em" style={{ cursor: "pointer" }} />
      <span>Add autosplit</span>
    </div>
  );
}

interface AddFirstAutosplitProps {
  onChange: (newConfig: Partial<Config>) => void;
  parsedConfig: Partial<Config>;
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
        onClick={addOnChange}
        size="1.5em"
        style={{ cursor: "pointer" }}
      />
      <span style={{ fontSize: "1.5em" }}>Add autosplit</span>
    </div>
  );
}

interface ToggleSubsplitProps {
  index: number;
  onChange: (newConfig: Partial<Config>) => void;
  parsedConfig: Partial<Config>;
  subsplit?: boolean;
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
        onClick={toggleOnClick}
        size="1.5em"
        style={{ cursor: "pointer" }}
      />
    </Tooltip>
  );
}

interface SingleAutosplitSelectProps {
  index: number;
  onChange: (newConfig: Partial<Config>) => void;
  parsedConfig: Partial<Config>;
  splitId: string;
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
          alignItems: "center",
          display: "flex",
        }}
      >
        <MoveAnchor />
        {value?.subsplit ? <SubsplitIndicator /> : null}
        <SplitSelect
          controlStyleOverrides={{ margin: "8px 8px 8px 8px" }}
          onChange={splitSelectOnChange}
          value={value}
        />
        <DeleteAutosplit
          index={index}
          onChange={onChange}
          parsedConfig={parsedConfig}
        />
        <ToggleSubsplit
          index={index}
          onChange={onChange}
          parsedConfig={parsedConfig}
          subsplit={value?.subsplit}
        />
      </div>
      <AddAutosplit
        index={index}
        onChange={onChange}
        parsedConfig={parsedConfig}
      />
    </div>
  );
}

interface EndTriggeringAutosplitProps {
  onChange: (newConfig: Partial<Config>) => void;
  parsedConfig: Partial<Config>;
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
          checked={parsedConfig.endTriggeringAutosplit ?? false}
          id="end-triggering-autosplit"
          onChange={inputOnChange}
          type="checkbox"
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
  return splitIds.map((splitId, index) => ({
    id: index,
    splitId,
  }));
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
          {props.isLoading ? (
            <EditorLoading label="Loading configuration..." />
          ) : null}
          <Suspense fallback={<EditorLoading label="Loading editor..." />}>
            <SplitConfigJsonEditor
              onChange={onChange}
              onMount={handleEditorDidMount}
              value={props.value}
            />
          </Suspense>
        </div>
      </TabPanel>
      <TabPanel>
        {hasSplits(parsedConfig) ? (
          <ReactSortable
            dragClass="autosplits-sortable-drag-class"
            ghostClass="autosplits-sortable-ghost-class"
            list={getItemInterfaceArr(parsedConfig.splitIds)}
            setList={sortableSetList}
          >
            {parsedConfig.splitIds.map((splitId, index) => (
              <SingleAutosplitSelect
                index={index}
                // biome-ignore lint/suspicious/noArrayIndexKey: designing a robust unique-key system for this list is too complicated for now
                key={index}
                onChange={onChangeParsedConfig}
                parsedConfig={parsedConfig}
                splitId={splitId}
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
