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

export default class SplitConfigEditor extends Component<Props, State> {
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
                    defaultLanguage="json"
                    defaultValue={this.state.value}
                    onChange={this.props.onChange}
                    theme="vs-dark"
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
