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

type AppProps = Record<string, never>;
interface AppState {
    configInput: string;
    splitOutput: string;
    categories?: Record<string, Array<CategoryDefinition>>;
    initialCategory: string;
}
export default class App extends Component<AppProps, AppState> {

    private inputEditor: React.MutableRefObject<SplitConfigEditor|null>;

    private categoryHasChanged = false;

    constructor(props: AppProps) {
        super(props);
        this.state = {
            configInput: "",
            splitOutput: "",
            initialCategory: "",
        };
        this.inputEditor = React.createRef();
    }
    public async componentDidMount(): Promise<void> {
        const newState = { categories: await getCategoryDirectory(), initialCategory: "", };
        const hash = window.location.hash.substring(1);
        if (newState.categories) {
            const initialCategory = Object.values(newState.categories).flat().find(category => {
                return category.fileName === hash;
            });
            newState.initialCategory = initialCategory?.fileName || "aluba";
            await this.updateCategory(newState.initialCategory);
        }
        this.setState(newState);
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
                        <ul>
                            <li>
                                Mark a split as a <b>subsplit</b> by prefixing the name with a minus sign (-).
                                These entries will get an autosplit and a segment name beginning with the minus sign,
                                for use with the LiveSplit Subsplits layout component.
                            </li>
                            <li>
                                Include your own <b>manual splits</b> by prefixing the name with a precent sign (%).
                                These entries will neither get an autosplit nor an icon.
                            </li>
                        </ul>
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
                                    Otherwise, the initial defaultValue will be empty, and never updated,
                                    so the inital value will always be the first in the list, not Aluba.
                                    Setting value instead of defaultValue leads to the change event
                                    not triggering when the initial value is re-selected. */}
                                {this.state.categories && this.state.initialCategory && <CategorySelect
                                    id="categories"
                                    onChange={this.onCategorySelect.bind(this)}
                                    data={this.state.categories}
                                    initial={this.state.initialCategory}
                                />}
                                <ArrowButton
                                    text="Generate"
                                    id="submit-button"
                                    onClick={this.onSubmit.bind(this)}
                                />
                            </div>
                            <SplitConfigEditor
                                defaultValue={this.state.configInput}
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

    private async updateCategory(name: string) {
        if (name && this.inputEditor.current) {
            const editorContent = await getCategory(name);
            this.inputEditor.current.setContent(editorContent);
            this.onConfigInputChange(editorContent);
            if (this.categoryHasChanged) {
                window.location.hash = name;
            }
            this.categoryHasChanged = true;
        }
    }
    private async onCategorySelect() {
        const categorySelect = document.getElementById("categories") as HTMLInputElement;
        if (categorySelect.value) {
            await this.updateCategory(categorySelect.value);
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
