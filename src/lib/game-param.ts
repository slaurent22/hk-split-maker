import type { Game } from "../store/game-slice";

export const DEFAULT_GAME: Game = "hollowknight";

const VALID_GAMES: ReadonlyArray<Game> = ["hollowknight", "silksong"];

/**
 * Returns the game named by a `game` search param, or null if it is missing
 * or not a known game.
 */
export function parseGameParam(value: string | null): Game | null {
  return VALID_GAMES.find((game) => game === value) ?? null;
}

/**
 * Returns a copy of the search params with `game` set to the default game,
 * keeping every other param.
 */
export function withDefaultGameParam(
  searchParams: URLSearchParams,
): URLSearchParams {
  const newParams = new URLSearchParams(searchParams);
  newParams.set("game", DEFAULT_GAME);
  return newParams;
}
