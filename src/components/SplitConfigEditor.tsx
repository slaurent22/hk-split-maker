import React, { Fragment, useEffect, useRef, ReactElement } from "react";
import Editor, { useMonaco, OnChange, Monaco } from "@monaco-editor/react";
import { editor, Uri } from "monaco-editor";
import SplitConfigSchema from "../schema/splits.schema";
import { Config } from "../lib/lss";
import SplitSelect, { SplitOption } from "./SplitSelect";

interface Props {
  defaultValue: string;
  onChange: OnChange;
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
      const currentConfig = JSON.parse(currentValue) as Config;
      currentConfig.splitIds.push(split.value);
      editorRef.current.setValue(JSON.stringify(currentConfig, null, 4) + "\n");
    }
    catch (e) {
      console.error("Failed to parse config from editor:", e);
    }
  };

  return (
    <Fragment>
      <SplitSelect
        onChange={onChangeSplitSelect}
      />
      <div className="hk-split-maker-monaco-editor">
        <Editor
          defaultLanguage="json"
          defaultValue={props.defaultValue}
          value={props.defaultValue}
          onChange={props.onChange}
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
    </Fragment>
  );
}
