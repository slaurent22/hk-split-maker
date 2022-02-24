import React, { useEffect, useRef, useState, ReactElement } from "react";
import Editor, { useMonaco, Monaco } from "@monaco-editor/react";
import { editor, Uri } from "monaco-editor";
import { TiDelete, TiPlus, TiChevronRight } from "react-icons/ti";
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

const { $id: schemaId, } = SplitConfigSchema;

const modelUri = Uri.parse(schemaId);
function handleEditorWillMount(monaco: Monaco) {
  monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
    validate: true,
    schemas: [{
      uri: schemaId,
      fileMatch: [modelUri.toString()],
      schema: SplitConfigSchema,
    }],
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

export default function SplitConfigEditor(props: Props): ReactElement {
  const monaco = useMonaco();
  useEffect(() => {
    if (monaco) {
      handleEditorWillMount(monaco);
    }
  }, [monaco]);

  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const handleEditorDidMount = (editorInstance: editor.IStandaloneCodeEditor) => {
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
    }
    catch (e) {
      console.error("Failed to parse config from editor:", e);
    }
  };

  let parsedConfig: Partial<Config> = {};
  try {
    parsedConfig = JSON5.parse(splitConfig);
  }
  catch (e) {
    console.error(e);
  }

  return (
    <Tabs>
      <TabList>
        <Tab>JSON</Tab>
        <Tab>UI (Beta)</Tab>
      </TabList>

      <TabPanel>
        <SplitSelect
          onChange={onChangeSplitSelect}
        />
        <div className="hk-split-maker-monaco-editor">
          <Editor
            defaultLanguage="json"
            defaultValue={props.defaultValue}
            value={splitConfig}
            onChange={onChange}
            theme="vs-dark"
            options={({
              minimap: {
                enabled: false,
              },
            })}
            path={modelUri.toString()}
            beforeMount={handleEditorWillMount}
            onMount={handleEditorDidMount}
          />
        </div>
      </TabPanel>
      <TabPanel>
        {parsedConfig.splitIds &&
          <ul>
            {parsedConfig.splitIds.map((splitId, index) => {
              const value = getSplitOption(splitId);
              return <div key={index} style={{
                display: "flex",
                alignItems: "center",
              }}>
                {value?.subsplit && <TiChevronRight size="1.5em" />}
                <SplitSelect value={value} onChange={val => {
                  if (!parsedConfig.splitIds || !val) {
                    return;
                  }
                  const newConfig = {
                    ...parsedConfig,
                    splitIds: [
                      ...parsedConfig.splitIds.slice(0, index),
                      `${value?.subsplit ? "-" : ""}${val.value}`,
                      ...parsedConfig.splitIds.slice(index + 1)
                    ],
                  };
                  onChange(JSON.stringify(newConfig, null, 4));
                }} />
                <TiDelete size="1.5em" style={{ cursor: "pointer", }}onClick={() => {
                  if (!parsedConfig.splitIds) {
                    return;
                  }
                  const newConfig = {
                    ...parsedConfig,
                    splitIds: [
                      ...parsedConfig.splitIds.slice(0, index),
                      ...parsedConfig.splitIds.slice(index + 1)
                    ],
                  };
                  onChange(JSON.stringify(newConfig, null, 4));
                }} />
              </div>;
            }
            )}
            <div style={{
              display: "flex",
              alignItems: "center",
              marginTop: "8px",
              marginBottom: "8px",
            }}>
              <TiPlus size="1.5em" style={{ cursor: "pointer", }} onClick={() => {
                if (!parsedConfig.splitIds) {
                  return;
                }
                const newConfig = {
                  ...parsedConfig,
                  splitIds: [
                    ...parsedConfig.splitIds,
                    "AbyssShriek"
                  ],
                };
                onChange(JSON.stringify(newConfig, null, 4));
              }}/><span style={{
                fontSize: "18px",
              }}>Add autosplit</span>
            </div>
          </ul>
        }

      </TabPanel>
    </Tabs>
  );
}
