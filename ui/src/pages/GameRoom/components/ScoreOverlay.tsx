import { type FC } from 'react';
import { Link } from 'react-router-dom';
import { Box, Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography, styled } from '@mui/material';
import type { IGamePlayerDto, ScoponeScoreResult } from '@/dtos/Game';

interface ScoreOverlayProps {
  readonly scoreResult: ScoponeScoreResult;
  readonly players: IGamePlayerDto[];
}

export const ScoreOverlay: FC<ScoreOverlayProps> = ({ scoreResult, players }) => {
  const { teamA, teamB } = scoreResult;

  const winnerLabel: string = (() => {
    if (teamA.points > teamB.points) return 'Vince Team A!';
    if (teamB.points > teamA.points) return 'Vince Team B!';
    return 'Pareggio!';
  })();

  const getNames = (userIds: string[]): string => userIds.map((id) => players.find((p) => p.userId === id)?.name ?? id).join(' & ');

  const rows: { label: string; a: string; b: string }[] = [
    { label: 'Carte', a: teamA.details.carte ? '✓' : '–', b: teamB.details.carte ? '✓' : '–' },
    { label: 'Denari', a: teamA.details.denari ? '✓' : '–', b: teamB.details.denari ? '✓' : '–' },
    { label: 'Settebello', a: teamA.details.settebello ? '✓' : '–', b: teamB.details.settebello ? '✓' : '–' },
    { label: 'Primiera', a: teamA.details.primiera ? '✓' : '–', b: teamB.details.primiera ? '✓' : '–' },
    { label: 'Scope', a: String(teamA.details.scope), b: String(teamB.details.scope) },
    { label: 'Totale', a: String(teamA.points), b: String(teamB.points) },
  ];

  return (
    <ScoreOverlayBackdrop>
      <ScoreCard elevation={8}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, color: '#1a3a1a' }}>
          Partita terminata!
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#2e7d32' }}>
          {winnerLabel}
        </Typography>

        <Table size="small" sx={{ mb: 3 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Categoria</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>
                Team A
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>
                Team B
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.label}>
                <TableCell>{row.label}</TableCell>
                <TableCell align="center">{row.a}</TableCell>
                <TableCell align="center">{row.b}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Box sx={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#555' }}>
              Team A
            </Typography>
            <Typography variant="body2">{getNames(teamA.userIds)}</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#555' }}>
              Team B
            </Typography>
            <Typography variant="body2">{getNames(teamB.userIds)}</Typography>
          </Box>
        </Box>

        <Box sx={{ mt: 3 }}>
          <Link to="/" style={{ color: '#1976d2', textDecoration: 'underline', fontWeight: 600 }}>
            Torna alla home
          </Link>
        </Box>
      </ScoreCard>
    </ScoreOverlayBackdrop>
  );
};

const ScoreOverlayBackdrop = styled(Box)({
  position: 'fixed',
  inset: 0,
  zIndex: 1300,
  backgroundColor: 'rgba(0, 0, 0, 0.75)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const ScoreCard = styled(Paper)({
  padding: '40px 48px',
  maxWidth: '520px',
  width: '90%',
  textAlign: 'center',
  borderRadius: '16px',
});
