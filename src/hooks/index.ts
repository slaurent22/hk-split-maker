import { useMemo } from "react";
import { useSelector } from "react-redux";
import { splitsFunctions, SplitsFunctions } from "../lib/splits";
import { RootState } from "../store";
import { Game } from "../store/game-slice";

export function useCurrentGame(): Game {
  return useSelector((reduxState: RootState) => reduxState.game.currentGame);
}

export function useSplitsFunctions(): SplitsFunctions {
  const game = useCurrentGame();
  return useMemo(() => splitsFunctions(game), [game]);
}
