import { configureStore, createListenerMiddleware } from '@reduxjs/toolkit';
import { baseApi } from '@/store/api/baseApi';
import { authSlice, logout } from '@/store/slices/authSlice';
import { clearGameSocketState, gameSocketReducer } from '@/store/slices/gameSocketSlice';
import { disconnectSocket } from '@/services/socketService';

const listenerMiddleware = createListenerMiddleware();

listenerMiddleware.startListening({
  actionCreator: logout,
  effect: (_action, listenerApi): void => {
    disconnectSocket();
    listenerApi.dispatch(clearGameSocketState());
    listenerApi.dispatch(baseApi.util.resetApiState());
  },
});

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    [authSlice.reducerPath]: authSlice.reducer,
    gameSocket: gameSocketReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(listenerMiddleware.middleware).concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
