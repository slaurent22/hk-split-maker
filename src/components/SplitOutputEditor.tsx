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
        theme="vs-dark"
        value={defaultValue}
        onChange={onChange}
        options={{
          minimap: {
            enabled: false,
          },
        }}
      />
    </div>
  );
}

export default SplitOutputEditor;
