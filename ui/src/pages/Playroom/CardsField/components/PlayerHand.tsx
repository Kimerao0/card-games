import { type FC } from 'react';
import styled from '@emotion/styled';
import type { ICard } from '@/dtos/Card';
import { PlayerCard } from '@/pages/Playroom/CardsField/PlayerCard';

interface PlayerHandProps {
  readonly sortedCards: ICard[];
  readonly playedCardId: number | null;
  readonly isMyTurn: boolean;
  readonly playerName?: string;
  readonly isActive: boolean;
  readonly onPlay: (cardId: number) => void;
}

export const PlayerHand: FC<PlayerHandProps> = ({ sortedCards, playedCardId, isMyTurn, playerName, isActive, onPlay }) => {
  return (
    <BottomSeatWrapper>
      {playerName && <BottomName $active={isActive}>{playerName}</BottomName>}
      <FullRow>
        {sortedCards.map((card, index) => (
          <PlayerCard
            key={`player-${card.id}-${index}`}
            card={card}
            isPlayed={playedCardId === card.id}
            onPlay={() => onPlay(card.id)}
            disabled={!isMyTurn}
          />
        ))}
      </FullRow>
    </BottomSeatWrapper>
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

const BottomSeatWrapper = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '4px',
});
