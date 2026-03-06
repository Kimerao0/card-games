import { SUITS_ORDER } from '@/constants/cardsData';
import type { ICard } from '@/dtos/Card';
import { type FC, useEffect, useMemo, useState } from 'react';
import { Row, Column } from '@/components/layout';
import { useTableCardAnimation } from './useTableCardAnimation';
import { CentralField } from './components/CentralField';
import { OpponentSeat } from './components/OpponentSeat';
import { PlayerHand } from './components/PlayerHand';

interface PlayerNames {
  readonly top?: string;
  readonly left?: string;
  readonly right?: string;
  readonly bottom?: string;
}

type TSeat = 'bottom' | 'right' | 'top' | 'left';

interface CardsFieldProps {
  cards: ICard[];
  tableCards: ICard[];
  playerNames?: PlayerNames;
  isMyTurn: boolean;
  onPlayCard?: (cardId: number) => void;
  capturedMine: number;
  capturedPartner: number;
  currentTurnSeat?: TSeat;
  onHistoryClick?: () => void;
}

export const CardsField: FC<CardsFieldProps> = ({ cards, tableCards, playerNames, isMyTurn, onPlayCard, capturedMine, capturedPartner, currentTurnSeat, onHistoryClick }) => {
  const [playerCards, setPlayerCards] = useState<ICard[]>(cards);
  const [playedCardId, setPlayedCardId] = useState<number | null>(null);
  const [centerPlayedCard, setCenterPlayedCard] = useState<ICard | null>(null);

  const { localTableCards, leavingIds, enteringIds } = useTableCardAnimation(tableCards);

  useEffect(() => {
    setPlayerCards(cards);
  }, [cards]);

  const sortedCards = useMemo(() => {
    return [...playerCards].sort((a, b) => {
      const suitDiff = SUITS_ORDER.indexOf(a.color) - SUITS_ORDER.indexOf(b.color);
      if (suitDiff !== 0) return suitDiff;
      return a.value - b.value;
    });
  }, [playerCards]);

  const handlePlayCard = (cardId: number): void => {
    if (!isMyTurn) return;
    if (playedCardId !== null) return;

    const cardObj = playerCards.find((c) => c.id === cardId) ?? null;
    setCenterPlayedCard(cardObj);
    setPlayedCardId(cardId);

    window.setTimeout(() => {
      setPlayedCardId(null);
      setCenterPlayedCard(null);
    }, 320);

    onPlayCard?.(cardId);
  };

  return (
    <Column style={{ position: 'relative' }}>
      <OpponentSeat position="top" playerName={playerNames?.top} isActive={currentTurnSeat === 'top'} />

      <Row>
        <OpponentSeat position="left" playerName={playerNames?.left} isActive={currentTurnSeat === 'left'} />

        <CentralField
          isMyTurn={isMyTurn}
          capturedMine={capturedMine}
          capturedPartner={capturedPartner}
          localTableCards={localTableCards}
          leavingIds={leavingIds}
          enteringIds={enteringIds}
          centerPlayedCard={centerPlayedCard}
          onHistoryClick={onHistoryClick}
        />

        <OpponentSeat position="right" playerName={playerNames?.right} isActive={currentTurnSeat === 'right'} />
      </Row>

      <PlayerHand
        sortedCards={sortedCards}
        playedCardId={playedCardId}
        isMyTurn={isMyTurn}
        playerName={playerNames?.bottom}
        isActive={currentTurnSeat === 'bottom'}
        onPlay={handlePlayCard}
      />
    </Column>
  );
};
