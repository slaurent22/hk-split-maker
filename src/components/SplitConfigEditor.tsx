import React, { useEffect, useRef, useState, ReactElement } from "react";
import Tooltip from "@atlaskit/tooltip";
import Editor, { useMonaco, Monaco } from "@monaco-editor/react";
import { editor, Uri } from "monaco-editor";
import { ItemInterface, ReactSortable } from "react-sortablejs";
import { TiDelete, TiPlus, TiChevronRight, TiArrowMove } from "react-icons/ti";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import JSON5 from "json5";
import SplitConfigSchema from "../schema/splits.schema";
import { Config, SUB_SPLIT_RE } from "../lib/lss";
import { parseSplitsDefinitions } from "../lib/hollowknight-splits";
import SplitSelect, { SplitOption } from "./SplitSelect";
import "react-tabs/style/react-tabs.css";

interface Props {
  defaultValue: string;
  onChange: (value: string | undefined) => void;
}

const { $id: schemaId } = SplitConfigSchema;

const modelUri = Uri.parse(schemaId);
function handleEditorWillMount(monaco: Monaco) {
  monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
    validate: true,
    schemas: [
      {
        uri: schemaId,
        fileMatch: [modelUri.toString()],
        schema: SplitConfigSchema,
      },
    ],
  });
}

