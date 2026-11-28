import type { ReactElement } from "react";
import "./EditorLoading.css";

interface Props {
  label?: string;
}

export default function EditorLoading({
  label = "Loading...",
}: Props): ReactElement {
  return (
    <output aria-live="polite" className="editor-loading-overlay">
      <span aria-hidden="true" className="editor-loading-spinner" />
      <span className="editor-loading-label">{label}</span>
    </output>
  );
}
