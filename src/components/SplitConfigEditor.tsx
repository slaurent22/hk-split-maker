import type { ReactNode } from "react";
import React, { Component } from "react";
import type { OnChange, Monaco } from "@monaco-editor/react";
import Editor from "@monaco-editor/react";
import { Uri } from "monaco-editor";
import SplitConfigSchema from "../schema/splits.schema.json";

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
                    path={modelUri.toString()}
                    beforeMount={handleEditorWillMount}
                />
            </div>
        );
    }
}
