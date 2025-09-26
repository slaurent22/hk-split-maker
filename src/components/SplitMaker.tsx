import React, {
  useEffect,
  useState,
  ReactElement,
  lazy,
  Suspense,
  ChangeEvent,
} from "react";
import { useSearchParams } from "react-router-dom";
import { saveAs } from "file-saver";
import JSON5 from "json5";
import { useCurrentGame } from "../hooks";
import { getCategoryConfigJSON, getCategoryDirectory } from "../lib/categories";
import { CategoryDefinition } from "../asset/hollowknight/categories/category-directory.json";
import {
  Config,
  createSplitsXml,
  importSplitsXml,
  buildSplitsFileName,
  createLayoutXml,
} from "../lib/lss";
import HKCategoryAnyPercent from "../asset/hollowknight/categories/any.json";
import SSCategoryAnyPercent from "../asset/silksong/categories/any-bells.json";
import { Game } from "../store/game-slice";
import ArrowButton from "./ArrowButton";
import ShareButton from "./ShareButton";

const CategorySelect = lazy(() => import("./CategorySelect"));
const SplitConfigEditor = lazy(() => import("./SplitConfigEditor"));
const SplitOutputEditor = lazy(() => import("./SplitOutputEditor"));

export default function SplitMaker(): ReactElement {
  const game = useCurrentGame();
  const defaultCategory =
    game === "hollowknight" ? HKCategoryAnyPercent : SSCategoryAnyPercent;
  const [searchParams, setSearchParams] = useSearchParams();
  const builtin = searchParams.get("builtin") ?? undefined;
  const config = searchParams.get("config") ?? undefined;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const initialConfig = config ? JSON.parse(atob(config)) : defaultCategory;
  const [configInput, setConfigInput] = useState(
    JSON.stringify(initialConfig, null, 4)
  );
  const [categoryName, setCategoryName] = useState(builtin);
  const categories = getCategoryDirectory(game);
  const [shareButtonDisabled, setShareButtonDisabled] = useState(true);
  const [generateLayout, setGenerateLayout] = useState(game === "silksong");

  const [splitOutput, setSplitOutput] = useState("");
  const [layoutOutput, setLayoutOutput] = useState("");

  useEffect(() => {
    if (window.location.hash) {
      setSearchParams({
        game,
        builtin: window.location.hash.substring(1),
      });
    }
  }, [window.location.hash]);

  const onUpdateCategoryName = (newCategoryName: string) => {
    setSearchParams({ game, builtin: newCategoryName });
  };

  const onConfigInputChange = (
    value: string | undefined,
    loadedFromBuiltin = false
  ) => {
    if (!loadedFromBuiltin) {
      setSearchParams({ game });
    }
    setConfigInput(value ?? "");
    setShareButtonDisabled(loadedFromBuiltin);
  };

  const onSplitOutputChange = (value: string | undefined) => {
    setSplitOutput(value ?? "");
  };

  const onLayoutOutputChange = (value: string | undefined) => {
    setLayoutOutput(value ?? "");
  };

  const onShare = () => {
    const confirmed = confirm(
      "This will create a disgusting URL. Only use for custom configurations. Proceed?"
    );
    if (confirmed) {
      const condensed = JSON.stringify(JSON.parse(configInput));
      setSearchParams({
        game,
        config: btoa(condensed),
      });
      alert("Copy the URL from your browser's URL bar!");
    }
  };

  const getCategoryDefinition = (targetCategoryName: string) => {
    return Object.values(categories)
      .flat()
      .find((category) => {
        return category.fileName === targetCategoryName;
      });
  };

  useEffect(() => {
    void (async () => {
      if (categoryName && getCategoryDefinition(categoryName)) {
        const editorContent = await getCategoryConfigJSON(categoryName, game);
        onConfigInputChange(editorContent, true);
      }
    })();
  }, [categoryName]);

  const onCategorySelect = (newValue: CategoryDefinition | null) => {
    if (newValue) {
      setCategoryName(newValue.fileName);
    }
  };

  useEffect(() => {
    if (categoryName) {
      onUpdateCategoryName(categoryName);
    }
  }, [categoryName]);

  const parseConfigInput = () => {
    return JSON5.parse<Config>(configInput);
  };

  const onImportButton = () => {
    document.getElementById("import-input")?.click();
  };

  const onImport = (ce: ChangeEvent<HTMLInputElement>, currentGame: Game) => {
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
          const jsonConfig = importSplitsXml(fileContents, currentGame);
          setConfigInput(JSON.stringify(jsonConfig, null, 4));
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
    let newLayout = "";

    const submitButton = document.getElementById(
      "submit-button"
    ) as HTMLInputElement;
    submitButton.disabled = true;

    try {
      // todo: runtime schema validation
      output = await createSplitsXml(configObject, game);
      if (generateLayout) {
        newLayout = createLayoutXml(configObject, game);
      }
    } catch (e) {
      console.error(e);
      alert(
        "Failed to create splits. The error has been logged to console.error"
      );
      return;
    } finally {
      submitButton.disabled = false;
    }

    setSplitOutput(output);
    setLayoutOutput(newLayout);
  };

  const onDownload = (): void => {
    const outBlob = new Blob([splitOutput]);

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

    if (generateLayout && layoutOutput.length > 0) {
      const layoutOutBlob = new Blob([layoutOutput]);
      saveAs(layoutOutBlob, `${splitName}.lsl`);
    }
  };

  return (
    <div id="input-output">
      <div id="editor-section" className="side">
        <h2>Input Configuration</h2>
        <div className="output-container">
          <div className="row">
            <input
              type="file"
              id="import-input"
              onChange={(e) => onImport(e, game)}
            />
            <ArrowButton
              text="Import Splits"
              id="import-button"
              onClick={onImportButton}
              disabled={game !== "hollowknight"}
            />
            <ArrowButton
              text="Generate"
              id="submit-button"
              onClick={onSubmit}
            />
            <ShareButton
              id="share-button"
              onClick={onShare}
              disabled={shareButtonDisabled}
            />
          </div>
          <Suspense fallback={<div>Loading category select...</div>}>
            <CategorySelect
              id="categories"
              onChange={onCategorySelect}
              data={categories}
              defaultValue={getCategoryDefinition(builtin ?? "") ?? null}
            />
          </Suspense>
          <Suspense fallback={<div>Loading split config editor...</div>}>
            <SplitConfigEditor
              defaultValue={configInput}
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
              disabled={splitOutput.length === 0}
            />
          </div>
          <Suspense fallback={<div>Loading split output editor...</div>}>
            <SplitOutputEditor
              defaultValue={splitOutput}
              onChange={onSplitOutputChange}
            />
          </Suspense>
          {game === "silksong" && (
            <>
              <h3>Output Layout File</h3>
              <div className="layout-instructions">
                <input
                  id="generate-lss-toggle"
                  type="checkbox"
                  checked={generateLayout}
                  onChange={(e) => {
                    setGenerateLayout(e.target.checked);
                    if (!e.target.checked) {
                      setLayoutOutput("");
                    }
                  }}
                />
                <label htmlFor="generate-lss-toggle">
                  Generate layout (lsl) file
                </label>
              </div>
              <div className="layout-instructions">
                Assumes <code>C:{"\\"}silksong_autosplit_wasm_stable.wasm</code>
                . After generating, edit line 46 below before downloading to
                change this location.
              </div>
              <Suspense fallback={<div>Loading layout output editor...</div>}>
                <SplitOutputEditor
                  defaultValue={layoutOutput}
                  onChange={onLayoutOutputChange}
                />
              </Suspense>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
