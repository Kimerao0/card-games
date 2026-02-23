import { type FC } from 'react';
import { GameLobbyPage, type GameLobbyConfig } from '@/pages/GameLobbyPage';

const SCOPONE_CONFIG: GameLobbyConfig = {
  gameType: 'ScoponeScientifico',
  title: 'Scopone Scientifico',
  subtitle: 'Il classico gioco di strategia a coppie con tutte le 40 carte. Cattura, calcola, vinci.',
  showcaseCardIds: [1, 11, 21, 31, 10, 20, 30, 40],
  rules: [
    {
      title: 'Obiettivo',
      text: 'Lo Scopone Scientifico si gioca in 4 giocatori divisi in 2 coppie. Vince la coppia che accumula più punti catturando carte preziose dal tavolo.',
    },
    {
      title: 'Distribuzione',
      text: 'Tutte e 40 le carte del mazzo napoletano vengono distribuite: 10 carte a testa. Nessuna carta viene lasciata inizialmente sul tavolo.',
    },
    {
      title: 'Il gioco',
      text: 'A turno ogni giocatore gioca una carta dalla propria mano. Se la carta pareggia il valore di una o più carte sul tavolo, le cattura. Altrimenti la carta rimane sul tavolo.',
    },
    {
      title: 'Catture multiple',
      text: 'È possibile catturare più carte sommando i loro valori. Ad esempio, un 7 può catturare un 3 e un 4 oppure un 7 singolo.',
    },
    {
      title: 'Lo Scopone',
      text: 'Se un giocatore cattura tutte le carte presenti sul tavolo fa "scopa" (o "scopone"). Ogni scopa vale un punto bonus aggiuntivo.',
    },
    {
      title: 'Punteggio',
      text: 'Al termine della mano si contano i punti: carte catturate (chi ne ha di più), settebello (7 di denari), denari (chi ne ha di più), primiera (combinazione di punteggi per seme) e scope.',
    },
  ],
  theme: {
    pageBackground: 'linear-gradient(160deg, #1a3a1a 0%, #2d5a27 30%, #1b4332 70%, #0d2818 100%)',
    createButtonMain: '#2e7d32',
    createButtonDark: '#1b5e20',
    rulesHeadingColor: '#1b5e20',
    rulesDividerColor: '#c8e6c9',
    rulesTitleColor: '#2e7d32',
    rulesItemBackground: '#f1f8e9',
    rulesItemBorderColor: '#66bb6a',
  },
};

export const ScoponeScientifico: FC = () => <GameLobbyPage config={SCOPONE_CONFIG} />;
