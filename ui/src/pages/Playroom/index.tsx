import { type FC } from 'react';
import { Box, styled } from '@mui/material';
import { CardsField } from '@/pages/Playroom/CardsField';
import type { ICard } from '@/dtos/Card';

interface PlayerNames {
  readonly top?: string;
  readonly left?: string;
  readonly right?: string;
  readonly bottom?: string;
}

type TSeat = 'bottom' | 'right' | 'top' | 'left';

interface PlayroomProps {
  readonly cards?: ICard[];
  readonly tableCards?: ICard[];
  readonly playerNames?: PlayerNames;
  readonly isMyTurn?: boolean;
  readonly onPlayCard?: (cardId: number) => void;
  readonly capturedMine?: number;
  readonly capturedPartner?: number;
  readonly currentTurnSeat?: TSeat;
}

export const Playroom: FC<PlayroomProps> = ({ cards, tableCards, playerNames, isMyTurn, onPlayCard, capturedMine, capturedPartner, currentTurnSeat }) => {
  const playerHand: ICard[] = cards ?? [];
  const table: ICard[] = tableCards ?? [];

  return (
    <PlayroomWrapper>
      <CardsField
        cards={playerHand}
        tableCards={table}
        playerNames={playerNames}
        isMyTurn={!!isMyTurn}
        onPlayCard={onPlayCard}
        capturedMine={capturedMine ?? 0}
        capturedPartner={capturedPartner ?? 0}
        currentTurnSeat={currentTurnSeat}
      />
    </PlayroomWrapper>
  );
};

const PlayroomWrapper = styled(Box)({
  width: '100vw',
  height: '100vh',
  backgroundColor: '#1f7a1f',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
});
