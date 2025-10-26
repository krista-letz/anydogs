import type { Dog as DogType } from '../types';
import './Dog.css';

interface DogProps {
  dog: DogType;
  position: number;
  onClick: () => void;
  boosted: boolean;
  cheetahMode: boolean;
  distractedByCat: boolean;
  barking: boolean;
}

export function Dog({ dog, position, onClick, boosted, cheetahMode, distractedByCat, barking }: DogProps) {
  const sizeMultiplier = {
    'very-small': 0.6,
    'small': 0.8,
    'medium': 1,
    'large': 1.2,
  }[dog.size];

  return (
    <div
      className={`dog ${boosted ? 'boosted' : ''} ${cheetahMode ? 'cheetah' : ''} ${distractedByCat ? 'distracted' : ''}`}
      style={{
        left: `${position}%`,
        transform: `scale(${sizeMultiplier})`,
        ['--dog-scale' as string]: sizeMultiplier,
      }}
      onClick={onClick}
      title={`Click to feed ${dog.name} a treat!`}
    >
      <div
        className="dog-body"
        style={{ 
          backgroundColor: dog.color,
        }}
      >
        <div 
          className="dog-head" 
          style={{ 
            backgroundColor: dog.color,
          }}
        >
          <div 
            className="dog-ear left"
            style={{ 
              backgroundColor: dog.color,
            }}
          ></div>
          <div 
            className="dog-ear right"
            style={{ 
              backgroundColor: dog.color,
            }}
          ></div>
          <div className="dog-eyes">
            <div className="dog-eye"></div>
            <div className="dog-eye"></div>
          </div>
          <div className="dog-nose"></div>
          <div className="dog-mouth"></div>
        </div>
        <div className="dog-legs">
          <div 
            className="dog-leg"
            style={{ 
              backgroundColor: dog.color,
            }}
          ></div>
          <div 
            className="dog-leg"
            style={{ 
              backgroundColor: dog.color,
            }}
          ></div>
        </div>
        <div 
          className="dog-tail"
          style={{ 
            backgroundColor: dog.color,
          }}
        ></div>
      </div>
      {boosted && <div className="treat-icon">🦴</div>}
      {cheetahMode && <div className="cheetah-icon">🐆</div>}
      {distractedByCat && <div className="cat-icon">😺</div>}
      {barking && <div className="bark-text">WOOF!</div>}
    </div>
  );
}
