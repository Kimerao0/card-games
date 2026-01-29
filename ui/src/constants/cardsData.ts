import AssoDenari from '@/assets/cards/napoletane/01_Asso_di_denari.jpg';
import DueDenari from '@/assets/cards/napoletane/02_Due_di_denari.jpg';
import TreDenari from '@/assets/cards/napoletane/03_Tre_di_denari.jpg';
import QuattroDenari from '@/assets/cards/napoletane/04_Quattro_di_denari.jpg';
import CinqueDenari from '@/assets/cards/napoletane/05_Cinque_di_denari.jpg';
import SeiDenari from '@/assets/cards/napoletane/06_Sei_di_denari.jpg';
import SetteDenari from '@/assets/cards/napoletane/07_Sette_di_denari.jpg';
import FanteDenari from '@/assets/cards/napoletane/08_Otto_di_denari.jpg';
import CavalloDenari from '@/assets/cards/napoletane/09_Nove_di_denari.jpg';
import ReDenari from '@/assets/cards/napoletane/10_Dieci_di_denari.jpg';
import AssoCoppe from '@/assets/cards/napoletane/11_Asso_di_coppe.jpg';
import DueCoppe from '@/assets/cards/napoletane/12_Due_di_coppe.jpg';
import TreCoppe from '@/assets/cards/napoletane/13_Tre_di_coppe.jpg';
import QuattroCoppe from '@/assets/cards/napoletane/14_Quattro_di_coppe.jpg';
import CinqueCoppe from '@/assets/cards/napoletane/15_Cinque_di_coppe.jpg';
import SeiCoppe from '@/assets/cards/napoletane/16_Sei_di_coppe.jpg';
import SetteCoppe from '@/assets/cards/napoletane/17_Sette_di_coppe.jpg';
import FanteCoppe from '@/assets/cards/napoletane/18_Otto_di_coppe.jpg';
import CavalloCoppe from '@/assets/cards/napoletane/19_Nove_di_coppe.jpg';
import ReCoppe from '@/assets/cards/napoletane/20_Dieci_di_coppe.jpg';
import AssoSpade from '@/assets/cards/napoletane/21_Asso_di_spade.jpg';
import DueSpade from '@/assets/cards/napoletane/22_Due_di_spade.jpg';
import TreSpade from '@/assets/cards/napoletane/23_Tre_di_spade.jpg';
import QuattroSpade from '@/assets/cards/napoletane/24_Quattro_di_spade.jpg';
import CinqueSpade from '@/assets/cards/napoletane/25_Cinque_di_spade.jpg';
import SeiSpade from '@/assets/cards/napoletane/26_Sei_di_spade.jpg';
import SetteSpade from '@/assets/cards/napoletane/27_Sette_di_spade.jpg';
import FanteSpade from '@/assets/cards/napoletane/28_Otto_di_spade.jpg';
import CavalloSpade from '@/assets/cards/napoletane/29_Nove_di_spade.jpg';
import ReSpade from '@/assets/cards/napoletane/30_Dieci_di_spade.jpg';
import AssoBastoni from '@/assets/cards/napoletane/31_Asso_di_bastoni.jpg';
import DueBastoni from '@/assets/cards/napoletane/32_Due_di_bastoni.jpg';
import TreBastoni from '@/assets/cards/napoletane/33_Tre_di_bastoni.jpg';
import QuattroBastoni from '@/assets/cards/napoletane/34_Quattro_di_bastoni.jpg';
import CinqueBastoni from '@/assets/cards/napoletane/35_Cinque_di_bastoni.jpg';
import SeiBastoni from '@/assets/cards/napoletane/36_Sei_di_bastoni.jpg';
import SetteBastoni from '@/assets/cards/napoletane/37_Sette_di_bastoni.jpg';
import FanteBastoni from '@/assets/cards/napoletane/38_Otto_di_bastoni.jpg';
import CavalloBastoni from '@/assets/cards/napoletane/39_Nove_di_bastoni.jpg';
import ReBastoni from '@/assets/cards/napoletane/40_Dieci_di_bastoni.jpg';
import type { ICard, TCardColors } from '@/dtos/Card';

