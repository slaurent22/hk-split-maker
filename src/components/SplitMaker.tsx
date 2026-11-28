import { saveAs } from "file-saver";
import JSON5 from "json5";
import JSZip from "jszip";
import type { ChangeEvent, ReactElement } from "react";
import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { useSearchParams } from "react-router-dom";
import HKCategoryAnyPercent from "../asset/hollowknight/categories/any.json";
import type { CategoryDefinition } from "../asset/hollowknight/categories/category-directory.json.d";
import SSCategoryAnyPercent from "../asset/silksong/categories/any-bells.json";
import { useCurrentGame } from "../hooks";
import { getCategoryConfigJSON, getCategoryDirectory } from "../lib/categories";
import type { Config } from "../lib/lss";
import {
  buildSplitsFileName,
  createILPack,
  createSplitsXml,
  importSplitsXml,
} from "../lib/lss";
import type { Game } from "../store/game-slice";
import ArrowButton from "./ArrowButton";
import EditorLoading from "./EditorLoading";
import { LABELS } from "./labels";
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
  const [configInputIsLoading, setConfigInputIsLoading] = useState(false);
  const [splitOutputIsLoading, setSplitOutputIsLoading] = useState(false);
  const [splitConfig, setSplitConfig] = useState<Config | null>(null);
  const [downloadButtonsDisabled, setDownloadButtonsDisabled] = useState(false);
  const [includeIcons, setIncludeIcons] = useState(true);

  useEffect(() => {
    if (globalThis.location.hash) {
      setSearchParams({
        builtin: globalThis.location.hash.slice(1),
        game,
      });
    }
  }, [setSearchParams, game]);

  const onUpdateCategoryName = useCallback(
    (newCategoryName: string) => {
      setSearchParams({ builtin: newCategoryName, game });
    },
    [game, setSearchParams],
  );

  const onSplitOutputChange = (value: string | undefined): void => {
    setSplitOutput(value ?? "");
  };

  const onShare = (): void => {
    const confirmed = confirm(
      "This will create a disgusting URL. Only use for custom configurations. Proceed?",
    );
    if (confirmed) {
      const condensed = JSON.stringify(JSON.parse(configInput));
      setSearchParams({
        config: btoa(condensed),
        game,
      });
      alert("Copy the URL from your browser's URL bar!");
    }
  };

  const getCategoryDefinition = useCallback(
    (targetCategoryName: string) =>
      Object.values(categories)
        .flat()
        .find((category) => category.fileName === targetCategoryName),
    [categories],
  );

  // Called only by the editor
  const onUserEdit = useCallback(
    (value: string | undefined) => {
      setConfigInput(value ?? "");
      setShareButtonDisabled(false);
      setSearchParams({ game });
    },
    [game, setSearchParams],
  );

  // Loads a builtin; no dependency on the handler above
  useEffect(() => {
    if (!(categoryName && getCategoryDefinition(categoryName))) {
      return;
    }

    let cancelled = false;
    setConfigInputIsLoading(true);
    setShareButtonDisabled(true);

    // biome-ignore lint/nursery/noFloatingPromises: valid inside useEffect
    getCategoryConfigJSON(categoryName, game)
      .then((json) => {
        if (!cancelled) {
          setConfigInput(json);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setConfigInputIsLoading(false);
        }
      });

    return (): void => {
      cancelled = true;
      setConfigInputIsLoading(false);
    };
  }, [categoryName, game, getCategoryDefinition]);

  const onCategorySelect = (newValue: CategoryDefinition | null): void => {
    if (newValue) {
      setCategoryName(newValue.fileName);
    }
  };

  useEffect(() => {
    if (categoryName) {
      onUpdateCategoryName(categoryName);
    }
  }, [categoryName, onUpdateCategoryName]);

  const parseConfigInput = (): Config => JSON5.parse<Config>(configInput);

  const onImportButton = (): void => {
    document.getElementById("import-input")?.click();
  };

  const onImport = useCallback(
    (ce: ChangeEvent<HTMLInputElement>, currentGame: Game): void => {
      // file select
      if (!ce.target.files) {
        return;
      }
      const file = ce.target.files[0];
      const reader = new FileReader();
      reader.onload = (pe: ProgressEvent<FileReader>): void => {
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
          }
        }
      };
      reader.readAsText(file);
    },
    [],
  );

  const validateAutosplits = (configObject: Config): boolean => {
    if (game === "hollowknight") {
      if (!configObject.splitIds?.length) {
        alert("For Hollow Knight, you need at least one autosplit.");
        return false;
      }
    } else if (
      game === "silksong" &&
      (!configObject.splitIds || configObject.splitIds.length < 2)
    ) {
      alert(
        "For Silksong, you need at least two autosplits. The first one is the start trigger, and subsequent ones are the segments.",
      );
      return false;
    }

    return true;
  };

  const onSubmit = async (): Promise<void> => {
    let configObject: Config | undefined;
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
    let splitName: string;
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
    let outputNames: Array<string> = [];
    let zipName = "";

    setDownloadButtonsDisabled(true);

    try {
      ({ output, outputNames, zipName } = await createILPack(
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
      zip.file(outputNames[i], output[i]);
    }

    // do not try to await zip.generateAsync, because React needs to re-render
    // to use the effect of the above setDownloadILsDisabled
    zip
      .generateAsync({ type: "blob" })
      .then((content) => {
        saveAs(content, zipName);
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

  const onToggleAct1Start = (): void => {
    let configObject: Config | undefined;
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

  const importOnChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>): void => onImport(e, game),
    [game, onImport],
  );

  const toggleIconsOnChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>): void => {
      setIncludeIcons(e.target.checked);
    },
    [],
  );

  return (
    <div id="input-output">
      <div className="side" id="editor-section">
        <h2>Input Configuration</h2>
        <div className="output-container">
          <div className="row">
            <input id="import-input" onChange={importOnChange} type="file" />
            <ArrowButton
              id="import-button"
              onClick={onImportButton}
              text="Import Splits"
            />
            <ArrowButton
              id="submit-button"
              // needs to be a promise for Generate to work
              onClick={onSubmit}
              text="Generate"
            />
            <ShareButton
              disabled={shareButtonDisabled}
              id="share-button"
              onClick={onShare}
            />
          </div>
          <Suspense fallback={<div>Loading category select...</div>}>
            <CategorySelect
              data={categories}
              defaultValue={getCategoryDefinition(builtin ?? "") ?? null}
              id="categories"
              onChange={onCategorySelect}
            />
          </Suspense>
          <div>
            <input
              checked={includeIcons}
              id="generate-icons-toggle"
              onChange={toggleIconsOnChange}
              type="checkbox"
            />
            <label htmlFor="generate-icons-toggle">Include icons</label>
          </div>
          {game === "silksong" && (
            <div className="row" style={{ alignItems: "center" }}>
              <ArrowButton
                id="toggle-act1-start"
                onClick={onToggleAct1Start}
                text="Toggle Autosave Start"
              />
              <a
                href="https://www.speedrun.com/silksong/guides/5a1lq"
                rel="noreferrer"
                target="_blank"
              >
                <IoMdInformationCircleOutline size="1.5em" />
              </a>
            </div>
          )}
          <Suspense
            fallback={
              <div className="hk-split-maker-monaco-editor">
                <EditorLoading label={LABELS.LOADING_SPLIT_CONFIG_EDITOR} />
              </div>
            }
          >
            <SplitConfigEditor
              isLoading={configInputIsLoading}
              onChange={onUserEdit}
              value={configInput}
            />
          </Suspense>
        </div>
      </div>
      <div className="side" id="output-section">
        <h2>Output Splits File</h2>
        <div className="output-container">
          <div className="row">
            <ArrowButton
              disabled={
                splitOutput.length === 0 ||
                splitOutputIsLoading ||
                downloadButtonsDisabled
              }
              id="download-button"
              onClick={onDownload}
              text="Download"
            />
            <ArrowButton
              disabled={
                splitOutput.length === 0 ||
                splitOutputIsLoading ||
                downloadButtonsDisabled
              }
              id="download-button"
              onClick={onDownloadILs}
              text="Download ILs"
            />
          </div>
          <Suspense
            fallback={
              <div className="hk-split-maker-monaco-editor">
                <EditorLoading label={LABELS.LOADING_SPLIT_OUTPUT_EDITOR} />
              </div>
            }
          >
            <SplitOutputEditor
              defaultValue={splitOutput}
              isLoading={splitOutputIsLoading}
              onChange={onSplitOutputChange}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
