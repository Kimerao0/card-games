import { baseApi } from '@/store/api/baseApi';
import type { IGameCreatedResponse, IGameDetailsDto, IGameHandDto, IGameSummaryDto, TGameType } from '@/dtos/Game';

export const gamesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createGame: builder.mutation<IGameCreatedResponse, TGameType>({
      query: (gameType) => ({
        url: '/games',
        method: 'POST',
        body: { gameType },
      }),
      invalidatesTags: ['Games'],
    }),
    listGames: builder.query<IGameSummaryDto[], void>({
      query: () => '/games',
      providesTags: (result) =>
        result ? [...result.map(({ id }) => ({ type: 'Games' as const, id })), { type: 'Games', id: 'LIST' }] : [{ type: 'Games', id: 'LIST' }],
    }),
    joinGame: builder.mutation<IGameDetailsDto, string>({
      query: (gameId) => ({
        url: `/games/${gameId}/join`,
        method: 'GET',
      }),
      invalidatesTags: ['Games', 'GameHand'],
    }),
    getGameHand: builder.query<IGameHandDto, string>({
      query: (gameId) => `/games/${gameId}/hand`,
      providesTags: (_result, _error, gameId) => [{ type: 'GameHand', id: gameId }],
    }),
    deleteGame: builder.mutation<void, string>({
      query: (gameId) => ({
        url: `/games/${gameId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Games'],
    }),
    getGame: builder.query<IGameSummaryDto, string>({
      query: (gameId) => `/games/${gameId}`,
      providesTags: (_result, _error, gameId) => [{ type: 'Games', id: gameId }],
    }),
  }),
});

export const { useCreateGameMutation, useListGamesQuery, useJoinGameMutation, useGetGameHandQuery, useDeleteGameMutation, useGetGameQuery } = gamesApi;
