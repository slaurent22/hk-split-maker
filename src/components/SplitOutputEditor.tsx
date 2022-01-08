import React from "react";
import Editor, { OnChange } from "@monaco-editor/react";

interface Props {
  defaultValue: string;
  onChange: OnChange;
}

const SplitOutputEditor: React.FC<Props> = ({
  defaultValue, onChange,
}: Props) => {
  return (
    <div className="hk-split-maker-monaco-editor">
      <Editor
        defaultLanguage="xml"
        theme="vs-dark"
        value={defaultValue}
        onChange={onChange}
        options={({
          minimap: {
            enabled: false,
          },
        })}
      />
    </div>
  );
};

export default SplitOutputEditor;