export const CARDS_IMAGES: Record<number, string> = {
  1: AssoDenari,
  2: DueDenari,
  3: TreDenari,
  4: QuattroDenari,
  5: CinqueDenari,
  6: SeiDenari,
  7: SetteDenari,
  8: FanteDenari,
  9: CavalloDenari,
  10: ReDenari,
  11: AssoCoppe,
  12: DueCoppe,
  13: TreCoppe,
  14: QuattroCoppe,
  15: CinqueCoppe,
  16: SeiCoppe,
  17: SetteCoppe,
  18: FanteCoppe,
  19: CavalloCoppe,
  20: ReCoppe,
  21: AssoSpade,
  22: DueSpade,
  23: TreSpade,
  24: QuattroSpade,
  25: CinqueSpade,
  26: SeiSpade,
  27: SetteSpade,
  28: FanteSpade,
  29: CavalloSpade,
  30: ReSpade,
  31: AssoBastoni,
  32: DueBastoni,
  33: TreBastoni,
  34: QuattroBastoni,
  35: CinqueBastoni,
  36: SeiBastoni,
  37: SetteBastoni,
  38: FanteBastoni,
  39: CavalloBastoni,
  40: ReBastoni,
};

export const CARDS_LABELS: Record<number, string> = {
  1: 'Asso di Denari',
  2: 'Due di Denari',
  3: 'Tre di Denari',
  4: 'Quattro di Denari',
  5: 'Cinque di Denari',
  6: 'Sei di Denari',
  7: 'Sette di Denari',
  8: 'Fante di Denari',
  9: 'Cavallo di Denari',
  10: 'Re di Denari',
  11: 'Asso di Coppe',
  12: 'Due di Coppe',
  13: 'Tre di Coppe',
  14: 'Quattro di Coppe',
  15: 'Cinque di Coppe',
  16: 'Sei di Coppe',
  17: 'Sette di Coppe',
  18: 'Fante di Coppe',
  19: 'Cavallo di Coppe',
  20: 'Re di Coppe',
  21: 'Asso di Spade',
  22: 'Due di Spade',
  23: 'Tre di Spade',
  24: 'Quattro di Spade',
  25: 'Cinque di Spade',
  26: 'Sei di Spade',
  27: 'Sette di Spade',
  28: 'Fante di Spade',
  29: 'Cavallo di Spade',
  30: 'Re di Spade',
  31: 'Asso di Bastoni',
  32: 'Due di Bastoni',
  33: 'Tre di Bastoni',
  34: 'Quattro di Bastoni',
  35: 'Cinque di Bastoni',
  36: 'Sei di Bastoni',
  37: 'Sette di Bastoni',
  38: 'Fante di Bastoni',
  39: 'Cavallo di Bastoni',
  40: 'Re di Bastoni',
};

export const ALL_CARDS: ICard[] = [
  { id: 1, value: 1, color: 'diamonds' },
  { id: 2, value: 2, color: 'diamonds' },
  { id: 3, value: 3, color: 'diamonds' },
  { id: 4, value: 4, color: 'diamonds' },
  { id: 5, value: 5, color: 'diamonds' },
  { id: 6, value: 6, color: 'diamonds' },
  { id: 7, value: 7, color: 'diamonds' },
  { id: 8, value: 8, color: 'diamonds' },
  { id: 9, value: 9, color: 'diamonds' },
  { id: 10, value: 10, color: 'diamonds' },
  { id: 11, value: 1, color: 'hearts' },
  { id: 12, value: 2, color: 'hearts' },
  { id: 13, value: 3, color: 'hearts' },
  { id: 14, value: 4, color: 'hearts' },
  { id: 15, value: 5, color: 'hearts' },
  { id: 16, value: 6, color: 'hearts' },
  { id: 17, value: 7, color: 'hearts' },
  { id: 18, value: 8, color: 'hearts' },
  { id: 19, value: 9, color: 'hearts' },
  { id: 20, value: 10, color: 'hearts' },
  { id: 21, value: 1, color: 'spades' },
  { id: 22, value: 2, color: 'spades' },
  { id: 23, value: 3, color: 'spades' },
  { id: 24, value: 4, color: 'spades' },
  { id: 25, value: 5, color: 'spades' },
  { id: 26, value: 6, color: 'spades' },
  { id: 27, value: 7, color: 'spades' },
  { id: 28, value: 8, color: 'spades' },
  { id: 29, value: 9, color: 'spades' },
  { id: 30, value: 10, color: 'spades' },
  { id: 31, value: 1, color: 'clubs' },
  { id: 32, value: 2, color: 'clubs' },
  { id: 33, value: 3, color: 'clubs' },
  { id: 34, value: 4, color: 'clubs' },
  { id: 35, value: 5, color: 'clubs' },
  { id: 36, value: 6, color: 'clubs' },
  { id: 37, value: 7, color: 'clubs' },
  { id: 38, value: 8, color: 'clubs' },
  { id: 39, value: 9, color: 'clubs' },
  { id: 40, value: 10, color: 'clubs' },
];

export const SUITS_ORDER: TCardColors[] = ['clubs', 'diamonds', 'hearts', 'spades'];
