import { useMemo } from "react";
import { useSelector } from "react-redux";
import { type SplitsFunctions, splitsFunctions } from "../lib/splits";
import type { RootState } from "../store";
import type { Game } from "../store/game-slice";

export function useCurrentGame(): Game {
  return useSelector((reduxState: RootState) => reduxState.game.currentGame);
}

export function useSplitsFunctions(): SplitsFunctions {
  const game = useCurrentGame();
  return useMemo(() => splitsFunctions(game), [game]);
}
