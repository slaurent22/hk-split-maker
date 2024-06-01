import React, {
  useEffect,
  useState,
  ReactElement,
  lazy,
  Suspense,
  ChangeEvent,
} from "react";
import { saveAs } from "file-saver";
import JSON5 from "json5";
import useQueryString, { QueryStringResult } from "use-query-string";
import { getCategoryConfigJSON, getCategoryDirectory } from "../lib/categories";
import { CategoryDefinition } from "../asset/hollowknight/categories/category-directory.json";
import { Config, createSplitsXml, importSplitsXml } from "../lib/lss";
import CategoryAnyPercent from "../asset/hollowknight/categories/any.json";
import ArrowButton from "./ArrowButton";
import Header from "./Header";
import Instructions from "./Instructions";
import AlertBanner from "./AlertBanner";
import Footer from "./Footer";
import ShareButton from "./ShareButton";
interface AppState {
  configInput: string;
  splitOutput: string;
  categories: Record<string, Array<CategoryDefinition>>;
  categoryName?: string;
  shareButtonDisabled: boolean;
}

const CategorySelect = lazy(() => import("./CategorySelect"));
const SplitConfigEditor = lazy(() => import("./SplitConfigEditor"));
const SplitOutputEditor = lazy(() => import("./SplitOutputEditor"));

function updateQuery(path: string) {
  window.history.pushState(null, document.title, path);
}

export default function App(): ReactElement {
  const [query, setQuery] = useQueryString(
    window.location,
    updateQuery,
    {},
    { skipNull: true }
  ) as [QueryStringResult[0], QueryStringResult[1]];
  const builtin = query.builtin as string;
  const config = query.config;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const initialConfig = config
    ? JSON.parse(atob(config as string))
    : CategoryAnyPercent;
  const [state, setState] = useState<AppState>({
    configInput: JSON.stringify(initialConfig, null, 4),
    splitOutput: "",
    categoryName: builtin,
    categories: getCategoryDirectory(),
    shareButtonDisabled: true,
  });

  useEffect(() => {
    if (window.location.hash) {
      setQuery({ builtin: window.location.hash.substring(1), config: null });
    }
  }, [window.location.hash]);

  const onUpdateCategoryName = (categoryName: string) => {
    setQuery({ builtin: categoryName, config: null });
  };

  const onConfigInputChange = (
    value: string | undefined,
    loadedFromBuiltin = false
  ) => {
    if (!loadedFromBuiltin) {
      setQuery({ builtin: null, config: null });
    }
    setState({
      ...state,
      configInput: value ?? "",
      shareButtonDisabled: loadedFromBuiltin,
    });
  };

  const onSplitOutputChange = (value: string | undefined) => {
    setState({
      ...state,
      splitOutput: value ?? "",
    });
  };

  const onShare = () => {
    const confirmed = confirm(
      "This will create a disgusting URL. Only use for custom configurations. Proceed?"
    );
    if (confirmed) {
      const condensed = JSON.stringify(JSON.parse(state.configInput));
      setQuery({ builtin: null, config: btoa(condensed) });
      alert("Copy the URL from your browser's URL bar!");
    }
  };

  const getCategoryDefinition = (categoryName: string) => {
    return Object.values(state.categories)
      .flat()
      .find((category) => {
        return category.fileName === categoryName;
      });
  };

  useEffect(() => {
    void (async () => {
      if (state.categoryName && getCategoryDefinition(state.categoryName)) {
        const editorContent = await getCategoryConfigJSON(state.categoryName);
        onConfigInputChange(editorContent, true);
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
    return JSON5.parse<Config>(state.configInput);
  };

  const onImportButton = () => {
    document.getElementById("import-input")?.click();
  };

  const onImport = (ce: ChangeEvent<HTMLInputElement>) => {
    // file select
    if (!ce.target.files) {
      return;
    }
    const file = ce.target.files[0];
    const reader = new FileReader();
    reader.onload = (pe: ProgressEvent<FileReader>) => {
      const fileContents = pe.target?.result;
      if (typeof fileContents === "string") {
        try {
          const jsonConfig = importSplitsXml(fileContents);
          setState({
            ...state,
            configInput: JSON.stringify(jsonConfig, null, 4),
          });
        } catch (e) {
          console.error(e);
          alert(
            "Failed to import splits. The error has been logged to console.error"
          );
          return;
        }
      }
    };
    reader.readAsText(file);
  };

  const onSubmit = async () => {
    let configObject;
    try {
      configObject = parseConfigInput();
    } catch (e) {
      console.log(e);
      alert("Failed to parse config as JSON");
      return;
    }
    let output = "";

    const submitButton = document.getElementById(
      "submit-button"
    ) as HTMLInputElement;
    submitButton.disabled = true;

    try {
      // todo: runtime schema validation
      output = await createSplitsXml(configObject);
    } catch (e) {
      console.error(e);
      alert(
        "Failed to create splits. The error has been logged to console.error"
      );
      return;
    } finally {
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
      .replace(/[^a-z0-9]/gi, "_") // replace non-alphanum with _
      .replace(/^_+|_+$/g, "") // remove outer _
      .replace(/^_+|_+$/g, "") // remove outer _
      .replace(/_{2,}/g, "_"); // join multiple _
    let suffix = "";
    if (splitsConfig.variables?.glitch) {
      const glitch = splitsConfig.variables?.glitch;
      switch (glitch) {
        case "No Main Menu Storage":
          suffix = "-nmms";
          break;
        case "All Glitches":
          suffix = "-ag";
          break;
        default:
          break; // nmg categories don't need suffix
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
    } catch {
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
          <h2>Input Configuration</h2>
          <div className="output-container">
            <div className="row">
              <input type="file" id="import-input" onChange={onImport} />
              <ArrowButton
                text="Import Splits"
                id="import-button"
                onClick={onImportButton}
              />
              <ArrowButton
                text="Generate"
                id="submit-button"
                onClick={onSubmit}
              />
              <ShareButton
                id="share-button"
                onClick={onShare}
                disabled={state.shareButtonDisabled}
              />
            </div>
            <Suspense fallback={<div>Loading category select...</div>}>
              <CategorySelect
                id="categories"
                onChange={onCategorySelect}
                data={state.categories}
                defaultValue={getCategoryDefinition(builtin ?? "") ?? null}
              />
            </Suspense>
            <Suspense fallback={<div>Loading split config editor...</div>}>
              <SplitConfigEditor
                defaultValue={state.configInput}
                onChange={onConfigInputChange}
              />
            </Suspense>
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
            <Suspense fallback={<div>Loading split output editor...</div>}>
              <SplitOutputEditor
                defaultValue={state.splitOutput}
                onChange={onSplitOutputChange}
              />
            </Suspense>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
