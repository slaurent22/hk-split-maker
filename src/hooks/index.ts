import { useSelector } from "react-redux";
import { RootState } from "../store";
import { Game } from "../store/game-slice";

export function useCurrentGame(): Game {
  return useSelector((reduxState: RootState) => reduxState.game.currentGame);
}
