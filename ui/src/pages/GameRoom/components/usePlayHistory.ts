import { useEffect, useRef, useState } from 'react';
import { ALL_CARDS } from '@/constants/cardsData';
import type { ICard } from '@/dtos/Card';
import type { IGamePlayerDto, IGameStateDto } from '@/dtos/Game';

export interface PlayHistoryEntry {
  readonly playerName: string;
  readonly playedCard: ICard;
  readonly capturedCards: ICard[];
  readonly isScopa: boolean;
}

export const usePlayHistory = (gameState: IGameStateDto | undefined, players: IGamePlayerDto[] | undefined): PlayHistoryEntry[] => {
  const prevStateRef = useRef<IGameStateDto | null>(null);
  const [history, setHistory] = useState<PlayHistoryEntry[]>([]);

  useEffect(() => {
    if (!gameState || !players || players.length === 0) return;

    const prevState = prevStateRef.current;
    prevStateRef.current = gameState;

    if (!prevState) return;
    if (prevState.currentPlayerIndex === null || prevState.currentPlayerIndex === undefined) return;
    if (prevState.currentPlayerIndex === gameState.currentPlayerIndex && prevState.status === gameState.status) return;

    const isTresette = gameState.gameType === 'Tresette';
    const entry = isTresette
      ? detectTresettePlay(prevState, gameState, players)
      : detectScoponePlay(prevState, gameState, players);

    if (entry) {
      setHistory((prev) => [entry, ...prev]);
    }
  }, [gameState, players]);

  return history;
};

function detectScoponePlay(
  prevState: IGameStateDto,
  currState: IGameStateDto,
  players: IGamePlayerDto[],
): PlayHistoryEntry | null {
  const playerIndex = prevState.currentPlayerIndex;
  if (playerIndex === null || playerIndex === undefined) return null;

  const player = players[playerIndex];
  if (!player) return null;

  const prevCaptured = prevState.capturedCardIdsByUser?.[player.userId] ?? [];
  const currCaptured = currState.capturedCardIdsByUser?.[player.userId] ?? [];
  const prevTable = prevState.tableCardIds ?? [];
  const currTable = currState.tableCardIds ?? [];

  if (currCaptured.length > prevCaptured.length) {
    const prevCapturedSet = new Set(prevCaptured);
    const newCapturedIds = currCaptured.filter((id) => !prevCapturedSet.has(id));

    const prevTableSet = new Set(prevTable);
    const playedCardId = newCapturedIds.find((id) => !prevTableSet.has(id));
    const capturedFromTableIds = newCapturedIds.filter((id) => prevTableSet.has(id));

    if (playedCardId === undefined) return null;

    const isScopa = currTable.length === 0 && capturedFromTableIds.length > 0;

    return {
      playerName: player.name,
      playedCard: ALL_CARDS[playedCardId - 1],
      capturedCards: capturedFromTableIds.map((id) => ALL_CARDS[id - 1]),
      isScopa,
    };
  }

  const prevTableSet = new Set(prevTable);
  const playedCardId = currTable.find((id) => !prevTableSet.has(id));
  if (playedCardId === undefined) return null;

  return {
    playerName: player.name,
    playedCard: ALL_CARDS[playedCardId - 1],
    capturedCards: [],
    isScopa: false,
  };
}

function detectTresettePlay(
  prevState: IGameStateDto,
  currState: IGameStateDto,
  players: IGamePlayerDto[],
): PlayHistoryEntry | null {
  const playerIndex = prevState.currentPlayerIndex;
  if (playerIndex === null || playerIndex === undefined) return null;

  const player = players[playerIndex];
  if (!player) return null;

  const prevTrick = prevState.trickCardIds ?? [];
  const currTrick = currState.trickCardIds ?? [];

  // A card was added to the current trick
  if (currTrick.length > prevTrick.length) {
    const prevTrickSet = new Set(prevTrick);
    const playedCardId = currTrick.find((id) => !prevTrickSet.has(id));
    if (playedCardId === undefined) return null;

    return {
      playerName: player.name,
      playedCard: ALL_CARDS[playedCardId - 1],
      capturedCards: [],
      isScopa: false,
    };
  }

  // Trick just completed (was reset) — the last play completed the trick
  if (currTrick.length === 0 && prevTrick.length > 0) {
    // The played card was the last one that completed the trick, but it's already cleared.
    // We can still detect it from the captured cards diff.
    const prevCaptured = prevState.capturedCardIdsByUser ?? {};
    const currCaptured = currState.capturedCardIdsByUser ?? {};

    // Find who won the trick by checking whose captured cards grew
    let trickCards: number[] = [];
    for (const userId of Object.keys(currCaptured)) {
      const prev = prevCaptured[userId] ?? [];
      const curr = currCaptured[userId] ?? [];
      if (curr.length > prev.length) {
        const prevSet = new Set(prev);
        trickCards = curr.filter((id) => !prevSet.has(id));
        break;
      }
    }

    // The played card: find the card in the trick that wasn't in prevTrick
    const prevTrickSet = new Set(prevTrick);
    const playedCardId = trickCards.find((id) => !prevTrickSet.has(id));
    if (playedCardId === undefined) return null;

    const capturedIds = trickCards.filter((id) => id !== playedCardId);

    return {
      playerName: player.name,
      playedCard: ALL_CARDS[playedCardId - 1],
      capturedCards: capturedIds.map((id) => ALL_CARDS[id - 1]),
      isScopa: false,
    };
  }

  return null;
}
