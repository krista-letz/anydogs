export interface Dog {
  id: string;
  name: string;
  breed: string;
  color: string;
  size: 'very-small' | 'small' | 'medium' | 'large';
}

export interface DogRaceState {
  position: number; // 0-100
  speed: number;
  boosted: boolean;
  boostEndTime: number;
  cheetahMode: boolean;
  cheetahEndTime: number;
  distractedByCat: boolean;
  catEndTime: number;
  treatsUsed: number;
  cheetahUsed: number;
  barking: boolean;
  barkEndTime: number;
}

export type GameStatus = 'ready' | 'racing' | 'finished';

export interface RaceHistory {
  id: string;
  winner: string;
  winnerName: string;
  timestamp: number;
  betCorrect: boolean;
  coinsWon: number;
}

export interface BettingState {
  selectedDog: string | null;
  betAmount: number;
  totalCoins: number;
}

