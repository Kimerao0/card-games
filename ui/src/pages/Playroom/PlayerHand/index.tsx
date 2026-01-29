import { SUITS_ORDER } from '@/constants/cardsData';
import type { ICard } from '@/dtos/Card';
import { PlayerCard } from '@/pages/Playroom/PlayerHand/PlayerCard';
import styled from '@emotion/styled';
import { type FC, useMemo } from 'react';

interface PlayerHandProps {
  cards: ICard[];
}

export const PlayerHand: FC<PlayerHandProps> = ({ cards }) => {
  const sortedCards = useMemo(() => {
    return [...cards].sort((a, b) => {
      const suitDiff = SUITS_ORDER.indexOf(a.color) - SUITS_ORDER.indexOf(b.color);

      if (suitDiff !== 0) {
        return suitDiff;
      }

      return a.value - b.value;
    });
  }, [cards]);

  return (
    <PlayerHandWrapper>
      {sortedCards.map((card) => (
        <PlayerCard key={card.id * 100} card={card} isPlayer={false} />
      ))}
      {sortedCards.map((card) => (
        <PlayerCard key={card.id} card={card} isPlayer={true} />
      ))}
    </PlayerHandWrapper>
  );
};

const PlayerHandWrapper = styled('div')({
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '10px',
  flexDirection: 'row',
  margin: '24px 0',
});
