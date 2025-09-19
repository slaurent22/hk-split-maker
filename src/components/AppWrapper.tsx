import React, { ReactNode, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { useCurrentGame } from "../hooks";
import { AppDispatch } from "../store";
import { setGame, Game } from "../store/game-slice";

interface AppWrapperProps {
  children: ReactNode;
}

const VALID_GAMES: Game[] = ["hollowknight", "silksong"];

export default function AppWrapper({ children }: AppWrapperProps): ReactNode {
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentGame = useCurrentGame();

  useEffect(() => {
    const gameParam = searchParams.get("game") as Game | null;

    if (gameParam && VALID_GAMES.includes(gameParam)) {
      if (gameParam !== currentGame) {
        dispatch(setGame(gameParam));
      }
    } else {
      const fallback: Game = "hollowknight";
      if (currentGame !== fallback) {
        dispatch(setGame(fallback));
      }
      const newParams = new URLSearchParams(searchParams);
      newParams.set("game", fallback);
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, currentGame, dispatch, setSearchParams]);

  return <>{children}</>;
}
