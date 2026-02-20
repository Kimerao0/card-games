import { type FC, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Box, CircularProgress, Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography, styled } from '@mui/material';
import { ALL_CARDS } from '@/constants/cardsData';
import type { ICard } from '@/dtos/Card';
import type { ScoponeScoreResult } from '@/dtos/Game';
import { useGetGameQuery, useGetGameHandQuery, useGetGamePlayersQuery, useGetGameStateQuery, usePlayCardMutation } from '@/store/api/gamesApi';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentUser } from '@/store/slices/authSlice';
import { Playroom } from '@/pages/Playroom';

interface WaitingRoomProps {
  readonly playersCount: number;
  readonly maxPlayers: number;
  readonly gameId: string;
}

const WaitingRoom: FC<WaitingRoomProps> = ({ playersCount, maxPlayers, gameId }) => {
  return (
    <WaitingWrapper>
      <CircularProgress size={64} sx={{ color: '#4caf50', mb: 3 }} />
      <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>
        In attesa dei giocatori...
      </Typography>
      <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.6)', mb: 3 }}>
        Partita #{gameId.slice(-6).toUpperCase()}
      </Typography>
      <SeatsRow>
        {Array.from({ length: maxPlayers }, (_, i) => (
          <SeatDot key={i} $filled={i < playersCount} />
        ))}
      </SeatsRow>
      <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.85)', mt: 2, mb: 3 }}>
        {playersCount}/{maxPlayers} giocatori connessi
      </Typography>
      <Link to="/" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'underline' }}>
        Torna alla home
      </Link>
    </WaitingWrapper>
  );
};

type TSeat = 'bottom' | 'right' | 'top' | 'left';

