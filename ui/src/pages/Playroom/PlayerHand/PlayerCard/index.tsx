import { CARDS_IMAGES } from '@/constants/cardsData';
import type { ICard } from '@/dtos/Card';
import { styled } from '@mui/material';
import { type FC } from 'react';
import RetroImg from '@/assets/cards/napoletane/retro.jpg';

export const PlayerCard: FC<{ card: ICard; isPlayer: boolean }> = ({ card, isPlayer }) => (
  <PlayerCardStyled style={{ backgroundImage: `url(${isPlayer ? CARDS_IMAGES[card.id] : RetroImg})` }} />
);

const PlayerCardStyled = styled('div')({
  width: '6%',
  height: 'auto',
  aspectRatio: '2/3',
  border: '1px solid black',
  borderRadius: '8px',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
});
