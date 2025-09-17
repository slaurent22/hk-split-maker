import { configureStore } from "@reduxjs/toolkit";
import gameReducer from "./game-slice";

export const store = configureStore({
  reducer: {
    game: gameReducer,
  },
});

// Infer RootState and AppDispatch types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
