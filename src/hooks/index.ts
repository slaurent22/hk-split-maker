import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { parseGameParam } from "../lib/game-param";
import type { SplitsFunctions } from "../lib/splits";
import { splitsFunctions } from "../lib/splits";
import type { RootState } from "../store";
import type { Game } from "../store/game-slice";

export function useStoredGame(): Game {
  return useSelector((reduxState: RootState) => reduxState.game.currentGame);
}

/**
 * The game named by the URL's `game` param. AppWrapper only renders the app
 * once that param is valid, and mirrors it into the store after rendering,
 * so the URL is read first: during a tab switch the store still holds the
 * previous game for one render, and effects that write the game back into
 * the URL would otherwise undo the switch.
 */
export function useCurrentGame(): Game {
  const [searchParams] = useSearchParams();
  const storedGame = useStoredGame();
  return parseGameParam(searchParams.get("game")) ?? storedGame;
}

export function useSplitsFunctions(): SplitsFunctions {
  const game = useCurrentGame();
  return useMemo(() => splitsFunctions(game), [game]);
}
