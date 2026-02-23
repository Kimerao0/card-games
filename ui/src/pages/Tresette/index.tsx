import { type FC } from 'react';
import { GameLobbyPage, type GameLobbyConfig } from '@/pages/GameLobbyPage';

const TRESETTE_CONFIG: GameLobbyConfig = {
  gameType: 'Tresette',
  title: 'Tresette',
  subtitle: 'Il re dei giochi di carte italiani. Gioca a coppie, comunica con i segnali e conquista il maggior numero di punti con prese strategiche.',
  showcaseCardIds: [10, 20, 30, 40, 1, 11, 21, 31],
  rules: [
    {
      title: 'Obiettivo',
      text: 'Il Tresette si gioca in 4 giocatori divisi in 2 coppie. Vince la coppia che raggiunge per prima 31 punti (o il punteggio concordato) sommando i risultati di più mani.',
    },
    {
      title: 'Distribuzione',
      text: 'Vengono distribuite 10 carte a testa da un mazzo napoletano da 40 carte. Nessuna carta viene lasciata scoperta: tutte le 40 carte sono in mano ai giocatori.',
    },
    {
      title: 'Il gioco',
      text: 'Il giocatore di mano guida con una carta; gli altri devono seguire il seme se lo possiedono. Chi gioca la carta più alta del seme di apertura aggiudica la presa e guida nella manche successiva.',
    },
    {
      title: 'Gerarchia delle carte',
      text: "L'ordine di valore (dal più alto al più basso) è: 3, 2, Asso, Re, Cavallo, Fante, 7, 6, 5, 4. I punti sono: Asso (1), 3 (1/3), 2 (1/3), Figure (1/3 ciascuna).",
    },
    {
      title: 'I segnali',
      text: 'La comunicazione tra compagni avviene tramite segnali convenzionali: bussare (picchiare sul tavolo), strisciare, volo o controvolo. Ogni segnale comunica informazioni sulla propria mano al compagno.',
    },
    {
      title: 'Punteggio',
      text: 'Al termine di ogni mano si contano i punti nelle prese: ogni Asso vale 1 punto, ogni 3, 2 o figura vale 1/3 di punto. Il totale per mano è 10 punti e 2/3. Si gioca a partite fino a 31 punti.',
    },
  ],
  theme: {
    pageBackground: 'linear-gradient(160deg, #3a1a1a 0%, #5a2d2d 30%, #431b1b 70%, #280d0d 100%)',
    createButtonMain: '#c62828',
    createButtonDark: '#b71c1c',
    rulesHeadingColor: '#b71c1c',
    rulesDividerColor: '#ffcdd2',
    rulesTitleColor: '#c62828',
    rulesItemBackground: '#fce4ec',
    rulesItemBorderColor: '#ef9a9a',
  },
};

export const Tresette: FC = () => <GameLobbyPage config={TRESETTE_CONFIG} />;
