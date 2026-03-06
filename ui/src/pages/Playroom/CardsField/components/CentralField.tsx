import { type FC } from 'react';
import styled from '@emotion/styled';
import HistoryIcon from '@mui/icons-material/History';
import { CARDS_IMAGES } from '@/constants/cardsData';
import type { ICard } from '@/dtos/Card';

interface CentralFieldProps {
  readonly isMyTurn: boolean;
  readonly capturedMine: number;
  readonly capturedPartner: number;
  readonly localTableCards: ICard[];
  readonly leavingIds: Set<number>;
  readonly enteringIds: Set<number>;
  readonly centerPlayedCard: ICard | null;
  readonly onHistoryClick?: () => void;
}

export const CentralField: FC<CentralFieldProps> = ({ isMyTurn, capturedMine, capturedPartner, localTableCards, leavingIds, enteringIds, centerPlayedCard, onHistoryClick }) => {
  return (
    <CentralFieldWrapper>
      <TurnLabel $myTurn={isMyTurn}>{isMyTurn ? 'Tocca a te' : 'Aspetta il tuo turno'}</TurnLabel>

      <CountersRow>
        <CounterPill>Prese tue: {capturedMine}</CounterPill>
        <CounterPill>Prese partner: {capturedPartner}</CounterPill>
        {onHistoryClick && (
          <HistoryButton onClick={onHistoryClick} title="Giocate precedenti">
            <HistoryIcon sx={{ fontSize: '1rem' }} />
          </HistoryButton>
        )}
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
    </CentralFieldWrapper>
  );
};

const CommonDiv = styled('div')({
  display: 'flex',
  margin: '20px',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '10px',
});

const CentralFieldWrapper = styled(CommonDiv)({
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

const HistoryButton = styled('button')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '32px',
  height: '32px',
  borderRadius: '999px',
  border: '1px solid rgba(255,255,255,0.18)',
  backgroundColor: 'rgba(0,0,0,0.25)',
  color: 'rgba(255,255,255,0.8)',
  cursor: 'pointer',
  transition: 'background-color 200ms ease',
  '&:hover': {
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
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
