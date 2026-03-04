import { useEffect, useMemo, useRef, useState } from 'react';
import { ALL_CARDS } from '@/constants/cardsData';
import type { ICard } from '@/dtos/Card';
import type { IGamePlayerDto, IGameStateDto, IGameSummaryDto, ScoponeScoreResult } from '@/dtos/Game';
import { useGetGameHandQuery, useGetGamePlayersQuery, useGetGameQuery, useGetGameStateQuery, usePlayCardMutation } from '@/store/api/gamesApi';
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

  const [pollingInterval, setPollingInterval] = useState(0);
  const [statePollingInterval, setStatePollingInterval] = useState(0);

  const { data: game, isLoading: isLoadingGame, isError } = useGetGameQuery(gameId, { pollingInterval });
  const isReady = game?.status === 'Ready';
  const isScoring = game?.status === 'Scoring';
  const isGameActive = isReady || isScoring;

  const { data: handDto, isLoading: isLoadingHand } = useGetGameHandQuery(gameId, {
    skip: !isReady || !game?.isUserInGame,
  });

  const { data: players } = useGetGamePlayersQuery(gameId, { skip: !isGameActive });

  const { data: gameState } = useGetGameStateQuery(gameId, {
    skip: !isGameActive || !game?.isUserInGame,
    pollingInterval: statePollingInterval,
  });

  const [playCard, { isLoading: isPlaying }] = usePlayCardMutation();

  useEffect(() => {
    if (game?.status === 'Created') {
      setPollingInterval(5000);
      setStatePollingInterval(0);
      return;
    }
    if (game?.status === 'Ready') {
      setPollingInterval(0);
      setStatePollingInterval(5000);
      return;
    }
    if (game?.status === 'Scoring') {
      setPollingInterval(0);
      setStatePollingInterval(0);
      return;
    }
    setPollingInterval(0);
    setStatePollingInterval(0);
  }, [game?.status]);

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
    if (!currentUser || !players || !gameState) return false;
    if (gameState.currentPlayerIndex === null || gameState.currentPlayerIndex === undefined) return false;
    const currentTurnPlayer = players[gameState.currentPlayerIndex];
    if (!currentTurnPlayer) return false;
    return currentTurnPlayer.userId === currentUser.id;
  }, [currentUser, players, gameState]);

  const currentTurnSeat: TSeat | undefined = useMemo(() => {
    if (!players || !gameState) return undefined;
    if (gameState.currentPlayerIndex === null || gameState.currentPlayerIndex === undefined) return undefined;
    if (myIndex === -1) return undefined;

    const offset = (gameState.currentPlayerIndex - myIndex + players.length) % players.length;
    if (offset === 0) return 'bottom';
    if (offset === 1) return 'right';
    if (offset === 2) return 'top';
    return 'left';
  }, [players, gameState, myIndex]);

  const tableCards: ICard[] = useMemo(() => {
    if (!gameState?.tableCardIds) return [];
    return gameState.tableCardIds.map((id) => ALL_CARDS[id - 1]);
  }, [gameState?.tableCardIds]);

  const capturedCounts = useMemo(() => {
    if (!currentUser || !players || !gameState || myIndex === -1) {
      return { mine: 0, partner: 0 };
    }

    const byUser = gameState.capturedCardIdsByUser ?? {};
    const mine = (byUser[currentUser.id] ?? []).length;

    const partnerIndex = (myIndex + 2) % players.length;
    const partnerId = players[partnerIndex]?.userId;
    const partner = partnerId ? (byUser[partnerId] ?? []).length : 0;

    return { mine, partner };
  }, [currentUser, players, gameState, myIndex]);

  const prevScopasByUserRef = useRef<Record<string, number>>({});
  const [scopaNotification, setScopaNotification] = useState<string | null>(null);

  useEffect(() => {
    const current = gameState?.scopasByUser;
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
  }, [gameState?.scopasByUser, players]);

  const handlePlay = async (cardId: number): Promise<void> => {
    if (!isMyTurn) return;
    if (isPlaying) return;

    try {
      await playCard({ gameId, cardId }).unwrap();
    } catch {
      // polling riallinea
    }
  };

  return {
    game,
    isLoadingGame,
    isError,
    isLoadingHand,
    players,
    gameState,
    playerCards,
    playerNames,
    isMyTurn,
    currentTurnSeat,
    tableCards,
    capturedCounts,
    scoreResult: gameState?.scoreResult,
    scopaNotification,
    handlePlay,
  };
};
