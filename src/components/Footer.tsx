import React, { ReactElement } from "react";

export default function Footer(): ReactElement {
    const commit = process.env.GIT_VERSION;
    const url = `https://github.com/slaurent22/hk-split-maker/commit/${commit}`;
    return (
        <div className="footer">
            Built from commit <a href={url}>{commit}</a>.
        </div>
    );
}
