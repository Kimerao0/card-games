import { type FC } from 'react';
import { Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, List, ListItemButton, ListItemText } from '@mui/material';
import type { IGameSummaryDto } from '@/dtos/Game';

interface JoinGameDialogProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly games: IGameSummaryDto[];
  readonly isLoadingGames: boolean;
  readonly isJoining: boolean;
  readonly onJoinGame: (gameId: string) => void;
}

export const JoinGameDialog: FC<JoinGameDialogProps> = ({ open, onClose, games, isLoadingGames, isJoining, onJoinGame }) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Partite disponibili</DialogTitle>
      <DialogContent>
        {isLoadingGames ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress />
          </Box>
        ) : games.length === 0 ? (
          <Alert severity="info">Nessuna partita disponibile al momento.</Alert>
        ) : (
          <List disablePadding>
            {games.map((game) => (
              <ListItemButton key={game.id} disabled={isJoining} onClick={() => onJoinGame(game.id)}>
                <ListItemText primary={`Partita #${game.id.slice(-6).toUpperCase()}`} secondary={`${game.playersCount}/${game.maxPlayers} giocatori`} />
              </ListItemButton>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Chiudi</Button>
      </DialogActions>
    </Dialog>
  );
};
