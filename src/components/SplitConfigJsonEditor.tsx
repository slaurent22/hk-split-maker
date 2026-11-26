import type { Monaco, OnChange, OnMount } from "@monaco-editor/react";
import Editor, { useMonaco } from "@monaco-editor/react";
import { Uri } from "monaco-editor";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { useCurrentGame } from "../hooks";
import HKSplitConfigSchema from "../schema/hollowknight/splits.schema";
import SSSplitConfigSchema from "../schema/silksong/splits.schema";

function useHandleEditorWillMount(): [(monaco: Monaco) => void, Uri] {
  const game = useCurrentGame();
  const splitConfigSchema =
    game === "hollowknight" ? HKSplitConfigSchema : SSSplitConfigSchema;
  const { $id: schemaId } = splitConfigSchema;

  const modelUri = Uri.parse(schemaId);
  return [
    function handleEditorWillMount(monaco: Monaco): void {
      monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
        validate: true,
        schemas: [
          {
            uri: schemaId,
            fileMatch: [modelUri.toString()],
            schema: splitConfigSchema,
          },
        ],
      });
    },
    modelUri,
  ];
}

interface Props {
  defaultValue: string;
  value: string;
  onChange: OnChange;
  onMount: OnMount;
}

export default function SplitConfigJsonEditor(props: Props): ReactNode {
  const [handleEditorWillMount, modelUri] = useHandleEditorWillMount();
  const monaco = useMonaco();
  useEffect(() => {
    if (monaco) {
      handleEditorWillMount(monaco);
    }
  }, [monaco, handleEditorWillMount]);

  return (
    <Editor
      defaultLanguage="json"
      defaultValue={props.defaultValue}
      value={props.value}
      onChange={props.onChange}
      theme="vs-dark"
      options={{
        minimap: {
          enabled: false,
        },
      }}
      path={modelUri.toString()}
      beforeMount={handleEditorWillMount}
      onMount={props.onMount}
    />
  );
}
