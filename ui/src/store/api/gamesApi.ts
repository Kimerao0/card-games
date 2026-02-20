import { baseApi } from '@/store/api/baseApi';
import type { IGameCreatedResponse, IGameDetailsDto, IGameHandDto, IGamePlayerDto, IGameSummaryDto, TGameType, IGameStateDto } from '@/dtos/Game';

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

    getGamePlayers: builder.query<IGamePlayerDto[], string>({
      query: (gameId) => `/games/${gameId}/players`,
      providesTags: (_result, _error, gameId) => [{ type: 'Games', id: `${gameId}-players` }],
    }),

    // NEW: polling state
    getGameState: builder.query<IGameStateDto, string>({
      query: (gameId) => `/games/${gameId}/state`,
      providesTags: (_result, _error, gameId) => [{ type: 'Games', id: `${gameId}-state` }],
    }),

    // NEW: play card
    playCard: builder.mutation<void, { gameId: string; cardId: number }>({
      query: ({ gameId, cardId }) => ({
        url: `/games/${gameId}/play`,
        method: 'POST',
        body: { cardId },
      }),
      invalidatesTags: (_result, _error, { gameId }) => [
        { type: 'Games', id: `${gameId}-state` },
        { type: 'GameHand', id: gameId },
      ],
    }),
  }),
});

export const {
  useCreateGameMutation,
  useListGamesQuery,
  useJoinGameMutation,
  useGetGameHandQuery,
  useDeleteGameMutation,
  useGetGameQuery,
  useGetGamePlayersQuery,
  useGetGameStateQuery, // NEW
  usePlayCardMutation, // NEW
} = gamesApi;
