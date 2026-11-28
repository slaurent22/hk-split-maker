import type { ReactNode } from "react";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Navigate, useLocation, useSearchParams } from "react-router-dom";
import { useStoredGame } from "../hooks";
import { parseGameParam, withDefaultGameParam } from "../lib/game-param";
import type { AppDispatch } from "../store";
import { setGame } from "../store/game-slice";

interface AppWrapperProps {
  children: ReactNode;
}

export default function AppWrapper({ children }: AppWrapperProps): ReactNode {
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams] = useSearchParams();
  const { hash } = useLocation();
  const currentGame = useStoredGame();
  const gameParam = parseGameParam(searchParams.get("game"));

  // The URL is the source of truth for the game; mirror it into the store.
  useEffect(() => {
    if (gameParam && gameParam !== currentGame) {
      dispatch(setGame(gameParam));
    }
  }, [gameParam, currentGame, dispatch]);

  if (!gameParam) {
    // Missing or unknown game: redirect to the default game, keeping the
    // other params and the hash (used by legacy #category links).
    const search = `?${withDefaultGameParam(searchParams).toString()}`;
    return <Navigate replace={true} to={{ hash, search }} />;
  }

  return <>{children}</>;
}
