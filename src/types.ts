export interface Dog {
  id: string;
  name: string;
  breed: string;
  color: string;
  size: 'very-small' | 'small' | 'medium' | 'large';
  collarColor: string;
}

export interface DogRaceState {
  position: number; // 0-100
  speed: number;
  currentSpeed: number; // Actual speed being used this frame
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
  fatigue: number; // 0-100, affects speed when high
  fatiguedByBall: boolean;
  ballEndTime: number;
}

export type GameStatus = 'ready' | 'countdown' | 'racing' | 'finished';
export type WeatherType = 'sunny' | 'rainy';

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

export interface Pickup {
  id: string;
  type: 'treat' | 'cheetah';
  position: number;
}

