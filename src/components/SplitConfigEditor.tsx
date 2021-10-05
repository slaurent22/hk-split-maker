import type { ReactNode } from "react";
import React, { Component } from "react";
import type { OnChange, OnMount, Monaco } from "@monaco-editor/react";
import Editor from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { Uri } from "monaco-editor";
import SplitConfigSchema from "../schema/splits.schema";
import type { Config } from "../lib/lss";
import type { SplitOption } from "./SplitSelect";
import SplitSelect from "./SplitSelect";

interface Props {
    defaultValue: string;
    onChange: OnChange;
}
interface State {
    value: string;
}

const { $id: schemaId, } = SplitConfigSchema;

const modelUri = Uri.parse(schemaId);
function handleEditorWillMount(monaco: Monaco) {
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
        validate: true,
        schemas: [{
            uri: schemaId,
            fileMatch: [modelUri.toString()],
            schema: SplitConfigSchema,
        }],
    });
}

export default class SplitConfigEditor extends Component<Props, State> {

    private editorRef: React.MutableRefObject<editor.IStandaloneCodeEditor|null>;

    constructor(props: Props) {
        super(props);
        this.state = {
            value: props.defaultValue,
        };
        this.editorRef = React.createRef();
    }

    public render(): ReactNode {
        return (
            <div>
                <SplitSelect
                    onChange={this.onChangeSplitSelect.bind(this)}
                />
                <div className="hk-split-maker-monaco-editor">
                    <Editor
                        defaultLanguage="json"
                        defaultValue={this.state.value}
                        value={this.state.value}
                        onChange={this.props.onChange}
                        theme="vs-dark"
                        options={({
                            minimap: {
                                enabled: false,
                            },
                        })}
                        path={modelUri.toString()}
                        beforeMount={handleEditorWillMount}
                        onMount={this.handleMounted}
                    />
                </div>
            </div>
        );
    }
    public setContent = (value: string): void => {
        if (this.editorRef.current) {
            this.editorRef.current.setValue(value);
        }
        else {
            this.setState({ value, });
        }
    };
    private handleMounted: OnMount = (editorInstance: editor.IStandaloneCodeEditor) => {
        this.editorRef.current = editorInstance;
    };

    private onChangeSplitSelect(split: SplitOption|null) {
        if (!split) {
            return;
        }
        const currentValue = this.editorRef.current?.getValue();
        if (!currentValue) {
            console.error("Could not get value from editorRef");
            return;
        }
        try {
            const currentConfig = JSON.parse(currentValue) as Config;
            currentConfig.splitIds.push(split.value);
            this.setContent(JSON.stringify(currentConfig, null, 4) + "\n");
        }
        catch (e) {
            console.error("Failed to parse config from editor:", e);
        }
    }
}
