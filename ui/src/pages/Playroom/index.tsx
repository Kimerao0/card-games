import { type FC } from 'react';
import { Box, styled } from '@mui/material';
import { CardsField } from '@/pages/Playroom/CardsField';
import { ALL_CARDS } from '@/constants/cardsData';

export const Playroom: FC = () => {
  // random array di 10 numeri da 1 a 40
  const randomCardIds = Array.from({ length: 10 }, () => Math.floor(Math.random() * 40) + 1);
  const playerHand = randomCardIds.map((id) => ALL_CARDS[id - 1]); // placeholder cards
  return (
    <PlayroomWrapper>
      <CardsField cards={playerHand} />
    </PlayroomWrapper>
  );
};

const PlayroomWrapper = styled(Box)({
  width: '100vw',
  height: '100vh',
  backgroundColor: '#1f7a1f', // verde tavolo
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
});
