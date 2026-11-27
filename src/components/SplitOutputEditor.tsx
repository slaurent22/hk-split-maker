import type { OnChange } from "@monaco-editor/react";
import Editor from "@monaco-editor/react";
import type { ReactNode } from "react";
import EditorLoading from "./EditorLoading";

interface Props {
  defaultValue: string;
  isLoading?: boolean;
  onChange: OnChange;
}

function SplitOutputEditor({
  defaultValue,
  isLoading = false,
  onChange,
}: Props): ReactNode {
  return (
    <div className="hk-split-maker-monaco-editor">
      {isLoading ? <EditorLoading label="Generating splits..." /> : null}
      <Editor
        defaultLanguage="xml"
        loading={<EditorLoading label="Loading editor..." />}
        onChange={onChange}
        options={{
          minimap: {
            enabled: false,
          },
        }}
        theme="vs-dark"
        value={defaultValue}
      />
    </div>
  );
}

export default SplitOutputEditor;
