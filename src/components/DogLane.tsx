import type { Dog as DogType, DogRaceState } from '../types';
import { Dog } from './Dog';
import './DogLane.css';

interface DogLaneProps {
  dog: DogType;
  state: DogRaceState;
  onFeedTreat: () => void;
  onUnlockCheetah: () => void;
}

const MAX_TREATS = 5;
const MAX_CHEETAH = 3;

export function DogLane({ dog, state, onFeedTreat, onUnlockCheetah }: DogLaneProps) {
  const treatsRemaining = MAX_TREATS - state.treatsUsed;
  const cheetahRemaining = MAX_CHEETAH - state.cheetahUsed;

  return (
    <div className="dog-lane">
      <div className="lane-label">
        <div className="dog-info">
          <div className="dog-name">{dog.name}</div>
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
        <Dog 
          dog={dog} 
          position={state.position} 
          onClick={onFeedTreat}
          boosted={state.boosted}
          cheetahMode={state.cheetahMode}
          distractedByCat={state.distractedByCat}
          barking={state.barking}
        />
      </div>
    </div>
  );
}

