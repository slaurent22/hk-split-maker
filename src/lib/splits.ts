import { Game } from "../store/game-slice";
import * as HollowKnightSplits from "./hollowknight-splits";
import * as SilksongSplits from "./silksong-splits";

export interface SplitsFunctions {
  parseSplitsDefinitions: typeof HollowKnightSplits.parseSplitsDefinitions;
  getSelectOptionGroups: typeof HollowKnightSplits.getSelectOptionGroups;
  getIconURLs: typeof HollowKnightSplits.getIconURLs;
}

export function splitsFunctions(game: Game): SplitsFunctions {
  switch (game) {
    case "hollowknight":
      return {
        parseSplitsDefinitions: HollowKnightSplits.parseSplitsDefinitions,
        getSelectOptionGroups: HollowKnightSplits.getSelectOptionGroups,
        getIconURLs: HollowKnightSplits.getIconURLs,
      };
    case "silksong":
      return {
        parseSplitsDefinitions: SilksongSplits.parseSplitsDefinitions,
        getSelectOptionGroups: SilksongSplits.getSelectOptionGroups,
        getIconURLs: SilksongSplits.getIconURLs,
      };
    default:
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      throw new Error(`invalid game ${game}`);
  }
}
