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
      // TODO settare il gameState dello stato di redux con quello che ci viene portato come payload della action
      // TODO settare il gameStatus dello stato di redux con quello che ci viene portato nel payload della action
    },
    setPlayersCount: (state, action: PayloadAction<number>) => {
      // TODO settare il playersCount dello stato di redux con quello che ci viene portato come payload della action
    },
    setGameStatus: (state, action: PayloadAction<TGameStatus>) => {
      // TODO settare il gameStatus dello stato di redux con quello che ci viene portato come payload della action
    },
    clearGameSocketState: (state) => {
      // TODO reset dello state
    },
  },
});

export const { setGameState, setPlayersCount, setGameStatus, clearGameSocketState } = gameSocketSlice.actions;

export const gameSocketReducer = gameSocketSlice.reducer;
