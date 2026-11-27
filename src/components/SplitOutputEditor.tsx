import type { OnChange } from "@monaco-editor/react";
import Editor from "@monaco-editor/react";
import type { ReactNode } from "react";

interface Props {
  defaultValue: string;
  onChange: OnChange;
}

function SplitOutputEditor({ defaultValue, onChange }: Props): ReactNode {
  return (
    <div className="hk-split-maker-monaco-editor">
      <Editor
        defaultLanguage="xml"
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
