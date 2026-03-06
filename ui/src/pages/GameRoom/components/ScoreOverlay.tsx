import { type FC } from 'react';
import { Link } from 'react-router-dom';
import { Box, Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography, styled } from '@mui/material';
import type { GameScoreResult, IGamePlayerDto, ScoponeScoreResult, TresetteScoreResult } from '@/dtos/Game';

interface ScoreOverlayProps {
  readonly scoreResult: GameScoreResult;
  readonly players: IGamePlayerDto[];
}

const isTresetteResult = (result: GameScoreResult): result is TresetteScoreResult => {
  return result.type === 'tresette';
};

const formatThirds = (thirds: number): string => {
  const wholePoints = Math.floor(thirds / 3);
  const remainder = thirds % 3;
  if (remainder === 0) return String(wholePoints);
  return `${wholePoints} + ${remainder}/3`;
};

export const ScoreOverlay: FC<ScoreOverlayProps> = ({ scoreResult, players }) => {
  const getNames = (userIds: string[]): string => userIds.map((id) => players.find((p) => p.userId === id)?.name ?? id).join(' & ');

  if (isTresetteResult(scoreResult)) {
    return <TresetteScoreOverlay scoreResult={scoreResult} getNames={getNames} />;
  }

  return <ScoponeScoreOverlay scoreResult={scoreResult} getNames={getNames} />;
};

interface ScoponeScoreOverlayProps {
  readonly scoreResult: ScoponeScoreResult;
  readonly getNames: (userIds: string[]) => string;
}

const ScoponeScoreOverlay: FC<ScoponeScoreOverlayProps> = ({ scoreResult, getNames }) => {
  const { teamA, teamB } = scoreResult;

  const winnerLabel: string = (() => {
    if (teamA.points > teamB.points) return 'Vince Team A!';
    if (teamB.points > teamA.points) return 'Vince Team B!';
    return 'Pareggio!';
  })();

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

        <TeamNames teamA={teamA.userIds} teamB={teamB.userIds} getNames={getNames} />

        <Box sx={{ mt: 3 }}>
          <Link to="/" style={{ color: '#1976d2', textDecoration: 'underline', fontWeight: 600 }}>
            Torna alla home
          </Link>
        </Box>
      </ScoreCard>
    </ScoreOverlayBackdrop>
  );
};

interface TresetteScoreOverlayProps {
  readonly scoreResult: TresetteScoreResult;
  readonly getNames: (userIds: string[]) => string;
}

const TresetteScoreOverlay: FC<TresetteScoreOverlayProps> = ({ scoreResult, getNames }) => {
  const { teamA, teamB } = scoreResult;

  const winnerLabel: string = (() => {
    if (teamA.totalThirds > teamB.totalThirds) return 'Vince Team A!';
    if (teamB.totalThirds > teamA.totalThirds) return 'Vince Team B!';
    return 'Pareggio!';
  })();

  const rows: { label: string; a: string; b: string }[] = [
    { label: 'Punti carte', a: formatThirds(teamA.cardPointsThirds), b: formatThirds(teamB.cardPointsThirds) },
    { label: 'Ultima presa', a: teamA.lastTrickBonus ? '✓ (+1)' : '–', b: teamB.lastTrickBonus ? '✓ (+1)' : '–' },
    { label: 'Accusi', a: teamA.accusePoints > 0 ? `+${teamA.accusePoints}` : '–', b: teamB.accusePoints > 0 ? `+${teamB.accusePoints}` : '–' },
    { label: 'Totale', a: teamA.totalPoints, b: teamB.totalPoints },
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

        <TeamNames teamA={teamA.userIds} teamB={teamB.userIds} getNames={getNames} />

        <Box sx={{ mt: 3 }}>
          <Link to="/" style={{ color: '#1976d2', textDecoration: 'underline', fontWeight: 600 }}>
            Torna alla home
          </Link>
        </Box>
      </ScoreCard>
    </ScoreOverlayBackdrop>
  );
};

interface TeamNamesProps {
  readonly teamA: string[];
  readonly teamB: string[];
  readonly getNames: (userIds: string[]) => string;
}

const TeamNames: FC<TeamNamesProps> = ({ teamA, teamB, getNames }) => (
  <Box sx={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#555' }}>
        Team A
      </Typography>
      <Typography variant="body2">{getNames(teamA)}</Typography>
    </Box>
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#555' }}>
        Team B
      </Typography>
      <Typography variant="body2">{getNames(teamB)}</Typography>
    </Box>
  </Box>
);

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
