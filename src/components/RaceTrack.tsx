import type { Dog, DogRaceState } from '../types';
import { DogLane } from './DogLane';
import './RaceTrack.css';

interface RaceTrackProps {
  dogs: Dog[];
  raceStates: Map<string, DogRaceState>;
  onFeedTreat: (dogId: string) => void;
  onUnlockCheetah: (dogId: string) => void;
  catCrossing: boolean;
}

export function RaceTrack({ dogs, raceStates, onFeedTreat, onUnlockCheetah, catCrossing }: RaceTrackProps) {
  return (
    <div className="race-track">
      <div className="track-header">
        <h2>North Beach, San Francisco</h2>
        <p className="instructions">Click dogs to feed treats 🦴 (5x per dog) · Click 🐆 to unlock cheetah speed (2x per dog)!</p>
      </div>
      {catCrossing && (
        <div className="cat-crossing">
          <div className="cat-sprite">🐱</div>
          <div className="cat-warning">Cat crossing! Dogs distracted!</div>
        </div>
      )}
      <div className="lanes">
        {dogs.map((dog) => {
          const state = raceStates.get(dog.id)!;
          return (
            <DogLane
              key={dog.id}
              dog={dog}
              state={state}
              onFeedTreat={() => onFeedTreat(dog.id)}
              onUnlockCheetah={() => onUnlockCheetah(dog.id)}
            />
          );
        })}
      </div>
    </div>
  );
}

