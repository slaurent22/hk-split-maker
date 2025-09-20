import React from "react";
import { useCurrentGame } from "../hooks";
import { Game } from "../store/game-slice";

const VIDEO_URL = "https://www.youtube.com/watch?v=JBdm7LvZAZQ";

const SPLITS_LINK: Record<Game, { href: string; text: string }> = {
  hollowknight: {
    href: "https://github.com/slaurent22/hk-split-maker/blob/main/src/asset/hollowknight/splits.txt",
    text: "splits.txt",
  },
  silksong: {
    href: "https://github.com/slaurent22/hk-split-maker/blob/main/src/asset/silksong/splits.json",
    text: "splits.json",
  },
};

const SPLITS_EXAMPLE: Record<Game, { name: string; id: string }> = {
  hollowknight: {
    name: "Mask Fragment 4 (Upgrade)",
    id: "Mask1",
  },
  silksong: {
    name: "Bell Beast (Boss)",
    id: "BellBeast",
  },
};

const Instructions: React.FC = () => {
  const game = useCurrentGame();
  return (
    <div id="instructions">
      {game === "hollowknight" && <h2>Hollow Knight Instructions</h2>}
      {game === "silksong" && <h2>Silksong Instructions</h2>}
      <p>
        To use a built-in configuration, select a category from the "Pre-made
        Category" box. You can scroll or search within it. Click "Generate",
        then click "Download". Your lss file is now available.
      </p>
      <p>Detailed instructions for custom splits:</p>
      <ul>
        <li>
          Find the splits you want to use from the{" "}
          <a href={SPLITS_LINK[game].href} target="_blank" rel="noreferrer">
            {SPLITS_LINK[game].text}
          </a>{" "}
          file. For example, if you want to split on "
          {SPLITS_EXAMPLE[game].name}" , then use "{SPLITS_EXAMPLE[game].id}" as
          the split id. As an easier alternative, use the "Add autosplit" select
          box. You can type to search or scroll within it. When you select an
          option, it will be added to the <strong>bottom</strong> of the
          "splitIds".
        </li>
        <li>
          List your desired splits in the "splitIds" section of the
          configuration.
          <ul>
            {game === "hollowknight" && (
              <li>
                Timer will start automatically. The first splitId is the first
                segment. For a different start, specify a
                startTriggeringAutosplit.
              </li>
            )}
            {game === "silksong" && (
              <li>
                The first entry is the start trigger. It is usually
                "StartNewGame". It will not correspond to a Segment.
              </li>
            )}
            <li>
              Mark a split as a <strong>subsplit</strong> by prefixing the name
              with a minus sign (-). These entries will get an autosplit and a
              segment name beginning with the minus sign, for use with the
              LiveSplit Subsplits layout component.
            </li>
            <li>
              Include your own <strong>manual splits</strong> by prefixing the
              name with a precent sign (%). These entries will be associated
              with the "Manual Split (Misc)" autosplit
            </li>
          </ul>
        </li>
        <li>
          Change the other configuration values as you see fit. But don't worry;
          these are easily changeable from LiveSplit later if needed!
        </li>
        <li>
          Click "Generate". The button will temporarily disable while in
          progress.
        </li>
        <li>
          Click "Download", and save the file to your computer. Open this file
          in LiveSplit via right click ➡ Open Splits ➡ From File
        </li>
      </ul>
      <h2>Video Tutorial</h2>
      <div className="centered">
        <a href={VIDEO_URL} target="_blank" rel="noreferrer">
          HK Split Maker Tutorial on YouTube
        </a>
      </div>
    </div>
  );
};

export default Instructions;
