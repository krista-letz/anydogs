import type { Dog, DogRaceState, Pickup, WeatherType } from '../types';
import { DogLane } from './DogLane';
import './RaceTrack.css';

interface RaceTrackProps {
  dogs: Dog[];
  raceStates: Map<string, DogRaceState>;
  onFeedTreat: (dogId: string) => void;
  onUnlockCheetah: (dogId: string) => void;
  catCrossing: boolean;
  ballThrown: boolean;
  pickups: Pickup[];
  weather: WeatherType;
}

export function RaceTrack({ dogs, raceStates, onFeedTreat, onUnlockCheetah, catCrossing, ballThrown, pickups, weather }: RaceTrackProps) {
  const getPosition = (dogId: string): number => {
    const sorted = Array.from(raceStates.entries())
      .sort((a, b) => b[1].position - a[1].position);
    return sorted.findIndex(([id]) => id === dogId) + 1;
  };

  return (
    <div className={`race-track ${weather}`}>
      {weather === 'rainy' && (
        <div className="rain-overlay">
          {Array.from({ length: 50 }).map((_, i) => (
            <div key={i} className="rain-drop" style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 2}s` }}></div>
          ))}
        </div>
      )}
      <div className="track-header">
        <h2>North Beach, San Francisco</h2>
        <p className="instructions">Click dogs to feed treats 🦴 (5x per dog) · Click 🐆 to unlock cheetah speed (3x per dog)!</p>
      </div>
      {catCrossing && (
        <div className="cat-crossing">
          <div className="cat-sprite">🐱</div>
          <div className="cat-warning">Cat crossing! Dogs distracted!</div>
        </div>
      )}
      {ballThrown && (
        <div className="ball-event">
          <div className="ball-sprite">🎾</div>
          <div className="ball-warning">Ball thrown! Dog chasing!</div>
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
              pickups={pickups}
              position={getPosition(dog.id)}
            />
          );
        })}
      </div>
    </div>
  );
}

