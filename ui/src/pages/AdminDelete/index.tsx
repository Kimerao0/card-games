import { type FC, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import styled from '@emotion/styled';
import { useListGamesQuery, useDeleteGameMutation } from '@/store/api/gamesApi';
import type { IGameSummaryDto } from '@/dtos/Game';

export const AdminDelete: FC = () => {
  const { data: games, isLoading, isError } = useListGamesQuery();
  const [deleteGame, { isLoading: isDeleting }] = useDeleteGameMutation();
  const [selectedGame, setSelectedGame] = useState<IGameSummaryDto | null>(null);

  const handleItemClick = (game: IGameSummaryDto): void => {
    setSelectedGame(game);
  };

  const handleConfirmDelete = () => {
    if (!selectedGame) return;
    deleteGame(selectedGame.id);
    setSelectedGame(null);
  };

  const handleCancelDelete = (): void => {
    setSelectedGame(null);
  };

  const formatDate = (isoString: string): string => {
    return new Date(isoString).toLocaleString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const shortId = (id: string): string => id.slice(0, 8).toUpperCase();

  return (
    <PageWrapper>
      <ContentBox>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 700, mb: 0.5 }}>
          Amministrazione partite
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
          Clicca su una partita per eliminarla.
        </Typography>

        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        )}

        {isError && (
          <Typography color="error" sx={{ py: 2 }}>
            Errore nel caricamento delle partite.
          </Typography>
        )}

        {games && games.length === 0 && <Typography sx={{ color: 'text.secondary', py: 2 }}>Nessuna partita trovata.</Typography>}

        {games && games.length > 0 && (
          <List disablePadding>
            {games.map((game) => (
              <GameListItem key={game.id} onClick={() => handleItemClick(game)} disableRipple={false}>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                        #{shortId(game.id)}
                      </Typography>
                      <Chip
                        label={`${game.playersCount} / ${game.maxPlayers} giocatori`}
                        size="small"
                        sx={{
                          bgcolor: game.playersCount === game.maxPlayers ? '#e8f5e9' : '#fff3e0',
                          color: game.playersCount === game.maxPlayers ? '#2e7d32' : '#e65100',
                          fontWeight: 500,
                        }}
                      />
                    </Box>
                  }
                  secondary={`Creata il ${formatDate(game.createdAt)}`}
                />
                <DeleteIcon sx={{ color: 'error.light', opacity: 0.6 }} />
              </GameListItem>
            ))}
          </List>
        )}
      </ContentBox>

      <Dialog open={selectedGame !== null} onClose={handleCancelDelete}>
        <DialogTitle>Elimina partita</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Sei sicuro di voler eliminare la partita <strong>#{selectedGame ? shortId(selectedGame.id) : ''}</strong>? Questa azione non è reversibile.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} disabled={isDeleting}>
            Annulla
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
          >
            Elimina
          </Button>
        </DialogActions>
      </Dialog>
    </PageWrapper>
  );
};

const PageWrapper = styled('div')({
  width: '100%',
  minHeight: '100%',
  background: '#f5f5f5',
  display: 'flex',
  justifyContent: 'center',
  padding: '40px 24px',
  marginTop: '34px',
});

const ContentBox = styled('div')({
  width: '100%',
  maxWidth: '640px',
});

const GameListItem = styled(ListItemButton)({
  background: '#ffffff',
  borderRadius: '10px',
  marginBottom: '10px',
  padding: '14px 20px',
  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  '&:hover': {
    background: '#fdecea',
    boxShadow: '0 2px 8px rgba(211,47,47,0.15)',
  },
  transition: 'background 0.18s ease, box-shadow 0.18s ease',
});
