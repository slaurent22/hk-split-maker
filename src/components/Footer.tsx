import type { ReactElement } from "react";

export default function Footer(): ReactElement {
  const commit = import.meta.env.VITE_GIT_VERSION;
  const url = `https://github.com/slaurent22/hk-split-maker/commit/${commit}`;
  return (
    <div className="footer">
      Built from commit{" "}
      <a href={url} rel="noopener noreferrer" target="_blank">
        {commit}
      </a>
      .
    </div>
  );
}