export const GameRoom: FC = () => {
  const { id: gameId } = useParams<{ id: string }>();
  const currentUser = useAppSelector(selectCurrentUser);

  const [pollingInterval, setPollingInterval] = useState(0);
  const [statePollingInterval, setStatePollingInterval] = useState(0);

  const { data: game, isLoading: isLoadingGame, isError } = useGetGameQuery(gameId!, { pollingInterval });
  const isReady = game?.status === 'Ready';

  const { data: handDto, isLoading: isLoadingHand } = useGetGameHandQuery(gameId!, {
    skip: !isReady || !game?.isUserInGame,
  });

  const { data: players } = useGetGamePlayersQuery(gameId!, { skip: !isReady });

  const { data: gameState } = useGetGameStateQuery(gameId!, {
    skip: !isReady || !game?.isUserInGame,
    pollingInterval: statePollingInterval,
  });

  const [playCard, { isLoading: isPlaying }] = usePlayCardMutation();

  useEffect(() => {
    if (game?.status === 'Created') {
      setPollingInterval(5000);
      setStatePollingInterval(0);
    } else if (game?.status === 'Ready') {
      setPollingInterval(0);
      setStatePollingInterval(5000);
    } else {
      setPollingInterval(0);
      setStatePollingInterval(0);
    }
  }, [game?.status]);

  const playerCards: ICard[] = useMemo(() => {
    if (!handDto?.handCardIds) return [];
    return handDto.handCardIds.map((id) => ALL_CARDS[id - 1]);
  }, [handDto]);

  const myIndex = useMemo(() => {
    if (!players || !currentUser) return -1;
    return players.findIndex((p) => p.userId === currentUser.id);
  }, [players, currentUser]);

  const playerNames = useMemo(() => {
    if (!players || players.length < 2 || !currentUser) return undefined;
    const currentIndex = players.findIndex((p) => p.userId === currentUser.id);
    if (currentIndex === -1) return undefined;
    const total = players.length;
    const getName = (offset: number): string | undefined => players[(currentIndex + offset) % total]?.name;
    return {
      bottom: getName(0),
      right: getName(1),
      top: getName(2),
      left: getName(3),
    };
  }, [players, currentUser]);

  const isMyTurn = useMemo(() => {
    if (!currentUser || !players || !gameState) return false;
    if (gameState.currentPlayerIndex === null || gameState.currentPlayerIndex === undefined) return false;
    const currentTurnPlayer = players[gameState.currentPlayerIndex];
    if (!currentTurnPlayer) return false;
    return currentTurnPlayer.userId === currentUser.id;
  }, [currentUser, players, gameState]);

  const currentTurnSeat: TSeat | undefined = useMemo(() => {
    if (!players || !gameState) return undefined;
    if (gameState.currentPlayerIndex === null || gameState.currentPlayerIndex === undefined) return undefined;
    if (myIndex === -1) return undefined;

    // seat relativo all'utente:
    // bottom = me (offset 0), right = offset 1, top = offset 2, left = offset 3
    const offset = (gameState.currentPlayerIndex - myIndex + players.length) % players.length;
    if (offset === 0) return 'bottom';
    if (offset === 1) return 'right';
    if (offset === 2) return 'top';
    return 'left';
  }, [players, gameState, myIndex]);

  const tableCards: ICard[] = useMemo(() => {
    if (!gameState?.tableCardIds) return [];
    return gameState.tableCardIds.map((id) => ALL_CARDS[id - 1]);
  }, [gameState?.tableCardIds]);

  const capturedCounts = useMemo(() => {
    if (!currentUser || !players || !gameState || myIndex === -1) {
      return { mine: 0, partner: 0 };
    }

    const byUser = gameState.capturedCardIdsByUser ?? {};
    const mine = (byUser[currentUser.id] ?? []).length;

    const partnerIndex = (myIndex + 2) % players.length;
    const partnerId = players[partnerIndex]?.userId;
    const partner = partnerId ? (byUser[partnerId] ?? []).length : 0;

    return { mine, partner };
  }, [currentUser, players, gameState, myIndex]);

  const prevScopasByUserRef = useRef<Record<string, number>>({});
  const [scopaNotification, setScopaNotification] = useState<string | null>(null);

  useEffect(() => {
    const current = gameState?.scopasByUser;
    if (!current || !players) return;

    const prev = prevScopasByUserRef.current;
    for (const userId of Object.keys(current)) {
      const prevCount = prev[userId] ?? 0;
      const currCount = current[userId] ?? 0;
      if (currCount > prevCount) {
        const player = players.find((p) => p.userId === userId);
        const name = player?.name ?? 'Giocatore';
        setScopaNotification(name);
        window.setTimeout(() => setScopaNotification(null), 2500);
        break;
      }
    }

    prevScopasByUserRef.current = { ...current };
  }, [gameState?.scopasByUser, players]);

  const handlePlay = async (cardId: number) => {
    if (!gameId) return;
    if (!isMyTurn) return;
    if (isPlaying) return;

    try {
      await playCard({ gameId, cardId }).unwrap();
    } catch {
      // polling riallinea
    }
  };

  if (isLoadingGame && !game) {
    return (
      <CenteredWrapper>
        <CircularProgress />
      </CenteredWrapper>
    );
  }

  if (isError || !game) {
    return (
      <CenteredWrapper>
        <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
          Partita non trovata.
        </Typography>
        <Link to="/" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'underline' }}>
          Torna alla home
        </Link>
      </CenteredWrapper>
    );
  }

  if (game.status === 'Created') {
    return <WaitingRoom playersCount={game.playersCount} maxPlayers={game.maxPlayers} gameId={game.id} />;
  }

  if (game.status === 'Ready') {
    if (isLoadingHand) {
      return (
        <CenteredWrapper>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography sx={{ color: '#fff' }}>Caricamento carte...</Typography>
        </CenteredWrapper>
      );
    }
    if (!game.isUserInGame) {
      return (
        <CenteredWrapper>
          <Typography sx={{ color: '#fff' }}>Non sei un partecipante di questa partita.</Typography>
        </CenteredWrapper>
      );
    }
    if (playerCards.length > 0) {
      return (
        <>
          <Playroom
            cards={playerCards}
            playerNames={playerNames}
            tableCards={tableCards}
            isMyTurn={isMyTurn}
            onPlayCard={handlePlay}
            capturedMine={capturedCounts.mine}
            capturedPartner={capturedCounts.partner}
            currentTurnSeat={currentTurnSeat}
          />
          {scopaNotification !== null && (
            <ScopaNotificationOverlay>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                SCOPA!
              </Typography>
              <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.85)', mt: 0.5 }}>
                {scopaNotification}
              </Typography>
            </ScopaNotificationOverlay>
          )}
          {gameState?.scoreResult !== null && gameState?.scoreResult !== undefined && players && (
            <ScoreOverlay scoreResult={gameState.scoreResult} players={players} />
          )}
        </>
      );
    }
  }

  return (
    <CenteredWrapper>
      <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
        Partita in corso.
      </Typography>
      <Link to="/" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'underline' }}>
        Torna alla home
      </Link>
    </CenteredWrapper>
  );
};

interface ScoreOverlayProps {
  readonly scoreResult: ScoponeScoreResult;
  readonly players: { userId: string; name: string }[];
}

const ScoreOverlay: FC<ScoreOverlayProps> = ({ scoreResult, players }) => {
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

const ScopaNotificationOverlay = styled(Box)({
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  zIndex: 1200,
  backgroundColor: 'rgba(46, 125, 50, 0.92)',
  borderRadius: '16px',
  padding: '24px 48px',
  textAlign: 'center',
  pointerEvents: 'none',
  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
});

const RoomBackground = styled(Box)({
  width: '100vw',
  height: '100vh',
  backgroundColor: '#1a3a1a',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
});

const CenteredWrapper = styled(RoomBackground)({});

const WaitingWrapper = styled(RoomBackground)({});

const SeatsRow = styled(Box)({
  display: 'flex',
  gap: '16px',
  margin: '16px 0',
});

const SeatDot = styled(Box)<{ $filled: boolean }>(({ $filled }) => ({
  width: '48px',
  height: '48px',
  borderRadius: '50%',
  backgroundColor: $filled ? '#4caf50' : 'transparent',
  border: $filled ? '3px solid #4caf50' : '3px solid rgba(255,255,255,0.3)',
  transition: 'all 0.3s ease',
}));
