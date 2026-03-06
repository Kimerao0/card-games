import { type FC } from 'react';
import { Box, Dialog, DialogContent, DialogTitle, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import styled from '@emotion/styled';
import { CARDS_IMAGES, CARDS_LABELS } from '@/constants/cardsData';
import type { PlayHistoryEntry } from './usePlayHistory';

interface PlayHistoryModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly history: PlayHistoryEntry[];
}

export const PlayHistoryModal: FC<PlayHistoryModalProps> = ({ open, onClose, history }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            backgroundColor: '#1a3a1a',
            color: '#fff',
            maxHeight: '80vh',
          },
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Typography variant="h6" component="span" sx={{ fontWeight: 700 }}>
          Giocate precedenti
        </Typography>
        <IconButton onClick={onClose} sx={{ color: 'rgba(255,255,255,0.7)' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        {history.length === 0 ? (
          <Typography sx={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', py: 4 }}>Nessuna giocata ancora.</Typography>
        ) : (
          <EntriesList>
            {history.map((entry, index) => (
              <EntryRow key={index}>
                <EntryHeader>
                  <PlayerNameLabel>{entry.playerName}</PlayerNameLabel>
                  <span>ha giocato</span>
                </EntryHeader>

                <CardsRow>
                  <MiniCard src={CARDS_IMAGES[entry.playedCard.id]} alt={CARDS_LABELS[entry.playedCard.id]} title={CARDS_LABELS[entry.playedCard.id]} />

                  {entry.capturedCards.length > 0 && (
                    <>
                      <CaptureArrow>→</CaptureArrow>
                      <CaptureLabel>presa:</CaptureLabel>
                      {entry.capturedCards.map((card) => (
                        <MiniCard key={card.id} src={CARDS_IMAGES[card.id]} alt={CARDS_LABELS[card.id]} title={CARDS_LABELS[card.id]} />
                      ))}
                    </>
                  )}
                </CardsRow>

                {entry.isScopa && <ScopaBadge>SCOPA!</ScopaBadge>}
              </EntryRow>
            ))}
          </EntriesList>
        )}
      </DialogContent>
    </Dialog>
  );
};

const EntriesList = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  paddingBottom: '8px',
});

const EntryRow = styled('div')({
  padding: '10px 12px',
  borderRadius: '10px',
  backgroundColor: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
});

const EntryHeader = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '0.85rem',
  color: 'rgba(255,255,255,0.7)',
  marginBottom: '8px',
});

const PlayerNameLabel = styled('span')({
  fontWeight: 700,
  color: 'rgba(255,255,255,0.95)',
});

const CardsRow = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  flexWrap: 'wrap',
});

const MiniCard = styled('img')({
  width: '48px',
  height: 'auto',
  aspectRatio: '2/3',
  borderRadius: '6px',
  border: '1px solid rgba(255,255,255,0.2)',
  objectFit: 'cover',
});

const CaptureArrow = styled('span')({
  fontSize: '1.1rem',
  color: 'rgba(255,255,255,0.5)',
  margin: '0 2px',
});

const CaptureLabel = styled('span')({
  fontSize: '0.8rem',
  color: 'rgba(255,255,255,0.5)',
  marginRight: '2px',
});

const ScopaBadge = styled('div')({
  marginTop: '6px',
  display: 'inline-block',
  padding: '2px 10px',
  borderRadius: '999px',
  fontSize: '0.75rem',
  fontWeight: 700,
  color: '#fff',
  backgroundColor: 'rgba(76,175,80,0.5)',
  border: '1px solid rgba(76,175,80,0.7)',
});
