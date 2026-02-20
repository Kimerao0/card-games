import { SUITS_ORDER } from '@/constants/cardsData';
import type { ICard } from '@/dtos/Card';
import { PlayerCard } from '@/pages/Playroom/CardsField/PlayerCard';
import styled from '@emotion/styled';
import { type FC, useEffect, useMemo, useState } from 'react';
import RetroImg from '@/assets/cards/napoletane/retro.jpg';

interface PlayerNames {
  readonly top?: string;
  readonly left?: string;
  readonly right?: string;
  readonly bottom?: string;
}

interface CardsFieldProps {
  cards: ICard[];
  playerNames?: PlayerNames;
}

export const CardsField: FC<CardsFieldProps> = ({ cards, playerNames }) => {
  console.log('playerNames:', playerNames);
  const [playerCards, setPlayerCards] = useState<ICard[]>(cards);
  const [playedCardId, setPlayedCardId] = useState<number | null>(null);

  useEffect(() => {
    setPlayerCards(cards);
    setPlayedCardId(null);
  }, [cards]);

  const sortedCards = useMemo(() => {
    return [...playerCards].sort((a, b) => {
      const suitDiff = SUITS_ORDER.indexOf(a.color) - SUITS_ORDER.indexOf(b.color);
      if (suitDiff !== 0) return suitDiff;
      return a.value - b.value;
    });
  }, [playerCards]);

  const handlePlayCard = (cardId: number) => {
    if (playedCardId !== null) return;
    setPlayedCardId(cardId);

    window.setTimeout(() => {
      setPlayerCards((prev) => prev.filter((c) => c.id !== cardId));
      setPlayedCardId(null);
    }, 320);
  };

  return (
    <Column style={{ position: 'relative' }}>
      <TopSeatWrapper>
        <TopHandWrapper>
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={`first-${index}`} style={{ backgroundImage: `url(${RetroImg})` }} />
          ))}
        </TopHandWrapper>
        {playerNames?.top && <NameLabel>{playerNames.top}</NameLabel>}
      </TopSeatWrapper>

      <Row>
        <SideSeatWrapper>
          <VerticalHandWrapper>
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={`left-${index}`} style={{ backgroundImage: `url(${RetroImg})` }} />
            ))}
          </VerticalHandWrapper>
          {playerNames?.left && <NameLabel>{playerNames.left}</NameLabel>}
        </SideSeatWrapper>

        <CentralField />

        <SideSeatWrapper>
          <VerticalHandWrapper>
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={`right-${index}`} style={{ backgroundImage: `url(${RetroImg})` }} />
            ))}
          </VerticalHandWrapper>
          {playerNames?.right && <NameLabel>{playerNames.right}</NameLabel>}
        </SideSeatWrapper>
      </Row>

      <BottomSeatWrapper>
        <FullRow>
          {sortedCards.map((card, index) => (
            <PlayerCard key={`player-${card.id}-${index}`} card={card} isPlayed={playedCardId === card.id} onPlay={() => handlePlayCard(card.id)} />
          ))}
        </FullRow>
      </BottomSeatWrapper>
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
  position: 'relative',
  width: 'calc(100vw - 40px)',
  height: 'calc(20vh - 40px)',
  flexDirection: 'row',
});

const TopHandWrapper = styled(FullRow)({
  gap: '20px',
  position: 'relative',
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
  position: 'relative',
  width: 'calc(20vw - 40px)',
  height: 'calc(60vh - 40px)',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 0,
  '& > div': {
    width: '3vw',
    height: 'auto',
    aspectRatio: '2/3',
    flexShrink: 0,
    border: '1px solid black',
    borderRadius: '8px',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    transform: 'rotate(90deg)',
    '&:not(:last-child)': {
      marginBottom: 'calc((60vh - 40px - 45vw) / 9)',
    },
  },
});

const CentralField = styled(CommonDiv)({
  width: 'calc(60vw - 40px)',
  height: 'calc(60vh - 40px)',
  flexDirection: 'column',
});

export const Column = styled('div')({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
});

export const Row = styled('div')({
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
});

const NameLabel = styled('span')({
  position: 'absolute',
  bottom: 0,
  display: 'block',
  textAlign: 'center',
  color: 'rgba(255, 255, 255, 0.9)',
  fontSize: '0.8rem',
  fontWeight: 600,
  letterSpacing: '0.03em',
  backgroundColor: 'rgba(0, 0, 0, 0.35)',
  borderRadius: '10px',
  padding: '2px 10px',
  whiteSpace: 'nowrap',
  userSelect: 'none',
});

const TopSeatWrapper = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '4px',
  position: 'relative',
});

const SideSeatWrapper = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
  position: 'relative',
});

const BottomSeatWrapper = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '4px',
});