const splitDefinitions = parseSplitsDefinitions();
function getSplitOption(splitId: string) {
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
  // todo: consolidate with other similar functions
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

function SubsplitIndicator() {
  return (
    <Tooltip content="This is a subsplit">
      <TiChevronRight size="1.5em" />
    </Tooltip>
  );
}

function MoveAnchor() {
  return (
    <span style={{ cursor: "grab" }}>
      <TiArrowMove size="1.5em" />
    </span>
  );
}

interface DeleteAutosplitProps {
  index: number;
  onChange: (newConfig: string) => void;
  parsedConfig: Partial<Config>;
}

function DeleteAutosplit({
  index,
  onChange,
  parsedConfig,
}: DeleteAutosplitProps) {
  return (
    <Tooltip content="Delete this autosplit">
      <TiDelete
        size="1.5em"
        style={{ cursor: "pointer" }}
        onClick={() => {
          if (!parsedConfig.splitIds) {
            return;
          }
          const newConfig = {
            ...parsedConfig,
            splitIds: [
              ...parsedConfig.splitIds.slice(0, index),
              ...parsedConfig.splitIds.slice(index + 1),
            ],
          };
          onChange(JSON.stringify(newConfig, null, 4));
        }}
      />
    </Tooltip>
  );
}

interface AddAutosplitProps {
  index: number;
  parsedConfig: Partial<Config>;
  onChange: (newConfig: string) => void;
}

function AddAutosplit({ parsedConfig, onChange, index }: AddAutosplitProps) {
  return (
    <div style={{ alignItems: "center", display: "flex" }}>
      <TiPlus
        size="1em"
        style={{ cursor: "pointer" }}
        onClick={() => {
          if (!parsedConfig.splitIds) {
            return;
          }
          const newConfig = {
            ...parsedConfig,
            splitIds: [
              ...parsedConfig.splitIds.slice(0, index + 1),
              "AbyssShriek",
              ...parsedConfig.splitIds.slice(index + 1),
            ],
          };
          onChange(JSON.stringify(newConfig, null, 4));
        }}
      />
      <span>Add autosplit</span>
    </div>
  );
}

interface AddFirstAutosplitProps {
  parsedConfig: Partial<Config>;
  onChange: (newConfig: string) => void;
}

function AddFirstAutosplit({ parsedConfig, onChange }: AddFirstAutosplitProps) {
  return (
    <div style={{ alignItems: "center", display: "flex" }}>
      <TiPlus
        size="1.5em"
        style={{ cursor: "pointer" }}
        onClick={() => {
          if (!parsedConfig) {
            return;
          }
          const newConfig = {
            ...parsedConfig,
            splitIds: ["AbyssShriek"],
          };
          onChange(JSON.stringify(newConfig, null, 4));
        }}
      />
      <span style={{ fontSize: "1.5em" }}>Add autosplit</span>
    </div>
  );
}

interface SingleAutosplitSelectProps {
  splitId: string;
  index: number;
  parsedConfig: Partial<Config>;
  onChange: (newConfig: string) => void;
}

function SingleAutosplitSelect({
  splitId,
  index,
  parsedConfig,
  onChange,
}: SingleAutosplitSelectProps) {
  const value = getSplitOption(splitId);
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
          onChange={(val) => {
            if (!parsedConfig.splitIds || !val) {
              return;
            }
            const newConfig = {
              ...parsedConfig,
              splitIds: [
                ...parsedConfig.splitIds.slice(0, index),
                `${value?.subsplit ? "-" : ""}${val.value}`,
                ...parsedConfig.splitIds.slice(index + 1),
              ],
            };
            onChange(JSON.stringify(newConfig, null, 4));
          }}
        />
        <DeleteAutosplit
          index={index}
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
  onChange: (newConfig: string) => void;
}
function EndTriggeringAutosplit({
  onChange,
  parsedConfig,
}: EndTriggeringAutosplitProps) {
  const message = parsedConfig.endTriggeringAutosplit
    ? "Time will end on last autosplit"
    : "Time will end on game-ending/credits";
  return (
    <>
      <div style={{ fontSize: "1.5em", margin: "5px" }}>
        <input
          id="end-triggering-autosplit"
          type="checkbox"
          onChange={() => {
            const newConfig = {
              ...parsedConfig,
              endTriggeringAutosplit: !parsedConfig.endTriggeringAutosplit,
            };
            onChange(JSON.stringify(newConfig, null, 4));
          }}
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
  splitIds: Array<string>
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
  const monaco = useMonaco();
  useEffect(() => {
    if (monaco) {
      handleEditorWillMount(monaco);
    }
  }, [monaco]);

  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const handleEditorDidMount = (
    editorInstance: editor.IStandaloneCodeEditor
  ) => {
    editorRef.current = editorInstance;
  };

  const [splitConfig, setSplitConfig] = useState(props.defaultValue);
  const onChange = (value: string | undefined) => {
    if (value) {
      setSplitConfig(value);
      props.onChange(value);
    }
  };

  useEffect(() => {
    // lol wut
    setSplitConfig(props.defaultValue);
  }, [props.defaultValue]);

  const onChangeSplitSelect = (split: SplitOption | null) => {
    if (!split || !editorRef?.current) {
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
      editorRef.current.setValue(JSON.stringify(currentConfig, null, 4) + "\n");
    } catch (e) {
      console.error("Failed to parse config from editor:", e);
    }
  };

  let parsedConfig: Partial<Config> = {};
  try {
    parsedConfig = JSON5.parse(splitConfig);
  } catch (e) {
    console.error(e);
  }

  return (
    <Tabs>
      <TabList>
        <Tab>JSON</Tab>
        <Tab>UI (Beta)</Tab>
      </TabList>

      <TabPanel>
        <SplitSelect onChange={onChangeSplitSelect} />
        <div className="hk-split-maker-monaco-editor">
          <Editor
            defaultLanguage="json"
            defaultValue={props.defaultValue}
            value={splitConfig}
            onChange={onChange}
            theme="vs-dark"
            options={{
              minimap: {
                enabled: false,
              },
            }}
            path={modelUri.toString()}
            beforeMount={handleEditorWillMount}
            onMount={handleEditorDidMount}
          />
        </div>
      </TabPanel>
      <TabPanel>
        {hasSplits(parsedConfig) ? (
          <ReactSortable
            ghostClass="autosplits-sortable-ghost-class"
            dragClass="autosplits-sortable-drag-class"
            list={getItemInterfaceArr(parsedConfig.splitIds)}
            setList={(items: Array<SplitIdItemInterface>) => {
              const newConfig = {
                ...parsedConfig,
                splitIds: items.map(({ splitId }) => splitId),
              };
              onChange(JSON.stringify(newConfig, null, 4));
            }}
          >
            {parsedConfig.splitIds.map((splitId, index) => (
              <SingleAutosplitSelect
                key={index}
                splitId={splitId}
                index={index}
                parsedConfig={parsedConfig}
                onChange={onChange}
              />
            ))}
          </ReactSortable>
        ) : (
          <AddFirstAutosplit onChange={onChange} parsedConfig={parsedConfig} />
        )}
        <EndTriggeringAutosplit
          onChange={onChange}
          parsedConfig={parsedConfig}
        />
      </TabPanel>
    </Tabs>
  );
}
