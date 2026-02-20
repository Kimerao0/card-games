import { SUITS_ORDER, CARDS_IMAGES } from '@/constants/cardsData';
import type { ICard } from '@/dtos/Card';
import { PlayerCard } from '@/pages/Playroom/CardsField/PlayerCard';
import styled from '@emotion/styled';
import { type FC, useEffect, useMemo, useRef, useState } from 'react';
import RetroImg from '@/assets/cards/napoletane/retro.jpg';

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
}

export const CardsField: FC<CardsFieldProps> = ({ cards, tableCards, playerNames, isMyTurn, onPlayCard, capturedMine, capturedPartner, currentTurnSeat }) => {
  const [playerCards, setPlayerCards] = useState<ICard[]>(cards);
  const [playedCardId, setPlayedCardId] = useState<number | null>(null);

  // NEW: card preview in center
  const [centerPlayedCard, setCenterPlayedCard] = useState<ICard | null>(null);

  // --- Table animation state ---
  const [localTableCards, setLocalTableCards] = useState<ICard[]>(tableCards);
  const [leavingIds, setLeavingIds] = useState<Set<number>>(new Set());
  const [enteringIds, setEnteringIds] = useState<Set<number>>(new Set());
  const prevTableIdsRef = useRef<number[]>(tableCards.map((c) => c.id));

  useEffect(() => {
    setPlayerCards(cards);
  }, [cards]);

  useEffect(() => {
    const prevIds = prevTableIdsRef.current;
    const nextIds = tableCards.map((c) => c.id);

    const prevSet = new Set(prevIds);
    const nextSet = new Set(nextIds);

    const removed = prevIds.filter((id) => !nextSet.has(id));
    const added = nextIds.filter((id) => !prevSet.has(id));

    if (removed.length > 0) {
      setLeavingIds((prev) => {
        const s = new Set(prev);
        for (const id of removed) s.add(id);
        return s;
      });

      setLocalTableCards((prevLocal) => {
        const localMap = new Map(prevLocal.map((c) => [c.id, c]));
        const incomingMap = new Map(tableCards.map((c) => [c.id, c]));

        const merged: ICard[] = [];
        for (const c of prevLocal) merged.push(c);

        for (const id of nextIds) {
          if (!localMap.has(id) && incomingMap.has(id)) merged.push(incomingMap.get(id)!);
        }
        return merged;
      });

      window.setTimeout(() => {
        setLeavingIds((prev) => {
          const s = new Set(prev);
          for (const id of removed) s.delete(id);
          return s;
        });

        setLocalTableCards((prevLocal) => prevLocal.filter((c) => !removed.includes(c.id)));
      }, 280);
    }

    if (added.length > 0) {
      setLocalTableCards((prevLocal) => {
        const localSet = new Set(prevLocal.map((c) => c.id));
        const nextMap = new Map(tableCards.map((c) => [c.id, c]));

        const merged = [...prevLocal];
        for (const id of added) {
          if (!localSet.has(id) && nextMap.has(id)) merged.push(nextMap.get(id)!);
        }
        return merged;
      });

      setEnteringIds((prev) => {
        const s = new Set(prev);
        for (const id of added) s.add(id);
        return s;
      });

      window.setTimeout(() => {
        setEnteringIds((prev) => {
          const s = new Set(prev);
          for (const id of added) s.delete(id);
          return s;
        });
      }, 280);
    }

    if (removed.length === 0) {
      setLocalTableCards(tableCards);
    }

    prevTableIdsRef.current = nextIds;
  }, [tableCards]);

  const sortedCards = useMemo(() => {
    return [...playerCards].sort((a, b) => {
      const suitDiff = SUITS_ORDER.indexOf(a.color) - SUITS_ORDER.indexOf(b.color);
      if (suitDiff !== 0) return suitDiff;
      return a.value - b.value;
    });
  }, [playerCards]);

  const handlePlayCard = (cardId: number) => {
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
      <TopSeatWrapper>
        <TopHandWrapper>
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={`first-${index}`} style={{ backgroundImage: `url(${RetroImg})` }} />
          ))}
        </TopHandWrapper>
        {playerNames?.top && <NameLabel $active={currentTurnSeat === 'top'}>{playerNames.top}</NameLabel>}
      </TopSeatWrapper>

      <Row>
        <SideSeatWrapper>
          <VerticalHandWrapper>
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={`left-${index}`} style={{ backgroundImage: `url(${RetroImg})` }} />
            ))}
          </VerticalHandWrapper>
          {playerNames?.left && <NameLabel $active={currentTurnSeat === 'left'}>{playerNames.left}</NameLabel>}
        </SideSeatWrapper>

        <CentralField>
          <TurnLabel $myTurn={isMyTurn}>{isMyTurn ? 'Tocca a te' : 'Aspetta il tuo turno'}</TurnLabel>

          <CountersRow>
            <CounterPill>Prese tue: {capturedMine}</CounterPill>
            <CounterPill>Prese partner: {capturedPartner}</CounterPill>
          </CountersRow>

          <TableCardsWrapper>
            {localTableCards.map((c) => (
              <TableCard
                key={`table-${c.id}`}
                $leaving={leavingIds.has(c.id)}
                $entering={enteringIds.has(c.id)}
                style={{ backgroundImage: `url(${CARDS_IMAGES[c.id]})` }}
              />
            ))}
          </TableCardsWrapper>

          {centerPlayedCard && (
            <CenterPlayOverlay>
              <CenterPlayedCard style={{ backgroundImage: `url(${CARDS_IMAGES[centerPlayedCard.id]})` }} />
            </CenterPlayOverlay>
          )}
        </CentralField>

        <SideSeatWrapper>
          <VerticalHandWrapper>
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={`right-${index}`} style={{ backgroundImage: `url(${RetroImg})` }} />
            ))}
          </VerticalHandWrapper>
          {playerNames?.right && <NameLabel $active={currentTurnSeat === 'right'}>{playerNames.right}</NameLabel>}
        </SideSeatWrapper>
      </Row>

      <BottomSeatWrapper>
        {playerNames?.bottom && <BottomName $active={currentTurnSeat === 'bottom'}>{playerNames.bottom}</BottomName>}
        <FullRow>
          {sortedCards.map((card, index) => (
            <PlayerCard
              key={`player-${card.id}-${index}`}
              card={card}
              isPlayed={playedCardId === card.id}
              onPlay={() => handlePlayCard(card.id)}
              disabled={!isMyTurn}
            />
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
  position: 'relative',
});

const TableCardsWrapper = styled('div')({
  width: '100%',
  maxWidth: '560px',
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  gap: '10px',
  padding: '14px 10px',
  borderRadius: '14px',
  backgroundColor: 'rgba(0,0,0,0.12)',
});

const TableCard = styled('div')<{ $leaving: boolean; $entering: boolean }>(({ $leaving, $entering }) => ({
  width: '72px',
  height: 'auto',
  aspectRatio: '2/3',
  border: '1px solid black',
  borderRadius: '10px',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  transition: 'transform 280ms ease, opacity 280ms ease, filter 280ms ease',
  opacity: $leaving ? 0 : 1,
  transform: $leaving ? 'scale(0.78) translateY(-10px)' : $entering ? 'scale(0.92) translateY(6px)' : 'scale(1) translateY(0)',
  filter: $leaving ? 'brightness(1.15)' : 'none',
}));

const CenterPlayOverlay = styled('div')({
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  pointerEvents: 'none',
});

const CenterPlayedCard = styled('div')({
  width: '110px',
  height: 'auto',
  aspectRatio: '2/3',
  borderRadius: '14px',
  border: '1px solid rgba(0,0,0,0.55)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  boxShadow: '0 18px 40px rgba(0,0,0,0.35)',
  transform: 'translateY(-10px) scale(1.02)',
  opacity: 0.98,
  animation: 'popIn 320ms ease',
  '@keyframes popIn': {
    from: { transform: 'translateY(10px) scale(0.92)', opacity: 0 },
    to: { transform: 'translateY(-10px) scale(1.02)', opacity: 0.98 },
  },
});

const CountersRow = styled('div')({
  display: 'flex',
  gap: '10px',
  marginBottom: '10px',
  flexWrap: 'wrap',
  justifyContent: 'center',
});

const CounterPill = styled('div')({
  padding: '6px 12px',
  borderRadius: '999px',
  fontSize: '0.85rem',
  fontWeight: 700,
  color: 'rgba(255,255,255,0.92)',
  backgroundColor: 'rgba(0,0,0,0.25)',
  border: '1px solid rgba(255,255,255,0.18)',
  userSelect: 'none',
});

const TurnLabel = styled('div')<{ $myTurn: boolean }>(({ $myTurn }) => ({
  marginBottom: '10px',
  padding: '6px 14px',
  borderRadius: '999px',
  fontSize: '0.9rem',
  fontWeight: 700,
  color: 'rgba(255,255,255,0.92)',
  backgroundColor: $myTurn ? 'rgba(76,175,80,0.35)' : 'rgba(0,0,0,0.25)',
  border: $myTurn ? '1px solid rgba(76,175,80,0.55)' : '1px solid rgba(255,255,255,0.18)',
  userSelect: 'none',
}));

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

const NameLabel = styled('span')<{ $active: boolean }>(({ $active }) => ({
  position: 'absolute',
  bottom: 0,
  display: 'block',
  textAlign: 'center',
  color: 'rgba(255, 255, 255, 0.9)',
  fontSize: '0.8rem',
  fontWeight: 700,
  letterSpacing: '0.03em',
  backgroundColor: $active ? 'rgba(76, 175, 80, 0.55)' : 'rgba(0, 0, 0, 0.35)',
  borderRadius: '10px',
  padding: '2px 10px',
  whiteSpace: 'nowrap',
  userSelect: 'none',
  boxShadow: $active ? '0 0 18px rgba(76, 175, 80, 0.55)' : 'none',
  border: $active ? '1px solid rgba(76, 175, 80, 0.75)' : '1px solid rgba(255,255,255,0.12)',
}));

const BottomName = styled(NameLabel)({
  position: 'relative',
  marginBottom: '6px',
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
