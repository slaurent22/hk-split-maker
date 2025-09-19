import { Game } from "../store/game-slice";

/*
  What is called "splits" in this app refers to the segments of a split file.
  Since the name "splits" is taken, we'll call the complete configuration "category".
  Not entirely true in terms of LiveSplit naming, but close enough.
*/
import HKCategoryDirectory, {
  CategoryDefinition,
} from "../asset/hollowknight/categories/category-directory.json";

import SSCategoryDirectory from "../asset/silksong/categories/category-directory.json";

interface CatContent {
  splitIds: Array<string>;
  ordered?: boolean;
  endTriggeringAutosplit: boolean;
  gameName: string;
  categoryName: string;
  variables: Record<string, string>;
}

export function getCategoryDirectory(
  game: Game
): Record<string, Array<CategoryDefinition>> {
  return game === "hollowknight" ? HKCategoryDirectory : SSCategoryDirectory;
}

export async function getCategoryConfigJSON(
  fileName: string,
  game: Game
): Promise<string> {
  // This results in a dire warning because we're importing arbitrary data.
  // In the case of the icon files, we have a set of functions for the files.
  // It works there, but the number of split files is likely to grow, so that's not
  // a feasible option here.
  // The real solution is to figure out webpack aliases or require contexts.

  const { default: module } = (await import(
    `../asset/${game}/categories/${fileName}.json`
  )) as Record<string, CatContent>;
  return JSON.stringify(module, null, 4);
}
