import type {
  ActionCreatorWithoutPayload,
  ActionCreatorWithPayload,
  PayloadAction,
  WritableDraft,
} from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

export type Game = "hollowknight" | "silksong";

interface GameState {
  currentGame: Game;
}

const initialState: GameState = {
  currentGame: "hollowknight", // default
};

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    setGame: (state: WritableDraft<GameState>, action: PayloadAction<Game>) => {
      state.currentGame = action.payload;
    },
    toggleGame: (state: WritableDraft<GameState>) => {
      state.currentGame =
        state.currentGame === "hollowknight" ? "silksong" : "hollowknight";
    },
  },
});

interface GameSliceActions {
  setGame: ActionCreatorWithPayload<Game, "game/setGame">;
  toggleGame: ActionCreatorWithoutPayload<"game/toggleGame">;
}

export const { setGame, toggleGame }: GameSliceActions = gameSlice.actions;
export default gameSlice.reducer;
