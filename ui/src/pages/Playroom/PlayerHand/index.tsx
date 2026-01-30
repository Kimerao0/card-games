import { SUITS_ORDER } from '@/constants/cardsData';
import type { ICard } from '@/dtos/Card';
import { PlayerCard } from '@/pages/Playroom/PlayerHand/PlayerCard';
import styled from '@emotion/styled';
import { type FC, useMemo } from 'react';
import RetroImg from '@/assets/cards/napoletane/retro.jpg';

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
    <Column style={{ position: 'relative' }}>
      <TopHandWrapper>
        {Array.from({ length: 10 }).map((_, index) => (
          <div key={`first-${index}`} style={{ backgroundImage: `url(${RetroImg})` }} />
        ))}
      </TopHandWrapper>
      <Row>
        <VerticalHandWrapper>
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={`left-${index}`} style={{ backgroundImage: `url(${RetroImg})` }} />
          ))}
        </VerticalHandWrapper>
        <CentralField />
        <VerticalHandWrapper>
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={`right-${index}`} style={{ backgroundImage: `url(${RetroImg})` }} />
          ))}
        </VerticalHandWrapper>
      </Row>
      <FullRow>
        {sortedCards.map((card, index) => (
          <PlayerCard key={`player-${card.id}-${index}`} card={card} />
        ))}
      </FullRow>
    </Column>
  );
};

const CommonDiv = styled('div')({
  display: 'flex',
  margin: '20px',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '10px',
});

const FullRow = styled(CommonDiv)({
  width: 'calc(100vw - 40px)',
  height: 'calc(20vh - 40px)',
  flexDirection: 'row',
});

const TopHandWrapper = styled(FullRow)({
  gap: '20px',
  '& > div': {
    width: '3%',
    height: 'auto',
    aspectRatio: '2/3',
    border: '1px solid black',
    borderRadius: '8px',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
});

const VerticalHandWrapper = styled(CommonDiv)({
  width: 'calc(20vw - 40px)',
  height: 'calc(60vh - 40px)',
  flexDirection: 'column',
  gap: '5px',
  '& > div': {
    width: 'auto',
    height: '30%',
    aspectRatio: '2/3',
    border: '1px solid black',
    borderRadius: '8px',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    transform: 'rotate(90deg)',
  },
});
const CentralField = styled(CommonDiv)({
  width: 'calc(60vw - 40px)',
  height: 'calc(60vh - 40px)',
  flexDirection: 'column',
});

const Column = styled('div')({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
});
const Row = styled('div')({
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
});
