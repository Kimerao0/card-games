import { type FC } from 'react';
import { Box, styled } from '@mui/material';
import { CardsField } from '@/pages/Playroom/CardsField';
import { ALL_CARDS } from '@/constants/cardsData';
import type { ICard } from '@/dtos/Card';

interface PlayerNames {
  readonly top?: string;
  readonly left?: string;
  readonly right?: string;
  readonly bottom?: string;
}

interface PlayroomProps {
  readonly cards?: ICard[];
  readonly playerNames?: PlayerNames;
}

export const Playroom: FC<PlayroomProps> = ({ cards, playerNames }) => {
  const playerHand: ICard[] = cards ?? Array.from({ length: 10 }, () => Math.floor(Math.random() * 40) + 1).map((id) => ALL_CARDS[id - 1]);
  return (
    <PlayroomWrapper>
      <CardsField cards={playerHand} playerNames={playerNames} />
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
