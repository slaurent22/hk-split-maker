import { createSlice, PayloadAction } from "@reduxjs/toolkit";

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
    setGame: (state, action: PayloadAction<Game>) => {
      state.currentGame = action.payload;
    },
    toggleGame: (state) => {
      state.currentGame =
        state.currentGame === "hollowknight" ? "silksong" : "hollowknight";
    },
  },
});

export const { setGame, toggleGame } = gameSlice.actions;
export default gameSlice.reducer;
