import { CARDS_IMAGES } from '@/constants/cardsData';
import type { ICard } from '@/dtos/Card';
import { styled } from '@mui/material';
import { type FC } from 'react';

export const PlayerCard: FC<{ card: ICard }> = ({ card }) => <PlayerCardStyled style={{ backgroundImage: `url(${CARDS_IMAGES[card.id]})` }} />;

const PlayerCardStyled = styled('div')({
  width: '6%',
  height: 'auto',
  aspectRatio: '2/3',
  border: '1px solid black',
  borderRadius: '8px',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
});
