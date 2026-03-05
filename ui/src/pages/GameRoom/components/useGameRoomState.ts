import { useEffect, useMemo, useRef, useState } from 'react';
import { ALL_CARDS } from '@/constants/cardsData';
import type { ICard } from '@/dtos/Card';
import type { IGamePlayerDto, IGameStateDto, IGameSummaryDto, ScoponeScoreResult } from '@/dtos/Game';
import { useGetGameHandQuery, useGetGamePlayersQuery, useGetGameQuery, usePlayCardMutation } from '@/store/api/gamesApi';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentUser } from '@/store/slices/authSlice';

type TSeat = 'bottom' | 'right' | 'top' | 'left';

interface PlayerNames {
  readonly top?: string;
  readonly left?: string;
  readonly right?: string;
  readonly bottom?: string;
}

interface CapturedCounts {
  readonly mine: number;
  readonly partner: number;
}

export interface GameRoomState {
  readonly game: IGameSummaryDto | undefined;
  readonly effectiveStatus: string | undefined;
  readonly effectivePlayersCount: number | null;
  readonly isLoadingGame: boolean;
  readonly isError: boolean;
  readonly isLoadingHand: boolean;
  readonly players: IGamePlayerDto[] | undefined;
  readonly gameState: IGameStateDto | undefined;
  readonly playerCards: ICard[];
  readonly playerNames: PlayerNames | undefined;
  readonly isMyTurn: boolean;
  readonly currentTurnSeat: TSeat | undefined;
  readonly tableCards: ICard[];
  readonly capturedCounts: CapturedCounts;
  readonly scoreResult: ScoponeScoreResult | null | undefined;
  readonly scopaNotification: string | null;
  readonly handlePlay: (cardId: number) => Promise<void>;
}

export const useGameRoomState = (gameId: string): GameRoomState => {
  const currentUser = useAppSelector(selectCurrentUser);
  const socketGameState = useAppSelector((state) => state.gameSocket.gameState);
  const socketGameStatus = useAppSelector((state) => state.gameSocket.gameStatus);
  const socketPlayersCount = useAppSelector((state) => state.gameSocket.playersCount);

  const { data: game, isLoading: isLoadingGame, isError } = useGetGameQuery(gameId);
  const effectiveStatus = socketGameState?.status ?? socketGameStatus ?? game?.status;
  const isReady = effectiveStatus === 'Ready';
  const isScoring = effectiveStatus === 'Scoring';
  const isGameActive = isReady || isScoring;

  const { data: handDto, isLoading: isLoadingHand } = useGetGameHandQuery(gameId, {
    skip: !isReady || !game?.isUserInGame,
  });

  const { data: players } = useGetGamePlayersQuery(gameId, { skip: !isGameActive });

  const [playCard, { isLoading: isPlaying }] = usePlayCardMutation();

  const playerCards: ICard[] = useMemo(() => {
    if (!handDto?.handCardIds) return [];
    return handDto.handCardIds.map((id) => ALL_CARDS[id - 1]);
  }, [handDto]);

  const myIndex = useMemo(() => {
    if (!players || !currentUser) return -1;
    return players.findIndex((p) => p.userId === currentUser.id);
  }, [players, currentUser]);

  const playerNames = useMemo(() => {
    if (!players || players.length < 2 || !currentUser) return undefined;
    const currentIndex = players.findIndex((p) => p.userId === currentUser.id);
    if (currentIndex === -1) return undefined;
    const total = players.length;
    const getName = (offset: number): string | undefined => players[(currentIndex + offset) % total]?.name;
    return {
      bottom: getName(0),
      right: getName(1),
      top: getName(2),
      left: getName(3),
    };
  }, [players, currentUser]);

  const isMyTurn = useMemo(() => {
    if (!currentUser || !players || !socketGameState) return false;
    if (socketGameState.currentPlayerIndex === null || socketGameState.currentPlayerIndex === undefined) return false;
    const currentTurnPlayer = players[socketGameState.currentPlayerIndex];
    if (!currentTurnPlayer) return false;
    return currentTurnPlayer.userId === currentUser.id;
  }, [currentUser, players, socketGameState]);

  const currentTurnSeat: TSeat | undefined = useMemo(() => {
    if (!players || !socketGameState) return undefined;
    if (socketGameState.currentPlayerIndex === null || socketGameState.currentPlayerIndex === undefined) return undefined;
    if (myIndex === -1) return undefined;

    const offset = (socketGameState.currentPlayerIndex - myIndex + players.length) % players.length;
    if (offset === 0) return 'bottom';
    if (offset === 1) return 'right';
    if (offset === 2) return 'top';
    return 'left';
  }, [players, socketGameState, myIndex]);

  const tableCards: ICard[] = useMemo(() => {
    if (!socketGameState?.tableCardIds) return [];
    return socketGameState.tableCardIds.map((id) => ALL_CARDS[id - 1]);
  }, [socketGameState?.tableCardIds]);

  const capturedCounts = useMemo(() => {
    if (!currentUser || !players || !socketGameState || myIndex === -1) {
      return { mine: 0, partner: 0 };
    }

    const byUser = socketGameState.capturedCardIdsByUser ?? {};
    const mine = (byUser[currentUser.id] ?? []).length;

    const partnerIndex = (myIndex + 2) % players.length;
    const partnerId = players[partnerIndex]?.userId;
    const partner = partnerId ? (byUser[partnerId] ?? []).length : 0;

    return { mine, partner };
  }, [currentUser, players, socketGameState, myIndex]);

  const prevScopasByUserRef = useRef<Record<string, number>>({});
  const [scopaNotification, setScopaNotification] = useState<string | null>(null);

  useEffect(() => {
    const current = socketGameState?.scopasByUser;
    if (!current || !players) return;

    const prev = prevScopasByUserRef.current;
    for (const userId of Object.keys(current)) {
      const prevCount = prev[userId] ?? 0;
      const currCount = current[userId] ?? 0;
      if (currCount > prevCount) {
        const player = players.find((p) => p.userId === userId);
        const name = player?.name ?? 'Giocatore';
        setScopaNotification(name);
        window.setTimeout(() => setScopaNotification(null), 2500);
        break;
      }
    }

    prevScopasByUserRef.current = { ...current };
  }, [socketGameState?.scopasByUser, players]);

  const handlePlay = async (cardId: number): Promise<void> => {
    if (!isMyTurn) return;
    if (isPlaying) return;

    try {
      await playCard({ gameId, cardId }).unwrap();
    } catch {
      // lo stato si riallinea quando il server emette game:state-updated
    }
  };

  return {
    game,
    effectiveStatus,
    effectivePlayersCount: socketPlayersCount,
    isLoadingGame,
    isError,
    isLoadingHand,
    players,
    gameState: socketGameState!,
    playerCards,
    playerNames,
    isMyTurn,
    currentTurnSeat,
    tableCards,
    capturedCounts,
    scoreResult: socketGameState?.scoreResult,
    scopaNotification,
    handlePlay,
  };
};
