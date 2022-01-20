import React, { useEffect, useState, ReactElement } from "react";
import { saveAs } from "file-saver";
import { getCategoryConfigJSON, getCategoryDirectory } from "../lib/categories";
import { CategoryDefinition } from "../asset/hollowknight/categories/category-directory.json";
import { Config, createSplitsXml } from "../lib/lss";
import CategoryAnyPercent from "../asset/hollowknight/categories/any.json";
import ArrowButton from "./ArrowButton";
import CategorySelect from "./CategorySelect";
import SplitConfigEditor from "./SplitConfigEditor";
import SplitOutputEditor from "./SplitOutputEditor";
import Header from "./Header";
import Instructions from "./Instructions";
import AlertBanner from "./AlertBanner";
import Footer from "./Footer";
interface AppState {
  configInput: string;
  splitOutput: string;
  categories: Record<string, Array<CategoryDefinition>>;
  categoryName?: string;
}

interface AppProps {
  requestedCategoryName?: string;
  onUpdateCategoryName: (categoryName: string) => void;
}

export default function App({ requestedCategoryName, onUpdateCategoryName, }: AppProps): ReactElement {

  const [state, setState] = useState<AppState>({
    configInput: JSON.stringify(CategoryAnyPercent, null, 4),
    splitOutput: "",
    categoryName: requestedCategoryName,
    categories: getCategoryDirectory(),
  });

  const onConfigInputChange = (value: string | undefined) => {
    setState({
      ...state,
      configInput: value ?? "",
    });
  };

  const onSplitOutputChange = (value: string | undefined) => {
    setState({
      ...state,
      splitOutput: value ?? "",
    });
  };

  const getCategoryDefinition = (categoryName: string) => {
    return Object.values(state.categories).flat().find(category => {
      return category.fileName === categoryName;
    });
  };

  useEffect(() => {
    void (async() => {
      if (state.categoryName && getCategoryDefinition(state.categoryName)) {
        const editorContent = await getCategoryConfigJSON(state.categoryName);
        onConfigInputChange(editorContent);
      }
    })();
  }, [state.categoryName]);

  const onCategorySelect = (newValue: CategoryDefinition | null) => {
    if (newValue) {
      setState({
        ...state,
        categoryName: newValue.fileName,
      });
    }
  };


  useEffect(() => {
    if (state.categoryName) {
      onUpdateCategoryName(state.categoryName);
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
                defaultValue={getCategoryDefinition(requestedCategoryName ?? "") ?? null}
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
      <Footer />
    </div>
  );
}
