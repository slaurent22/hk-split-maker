import type { ReactNode } from "react";
import React, { Component } from "react";
import Editor from "@monaco-editor/react";

interface Props {
    defaultValue: string;
}
interface State {
    value: string;
}

export default class SplitOutputEditor extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            value: props.defaultValue,
        };
        console.log(this.state);
    }

    public render(): ReactNode {
        return (
            <div className="hk-split-maker-monaco-editor">
                <Editor
                    defaultLanguage="xml"
                    theme="vs-dark"
                    value={this.props.defaultValue}
                    options={({
                        minimap: {
                            enabled: false,
                        },
                        readOnly: true,
                    })}
                />
            </div>
        );
    }
}
