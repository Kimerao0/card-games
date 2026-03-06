import { type FC, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, CircularProgress } from '@mui/material';
import styled from '@emotion/styled';
import type { TGameType } from '@/dtos/Game';
import { useCreateGameMutation, useJoinGameMutation, useListGamesQuery } from '@/store/api/gamesApi';
import { shuffleArray } from '@/utils/shuffleArray';
import { GamePageBackground } from './components/GamePageBackground';
import { GameHero } from './components/GameHero';
import { RulesCard, type RuleItem } from './components/RulesCard';
import { JoinGameDialog } from './components/JoinGameDialog';

export interface GameLobbyTheme {
  readonly pageBackground: string;
  readonly createButtonMain: string;
  readonly createButtonDark: string;
  readonly rulesHeadingColor: string;
  readonly rulesDividerColor: string;
  readonly rulesTitleColor: string;
  readonly rulesItemBackground: string;
  readonly rulesItemBorderColor: string;
}

export interface GameLobbyConfig {
  readonly gameType: TGameType;
  readonly title: string;
  readonly subtitle: string;
  readonly showcaseCardIds: number[];
  readonly rules: RuleItem[];
  readonly theme: GameLobbyTheme;
}

interface GameLobbyPageProps {
  readonly config: GameLobbyConfig;
}

export const GameLobbyPage: FC<GameLobbyPageProps> = ({ config }) => {
  const { gameType, title, subtitle, showcaseCardIds, rules, theme } = config;
  const navigate = useNavigate();
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);

  const [createGame, { isLoading: isCreating }] = useCreateGameMutation();
  const { data: games, isLoading: isLoadingGames } = useListGamesQuery(undefined, { skip: !joinDialogOpen });
  const [joinGame, { isLoading: isJoining }] = useJoinGameMutation();

  const joinableGames = useMemo(() => games?.filter((g) => !g.isUserInGame && g.playersCount < g.maxPlayers) ?? [], [games]);

  const scatteredCards = useMemo(() => {
    const allIds = Array.from({ length: 40 }, (_, i) => i + 1);
    return shuffleArray(allIds).slice(0, 14);
  }, []);

  const handleCreateGame = async (): Promise<void> => {
    try {
      const createdGame = await createGame(gameType).unwrap();
      navigate(`/game/${createdGame.id}`);
    } catch (_err) {
      // Error surfaces via RTK Query hook state
    }
  };

  const handleJoinGame = async (gameId: string): Promise<void> => {
    try {
      await joinGame(gameId).unwrap();
      setJoinDialogOpen(false);
      navigate(`/game/${gameId}`);
    } catch (_err) {
      // Error surfaces via RTK Query hook state
    }
  };

  return (
    <PageWrapper $background={theme.pageBackground}>
      <GamePageBackground scatteredCardIds={scatteredCards} />

      <ContentLayer>
        <GameHero showcaseCardIds={showcaseCardIds} title={title} subtitle={subtitle} />

        <RulesCard
          rules={rules}
          theme={{
            headingColor: theme.rulesHeadingColor,
            dividerColor: theme.rulesDividerColor,
            titleColor: theme.rulesTitleColor,
            itemBackground: theme.rulesItemBackground,
            itemBorderColor: theme.rulesItemBorderColor,
          }}
        />

        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center', pb: 4 }}>
          <Button variant="contained" size="large" sx={createActionButtonSx(theme.createButtonMain, theme.createButtonDark)} onClick={handleCreateGame} disabled={isCreating}>
            {isCreating ? <CircularProgress size={20} color="inherit" /> : 'Crea partita'}
          </Button>
          <Button variant="outlined" size="large" sx={outlinedButtonSx} onClick={() => setJoinDialogOpen(true)}>
            Unisciti ad una partita
          </Button>
        </Box>
      </ContentLayer>

      <JoinGameDialog
        open={joinDialogOpen}
        onClose={() => setJoinDialogOpen(false)}
        games={joinableGames}
        isLoadingGames={isLoadingGames}
        isJoining={isJoining}
        onJoinGame={handleJoinGame}
      />
    </PageWrapper>
  );
};

const createActionButtonSx = (main: string, dark: string) => ({
  px: 5,
  py: 1.5,
  bgcolor: main,
  fontWeight: 600,
  fontSize: '1rem',
  borderRadius: 2,
  textTransform: 'none' as const,
  '&:hover': { bgcolor: dark, transform: 'translateY(-2px)', boxShadow: 6 },
  transition: 'all 0.2s ease',
});

const outlinedButtonSx = {
  px: 5,
  py: 1.5,
  fontWeight: 600,
  fontSize: '1rem',
  borderRadius: 2,
  textTransform: 'none' as const,
  color: '#fff',
  borderColor: 'rgba(255,255,255,0.6)',
  '&:hover': {
    borderColor: '#fff',
    bgcolor: 'rgba(255,255,255,0.1)',
    transform: 'translateY(-2px)',
  },
  transition: 'all 0.2s ease',
};

const PageWrapper = styled('div')<{ $background: string }>(({ $background }) => ({
  position: 'relative',
  width: '100%',
  minHeight: '100%',
  background: $background,
}));

const ContentLayer = styled('div')({
  position: 'relative',
  zIndex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '40px',
  padding: '40px 24px 24px',
});
