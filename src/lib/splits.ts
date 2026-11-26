import type { Game } from "../store/game-slice";
import {
  getIconURLs as hkGetIconURLs,
  getSelectOptionGroups as hkGetSelectOptionGroups,
  parseSplitsDefinitions as hkParseSplitsDefinitions,
} from "./hollowknight-splits";
import {
  getIconURLs as ssGetIconURLs,
  getSelectOptionGroups as ssGetSelectOptionGroups,
  parseSplitsDefinitions as ssParseSplitsDefinitions,
} from "./silksong-splits";

export interface SplitsFunctions {
  parseSplitsDefinitions: typeof hkParseSplitsDefinitions;
  getSelectOptionGroups: typeof hkGetSelectOptionGroups;
  getIconURLs: typeof hkGetIconURLs;
}

export function splitsFunctions(game: Game): SplitsFunctions {
  switch (game) {
    case "hollowknight":
      return {
        parseSplitsDefinitions: hkParseSplitsDefinitions,
        getSelectOptionGroups: hkGetSelectOptionGroups,
        getIconURLs: hkGetIconURLs,
      };
    case "silksong":
      return {
        parseSplitsDefinitions: ssParseSplitsDefinitions,
        getSelectOptionGroups: ssGetSelectOptionGroups,
        getIconURLs: ssGetIconURLs,
      };
    default:
      throw new Error(`invalid game ${game}`);
  }
}
