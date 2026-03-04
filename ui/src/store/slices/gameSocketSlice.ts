import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { IGameStateDto, TGameStatus } from '@/dtos/Game';

export interface IGameSocketState {
  gameState: IGameStateDto | null;
  playersCount: number | null;
  gameStatus: TGameStatus | null;
}

const initialState: IGameSocketState = {
  gameState: null,
  playersCount: null,
  gameStatus: null,
};

export const gameSocketSlice = createSlice({
  name: 'gameSocket',
  initialState,
  reducers: {
    setGameState: (state, action: PayloadAction<IGameStateDto>) => {
      state.gameState = action.payload;
      // opzionale: mantiene coerente gameStatus con lo stato arrivato via socket
      state.gameStatus = action.payload.status;
    },
    setPlayersCount: (state, action: PayloadAction<number>) => {
      state.playersCount = action.payload;
    },
    setGameStatus: (state, action: PayloadAction<TGameStatus>) => {
      state.gameStatus = action.payload;
    },
    clearGameSocketState: (state) => {
      state.gameState = null;
      state.playersCount = null;
      state.gameStatus = null;
    },
  },
});

export const { setGameState, setPlayersCount, setGameStatus, clearGameSocketState } = gameSocketSlice.actions;

export const gameSocketReducer = gameSocketSlice.reducer;
