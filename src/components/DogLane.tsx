import type { Dog as DogType, DogRaceState, Pickup } from '../types';
import { Dog } from './Dog';
import './DogLane.css';

interface DogLaneProps {
  dog: DogType;
  state: DogRaceState;
  onFeedTreat: () => void;
  onUnlockCheetah: () => void;
  pickups: Pickup[];
  position: number;
}

const MAX_TREATS = 5;
const MAX_CHEETAH = 3;

export function DogLane({ dog, state, onFeedTreat, onUnlockCheetah, pickups, position }: DogLaneProps) {
  const treatsRemaining = MAX_TREATS - state.treatsUsed;
  const cheetahRemaining = MAX_CHEETAH - state.cheetahUsed;

  const getPositionEmoji = (pos: number) => {
    const emojis = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
    return emojis[pos - 1] || `${pos}th`;
  };

  return (
    <div className="dog-lane">
      <div className="lane-label">
        <div className="dog-info">
          <div className="dog-name">{dog.name} {getPositionEmoji(position)}</div>
          <div className="power-ups">
            <button 
              className={`power-up-button ${treatsRemaining === 0 ? 'disabled' : ''}`}
              onClick={onFeedTreat}
              disabled={treatsRemaining === 0}
              title={`Feed treat! (${treatsRemaining} remaining)`}
            >
              🦴 <span className="count">{treatsRemaining}</span>
            </button>
            <button 
              className={`power-up-button cheetah ${cheetahRemaining === 0 ? 'disabled' : ''}`}
              onClick={onUnlockCheetah}
              disabled={cheetahRemaining === 0}
              title={`Cheetah speed! (${cheetahRemaining} remaining)`}
            >
              🐆 <span className="count">{cheetahRemaining}</span>
            </button>
          </div>
        </div>
      </div>
      <div className="lane-track">
        <div className="start-line">START</div>
        <div className="finish-line">FINISH</div>
        <div className="finish-ribbon"></div>
        {/* Render pickups on track */}
        {pickups.map((pickup) => (
          <div
            key={pickup.id}
            className={`track-pickup ${pickup.type}`}
            style={{ left: `${pickup.position}%` }}
          >
            {pickup.type === 'treat' ? '🦴' : '🐆'}
          </div>
        ))}
        <Dog 
          dog={dog} 
          position={state.position} 
          onClick={onFeedTreat}
          boosted={state.boosted}
          cheetahMode={state.cheetahMode}
          distractedByCat={state.distractedByCat}
          barking={state.barking}
          fatiguedByBall={state.fatiguedByBall}
        />
      </div>
    </div>
  );
}

