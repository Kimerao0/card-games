import { baseApi } from '@/store/api/baseApi';
import type { IGameCreatedResponse, IGameDetailsDto, IGameHandDto, IGameSummaryDto } from '@/dtos/Game';

export const gamesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createGame: builder.mutation<IGameCreatedResponse, void>({
      query: () => ({
        url: '/games',
        method: 'POST',
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
  }),
});

export const { useCreateGameMutation, useListGamesQuery, useJoinGameMutation, useGetGameHandQuery, useDeleteGameMutation } = gamesApi;
