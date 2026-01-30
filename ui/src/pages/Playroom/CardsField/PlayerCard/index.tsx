// PlayerCard.tsx
import { CARDS_IMAGES } from '@/constants/cardsData';
import type { ICard } from '@/dtos/Card';
import { styled } from '@mui/material';
import { type FC } from 'react';

export const PlayerCard: FC<{ card: ICard; onPlay: () => void; isPlayed?: boolean }> = ({ card, onPlay, isPlayed }) => (
  <PlayerCardStyled onClick={onPlay} $isPlayed={!!isPlayed} style={{ backgroundImage: `url(${CARDS_IMAGES[card.id]})` }} role="button" tabIndex={0} />
);

const PlayerCardStyled = styled('div', {
  shouldForwardProp: (prop) => prop !== '$isPlayed',
})<{ $isPlayed: boolean }>(({ $isPlayed }) => ({
  width: '6%',
  height: 'auto',
  aspectRatio: '2/3',
  border: '1px solid black',
  borderRadius: '8px',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  cursor: $isPlayed ? 'default' : 'pointer',
  position: 'relative',
  zIndex: $isPlayed ? 10 : 1,
  transform: $isPlayed ? 'translateY(-240%) scale(1.06)' : 'translateY(0) scale(1)',
  transition: 'transform 280ms ease',
  pointerEvents: $isPlayed ? 'none' : 'auto',
}));
