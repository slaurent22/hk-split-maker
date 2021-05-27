import type { ReactNode } from "react";
import React, { Component } from "react";
import { saveAs } from "file-saver";
import { getCategory, getCategoryDirectory } from "../lib/categories";
import type { CategoryDefinition } from "../asset/categories/category-directory.json";
import type { Config } from "../lib/lss";
import { createSplitsXml } from "../lib/lss";
import logo from "../asset/image/logo.png";
import ArrowButton from "./ArrowButton";
import CategorySelect from "./CategorySelect";
import SplitConfigEditor from "./SplitConfigEditor";
import SplitOutputEditor from "./SplitOutputEditor";

const sampleConfig = {
    "splitIds": [
        "KingsPass",
        "VengefulSpirit",
        "Greenpath",
        "MothwingCloak",
        "Aluba"
    ],
    "ordered": true,
    "endTriggeringAutosplit": true,
    "gameName": "Hollow Knight Category Extensions",
    "categoryName": "Aluba%",
    "variables": {
        "platform": "PC",
        "patch": "1.4.3.2",
        "glitch": "Current Patch NMG",
    },
};

type AppProps = Record<string, never>;
interface AppState {
    configInput: string;
    splitOutput: string;
    categories?: Record<string, Array<CategoryDefinition>>;
}
const defaultValue = JSON.stringify(sampleConfig, null, 4);
export default class App extends Component<AppProps, AppState> {

    private inputEditor: React.MutableRefObject<SplitConfigEditor|null>;

    constructor(props: AppProps) {
        super(props);
        this.state = {
            configInput: defaultValue,
            splitOutput: "",
        };
        this.inputEditor = React.createRef();
    }
    public async componentDidMount(): Promise<void> {
        this.setState({ categories: await getCategoryDirectory(), });
    }
    public render(): ReactNode {
        return (
            <div id="app">
                <header>
                    <h1>
                        <img
                            id="logo"
                            src={logo}
                            alt="HK Split Maker logo"
                        ></img>
                    </h1>
                </header>
                <h2>Instructions</h2>
                <ol>
                    <li>
                        Find the splits you want to use from the <a
                            href="https://github.com/slaurent22/hk-split-maker/blob/main/src/asset/splits.txt"
                            target="_blank"
                        >splits.txt</a> file. For example, if you want to split
                        on "Mask Fragment 4 (Upgrade)", then use "Mask1" as the
                        split name.
                    </li>
                    <li>
                        List your desired splits in the "splitIds" section of
                        the configuration.
                    </li>
                    <li>
                        Change the other configuration values as you see fit.
                        But don't worry; these are easily changeable from
                        LiveSplit later if needed!
                    </li>
                    <li>
                        Click "Generate". The button will temporarily disable
                        while in progress.
                    </li>
                    <li>
                        Click "Download", and save the file to your computer.
                        Open this file in LiveSplit via right click ➡ Open
                        Splits ➡ From File
                    </li>
                </ol>
                <div id="input-output">
                    <div id="editor-section" className="side">
                        <h2>Input config JSON</h2>
                        <div className="output-container">
                            <div className="row">
                                {/* Hacky, but useful: Only render the drop down once we have data.
                                    Otherwise, the initial defaultValue will be empty, and never uptdated,
                                    so the inital value will always be the first in the list, not Aluba.
                                    Setting value instead of defaultValue leads to the change event
                                    not triggering when the initial value is re-selected. */}
                                {this.state.categories && <CategorySelect
                                    id="categories"
                                    onChange={this.onCategorySelect.bind(this)}
                                    data={this.state.categories}
                                    initial="aluba"
                                />}
                                <ArrowButton
                                    text="Generate"
                                    id="submit-button"
                                    onClick={this.onSubmit.bind(this)}
                                />
                            </div>
                            <SplitConfigEditor
                                defaultValue={defaultValue}
                                onChange={this.onConfigInputChange.bind(this)}
                                ref={this.inputEditor}
                            />
                        </div>
                    </div>
                    <div id="output-section" className="side">
                        <h2>Output Splits File</h2>
                        <div className="output-container">
                            <ArrowButton
                                id="download-button"
                                text="Download"
                                onClick={this.onDownload.bind(this)}
                            />
                            <SplitOutputEditor
                                defaultValue={this.state.splitOutput}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    private onConfigInputChange(value: string|undefined) {
        this.setState({
            configInput: value ?? "",
        });
    }

    private async onCategorySelect() {
        const categorySelect = document.getElementById("categories") as HTMLInputElement;
        if (categorySelect.value && this.inputEditor.current) {
            this.inputEditor.current.setContent(await getCategory(categorySelect.value));
        }
    }

    private parseConfigInput() {
        return JSON.parse(this.state.configInput) as Config;
    }

    private async onSubmit(): Promise<void> {
        let configObject;
        try {
            configObject = this.parseConfigInput();
        }
        catch {
            alert("Failed to parse config as JSON");
            return;
        }
        console.log(configObject);
        let output = "";

        const submitButton = document.getElementById("submit-button") as HTMLInputElement;
        submitButton.disabled = true;

        try {
            // todo: runtime schema validation
            output = await createSplitsXml(configObject);
        }
        catch (e) {
            console.error(e);
            alert("Failed to create splits. The error has been logged to console.error");
            return;
        }
        finally {
            submitButton.disabled = false;
        }

        this.setState({
            splitOutput: output,
        });
    }

    private onDownload(): void {
        const output = this.state.splitOutput;
        const outBlob = new Blob([output]);

        // Guess a good file name.
        // Can be inaccurate if a new config has been entered but not processed yet.
        let splitName = "";
        let configObject;
        try {
            configObject = this.parseConfigInput();
            splitName = configObject?.categoryName || "splits";
            // Make file name compatible:
            splitName = splitName
                .toLowerCase()
                .replace(/[^a-z0-9]/gi, "_")  // replace non-alphanum with _
                .replace(/^_+|_+$/g, "")  // remove outer _
                .replace(/^_+|_+$/g, "")  // remove outer _
                .replace(/_{2,}/g, "_");  // join multiple _
        }
        catch {
            splitName = "splits";
        }
        saveAs(outBlob, `${splitName}.lss`);
    }
}
