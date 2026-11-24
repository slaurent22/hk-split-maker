import { saveAs } from "file-saver";
import JSON5 from "json5";
import JSZip from "jszip";
import {
  type ChangeEvent,
  lazy,
  type ReactElement,
  Suspense,
  useEffect,
  useState,
} from "react";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { useSearchParams } from "react-router-dom";
import HKCategoryAnyPercent from "../asset/hollowknight/categories/any.json";
import type { CategoryDefinition } from "../asset/hollowknight/categories/category-directory.json.d";
import SSCategoryAnyPercent from "../asset/silksong/categories/any-bells.json";
import { useCurrentGame } from "../hooks";
import { getCategoryConfigJSON, getCategoryDirectory } from "../lib/categories";
import {
  buildSplitsFileName,
  type Config,
  createILPack,
  createSplitsXml,
  importSplitsXml,
} from "../lib/lss";
import type { Game } from "../store/game-slice";
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
  const initialConfig = config ? JSON.parse(atob(config)) : defaultCategory;
  const [configInput, setConfigInput] = useState(
    JSON.stringify(initialConfig, null, 4),
  );
  const [categoryName, setCategoryName] = useState(builtin);
  const categories = getCategoryDirectory(game);
  const [shareButtonDisabled, setShareButtonDisabled] = useState(true);

  const [splitOutput, setSplitOutput] = useState("");
  const [splitOutputIsLoading, setSplitOutputIsLoading] = useState(false);
  const [splitConfig, setSplitConfig] = useState<Config | null>(null);
  const [downloadButtonsDisabled, setDownloadButtonsDisabled] = useState(false);
  const [includeIcons, setIncludeIcons] = useState(true);

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
    loadedFromBuiltin = false,
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

  const onShare = () => {
    const confirmed = confirm(
      "This will create a disgusting URL. Only use for custom configurations. Proceed?",
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
    (async () => {
      if (categoryName && getCategoryDefinition(categoryName)) {
        onConfigInputChange("{loading...}", true);
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
            "Failed to import splits. The error has been logged to console.error",
          );
          return;
        }
      }
    };
    reader.readAsText(file);
  };

  const validateAutosplits = (configObject: Config): boolean => {
    if (game === "hollowknight") {
      if (!configObject.splitIds?.length) {
        alert("For Hollow Knight, you need at least one autosplit.");
        return false;
      }
    } else if (game === "silksong") {
      if (!configObject.splitIds || configObject.splitIds.length < 2) {
        alert(
          "For Silksong, you need at least two autosplits. The first one is the start trigger, and subsequent ones are the segments.",
        );
        return false;
      }
    }

    return true;
  };

  useEffect(() => {
    if (splitOutputIsLoading) {
      setSplitOutput("loading...");
    }
  }, [splitOutputIsLoading]);

  const onSubmit = async () => {
    let configObject;
    try {
      configObject = parseConfigInput();
    } catch (e) {
      console.log(e);
      alert("Failed to parse config as JSON");
      return;
    }
    // Don't let the user generate an invalid splits file
    if (!validateAutosplits(configObject)) {
      return;
    }

    setSplitConfig(configObject);

    let output = "";

    const submitButton = document.getElementById(
      "submit-button",
    ) as HTMLInputElement;
    submitButton.disabled = true;
    setSplitOutputIsLoading(true);

    try {
      // todo: runtime schema validation
      output = await createSplitsXml(configObject, game, includeIcons);
    } catch (e) {
      console.error(e);
      alert(
        "Failed to create splits. The error has been logged to console.error",
      );
      return;
    } finally {
      submitButton.disabled = false;
      setSplitOutputIsLoading(false);
    }

    setSplitOutput(output);
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
  };

  const onDownloadILs = async (): Promise<void> => {
    let output: Array<string> = [];
    let output_names: Array<string> = [];
    let zip_name = "";

    setDownloadButtonsDisabled(true);

    try {
      ({ output, output_names, zip_name } = await createILPack(
        splitConfig,
        game,
        includeIcons,
      ));
    } catch (e) {
      console.error(e);
      alert(
        "Failed to create ILs pack. The error has been logged to console.error",
      );
      setDownloadButtonsDisabled(false);
    }

    const zip = new JSZip();
    for (let i = 0; i < output.length; i++) {
      zip.file(output_names[i], output[i]);
    }

    // do not try to await zip.generateAsync, because React needs to re-render
    // to use the effect of the above setDownloadILsDisabled
    zip
      .generateAsync({ type: "blob" })
      .then((content) => {
        saveAs(content, zip_name);
      })
      .catch((e) => {
        console.error(e);
        alert(
          "Failed to create ILs pack. The error has been logged to console.error",
        );
      })
      .finally(() => {
        setDownloadButtonsDisabled(false);
      });
  };

  const onToggleAct1Start = () => {
    let configObject;
    try {
      configObject = parseConfigInput();
    } catch (e) {
      console.log(e);
      alert("Failed to parse config as JSON");
      return;
    }

    let newConfig = structuredClone(configObject);

    if (newConfig.splitIds?.[0] === "StartNewGame") {
      newConfig.splitIds[0] = "Act1Start";
      // so offset appears at the top of the serialized config
      newConfig = {
        offset: "00:00:21.7600000",
        ...newConfig,
      };
    } else if (newConfig.splitIds?.[0] === "Act1Start") {
      newConfig.splitIds[0] = "StartNewGame";
      delete newConfig.offset;
    } else {
      alert(
        "Cannot toggle autosave start unless the first split is either StartNewGame or Act1Start",
      );
    }

    setConfigInput(JSON.stringify(newConfig, null, 4));
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
            />
            <ArrowButton
              text="Generate"
              id="submit-button"
              // needs to be a promise for Generate to work
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
          <div>
            <input
              id="generate-icons-toggle"
              type="checkbox"
              checked={includeIcons}
              onChange={(e) => {
                setIncludeIcons(e.target.checked);
              }}
            />
            <label htmlFor="generate-icons-toggle">Include icons</label>
          </div>
          {game === "silksong" && (
            <div className="row" style={{ alignItems: "center" }}>
              <ArrowButton
                text="Toggle Autosave Start"
                id="toggle-act1-start"
                onClick={onToggleAct1Start}
              />
              <a
                href="https://www.speedrun.com/silksong/guides/5a1lq"
                target="_blank"
                rel="noreferrer"
              >
                <IoMdInformationCircleOutline size="1.5em" />
              </a>
            </div>
          )}
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
              disabled={
                splitOutput.length === 0 ||
                splitOutputIsLoading ||
                downloadButtonsDisabled
              }
            />
            <ArrowButton
              id="download-button"
              text="Download ILs"
              onClick={onDownloadILs}
              disabled={
                splitOutput.length === 0 ||
                splitOutputIsLoading ||
                downloadButtonsDisabled
              }
            />
          </div>
          <Suspense fallback={<div>Loading split output editor...</div>}>
            <SplitOutputEditor
              defaultValue={splitOutput}
              onChange={onSplitOutputChange}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
