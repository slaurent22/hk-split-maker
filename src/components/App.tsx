import type { VFC } from "react";
import React, { useEffect, useRef, useState } from "react";
import { saveAs } from "file-saver";
import { getCategory, getCategoryDirectory } from "../lib/categories";
import type { CategoryDefinition } from "../asset/categories/category-directory.json";
import type { Config } from "../lib/lss";
import { createSplitsXml } from "../lib/lss";
import ArrowButton from "./ArrowButton";
import CategorySelect from "./CategorySelect";
import SplitConfigEditor from "./SplitConfigEditor";
import SplitOutputEditor from "./SplitOutputEditor";
import Header from "./Header";
import Instructions from "./Instructions";
import AlertBanner from "./AlertBanner";

interface AppState {
    configInput: string;
    splitOutput: string;
    categories: Record<string, Array<CategoryDefinition>>;
    initialCategory: CategoryDefinition;
    categoryName?: string;
    requestedCategoryViaURL: boolean;
    categoryHasChanged: boolean;
}

const App: VFC = () => {

    const inputEditor = useRef<SplitConfigEditor|null>(null);

    const [state, setState] = useState<AppState>({
        configInput: "",
        splitOutput: "",
        initialCategory: {
            "fileName": "4ms",
            "displayName": "4 Mask Shards",
        },
        requestedCategoryViaURL: false,
        categoryHasChanged: false,
        categories: getCategoryDirectory(),
    });

    const onConfigInputChange = (value: string|undefined) => {
        setState({
            ...state,
            configInput: value ?? "",
        });
    };

    const onSplitOutputChange = (value: string|undefined) => {
        setState({
            ...state,
            splitOutput: value ?? "",
        });
    };

    // const updateCategory = async(category: CategoryDefinition) => {
    //     if (category.fileName && inputEditor.current) {
    //         const editorContent = await getCategory(category.fileName);
    //         inputEditor.current.setContent(editorContent);
    //         onConfigInputChange(editorContent);
    //     }
    // };

    useEffect(() => {
        void (async() => {
            if (state.categoryName && inputEditor.current) {
                const editorContent = await getCategory(state.categoryName);
                inputEditor.current.setContent(editorContent);
                onConfigInputChange(editorContent);
            }
        })();
    }, [state.categoryName, inputEditor.current]);

    const onCategorySelect = (newValue: CategoryDefinition|null) => {
        if (newValue) {
            // await updateCategory(newValue);
            setState({
                ...state,
                categoryName: newValue.fileName,
            });
        }
    };


    useEffect(() => {
        const hash = window.location.hash.substring(1);
        const initialCategory = Object.values(state.categories).flat().find(category => {
            return category.fileName.toLowerCase() === hash.toLowerCase();
        });
        if (initialCategory) {
            setState({
                ...state,
                initialCategory,
                requestedCategoryViaURL: true,
                categoryName: initialCategory.fileName,
            });
        }
    }, []);

    useEffect(() => {
        if (state.categoryName) {
            window.location.hash = state.categoryName;
        }
    }, [state.categoryName]);

    const parseConfigInput = () => {
        return JSON.parse(state.configInput) as Config;
    };

    const onSubmit = async() => {
        let configObject;
        try {
            configObject = parseConfigInput();
        }
        catch (e) {
            console.log(e);
            alert("Failed to parse config as JSON");
            return;
        }
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

        setState({
            ...state,
            splitOutput: output,
        });
    };

    const buildSplitsFileName = (splitsConfig: Config) => {
        const filename = (splitsConfig?.categoryName || "splits")
            .toLowerCase() // Make file name compatible:
            .replace(/['"]/g, "") // remove ' and "
            .replace(/[^a-z0-9]/gi, "_")  // replace non-alphanum with _
            .replace(/^_+|_+$/g, "")  // remove outer _
            .replace(/^_+|_+$/g, "")  // remove outer _
            .replace(/_{2,}/g, "_");  // join multiple _
        let suffix = "";
        if (splitsConfig.variables?.glitch) {
            const glitch = splitsConfig.variables?.glitch;
            switch (glitch) {
                case "No Main Menu Storage": suffix = "-nmms"; break;
                case "All Glitches":         suffix = "-ag"; break;
                default: break; // nmg categories don't need suffix
            }
        }
        return `${filename}${suffix}`;
    };

    const onDownload = (): void => {
        const output = state.splitOutput;
        const outBlob = new Blob([output]);

        // Guess a good file name.
        // Can be inaccurate if a new config has been entered but not processed yet.
        let splitName = "";
        try {
            const splitsConfig = parseConfigInput();
            splitName = buildSplitsFileName(splitsConfig);
        }
        catch {
            splitName = "splits";
        }
        saveAs(outBlob, `${splitName}.lss`);
    };

    return (
        <div id="app">
            <AlertBanner />
            <Header />
            <Instructions />
            <div id="input-output">
                <div id="editor-section" className="side">
                    <h2>Input config JSON</h2>
                    <div className="output-container">
                        <div className="row">
                            <CategorySelect
                                id="categories"
                                onChange={onCategorySelect}
                                data={state.categories}
                                defaultValue={
                                    state.requestedCategoryViaURL ? state.initialCategory : null
                                }
                            />
                            <ArrowButton
                                text="Generate"
                                id="submit-button"
                                onClick={onSubmit}
                            />
                        </div>
                        <SplitConfigEditor
                            defaultValue={state.configInput}
                            onChange={onConfigInputChange}
                            ref={inputEditor}
                        />
                    </div>
                </div>
                <div id="output-section" className="side">
                    <h2>Output Splits File</h2>
                    <div className="output-container">
                        <div className="row">
                            <ArrowButton
                                id="download-button"
                                text="Download"
                                onClick={onDownload}
                                disabled={state.splitOutput.length === 0}
                            />
                        </div>
                        <SplitOutputEditor
                            defaultValue={state.splitOutput}
                            onChange={onSplitOutputChange}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default App;
