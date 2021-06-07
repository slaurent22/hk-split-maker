import type { ReactNode } from "react";
import React, { Component } from "react";
import type { OnChange } from "@monaco-editor/react";
import Editor from "@monaco-editor/react";

interface Props {
    defaultValue: string;
    onChange: OnChange;
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
    }

    public render(): ReactNode {
        return (
            <div className="hk-split-maker-monaco-editor">
                <Editor
                    defaultLanguage="xml"
                    theme="vs-dark"
                    value={this.props.defaultValue}
                    onChange={this.props.onChange}
                    options={({
                        minimap: {
                            enabled: false,
                        },
                    })}
                />
            </div>
        );
    }
}
