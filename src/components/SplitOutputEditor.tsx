import type { OnChange } from "@monaco-editor/react";
import Editor from "@monaco-editor/react";
import type { ReactNode } from "react";
import EditorLoading from "./EditorLoading";
import { LABELS } from "./labels";

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
      {isLoading ? <EditorLoading label={LABELS.GENERATING_SPLITS} /> : null}
      <Editor
        defaultLanguage="xml"
        loading={<EditorLoading label={LABELS.LOADING_EDITOR} />}
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
