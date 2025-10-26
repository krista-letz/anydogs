import { useState, useEffect, useRef } from 'react';
import type { GameStatus, DogRaceState } from './types';
import { DOGS } from './data/dogs';
import { RaceTrack } from './components/RaceTrack';
import './App.css';

const BASE_SPEED = 0.015;
const SPEED_VARIANCE = 0.1;
const BOOST_MULTIPLIER = 1.5;
const BOOST_DURATION = 2000;
const CHEETAH_MULTIPLIER = 3.0;
const CHEETAH_DURATION = 4000;
const CAT_SLOW_MULTIPLIER = 0.3;
const CAT_DURATION = 2000;

const MAX_TREATS_PER_DOG = 5;
const MAX_CHEETAH_PER_DOG = 3;

function App() {
  const [gameStatus, setGameStatus] = useState<GameStatus>('ready');
  const [raceStates, setRaceStates] = useState<Map<string, DogRaceState>>(
    new Map(
      DOGS.map((dog) => [
        dog.id,
        {
          position: 0,
          speed: BASE_SPEED,
          boosted: false,
          boostEndTime: 0,
          cheetahMode: false,
          cheetahEndTime: 0,
          distractedByCat: false,
          catEndTime: 0,
          treatsUsed: 0,
          cheetahUsed: 0,
          barking: false,
          barkEndTime: 0,
        },
      ])
    )
  );
  const [winner, setWinner] = useState<string | null>(null);
  const [catCrossing, setCatCrossing] = useState(false);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const raceStatesRef = useRef<Map<string, DogRaceState>>(new Map());
  const lastCatEventRef = useRef<number>(0);

  const startRace = () => {
    setGameStatus('racing');
    setWinner(null);
    setCatCrossing(false);
    lastCatEventRef.current = Date.now();
    const initialStates = new Map(
      DOGS.map((dog) => [
        dog.id,
        {
          position: 0,
          speed: BASE_SPEED,
          boosted: false,
          boostEndTime: 0,
          cheetahMode: false,
          cheetahEndTime: 0,
          distractedByCat: false,
          catEndTime: 0,
          treatsUsed: 0,
          cheetahUsed: 0,
          barking: false,
          barkEndTime: 0,
        },
      ])
    );
    raceStatesRef.current = initialStates;
    setRaceStates(new Map(initialStates));
  };

  const feedTreat = (dogId: string) => {
    if (gameStatus !== 'racing') return;
    const state = raceStatesRef.current.get(dogId);
    if (state && state.treatsUsed < MAX_TREATS_PER_DOG) {
      const updatedState = {
        ...state,
        boosted: true,
        boostEndTime: Date.now() + BOOST_DURATION,
        treatsUsed: state.treatsUsed + 1,
        barking: true,
        barkEndTime: Date.now() + 600,
      };
      raceStatesRef.current.set(dogId, updatedState);
      // Immediately update React state to show count change
      setRaceStates(new Map(raceStatesRef.current));
    }
  };

  const unlockCheetahSpeed = (dogId: string) => {
    if (gameStatus !== 'racing') return;
    const state = raceStatesRef.current.get(dogId);
    if (state && state.cheetahUsed < MAX_CHEETAH_PER_DOG) {
      const updatedState = {
        ...state,
        cheetahMode: true,
        cheetahEndTime: Date.now() + CHEETAH_DURATION,
        cheetahUsed: state.cheetahUsed + 1,
      };
      raceStatesRef.current.set(dogId, updatedState);
      // Immediately update React state to show count change
      setRaceStates(new Map(raceStatesRef.current));
    }
  };

  useEffect(() => {
    if (gameStatus !== 'racing') return;

    let lastUpdate = Date.now();
    
    const updateRace = () => {
      const now = Date.now();
      let raceFinished = false;
      let winningDog: string | null = null;

      // Random cat event (2% chance every 8 seconds)
      if (now - lastCatEventRef.current > 8000 && Math.random() < 0.02) {
        lastCatEventRef.current = now;
        setCatCrossing(true);
        // Hide cat after animation completes
        setTimeout(() => setCatCrossing(false), 3000);
        // Cat distracts all dogs
        raceStatesRef.current.forEach((state, dogId) => {
          raceStatesRef.current.set(dogId, {
            ...state,
            distractedByCat: true,
            catEndTime: now + CAT_DURATION,
          });
        });
      }

      const newStates = new Map(raceStatesRef.current);

      newStates.forEach((state, dogId) => {
        const isBoosted = state.boosted && now < state.boostEndTime;
        const isCheetahMode = state.cheetahMode && now < state.cheetahEndTime;
        const isDistracted = state.distractedByCat && now < state.catEndTime;
        const isBarking = state.barking && now < state.barkEndTime;

        const randomFactor = 1 + (Math.random() - 0.5) * SPEED_VARIANCE;
        let currentSpeed = state.speed * randomFactor;
        
        if (isDistracted) {
          currentSpeed = currentSpeed * CAT_SLOW_MULTIPLIER;
        } else if (isCheetahMode) {
          currentSpeed = currentSpeed * CHEETAH_MULTIPLIER;
        } else if (isBoosted) {
          currentSpeed = currentSpeed * BOOST_MULTIPLIER;
        }

        const newPosition = Math.min(state.position + currentSpeed, 100);

        if (newPosition >= 100 && !raceFinished) {
          raceFinished = true;
          winningDog = dogId;
        }

        newStates.set(dogId, {
          ...state,
          position: newPosition,
          boosted: isBoosted,
          cheetahMode: isCheetahMode,
          distractedByCat: isDistracted,
          barking: isBarking,
        });
      });

      raceStatesRef.current = newStates;

      if (now - lastUpdate > 16) {
        setRaceStates(new Map(newStates));
        lastUpdate = now;
      }

      if (raceFinished && winningDog) {
        setRaceStates(new Map(newStates));
        setGameStatus('finished');
        setWinner(winningDog);
      } else {
        animationFrameRef.current = requestAnimationFrame(updateRace);
      }
    };

    animationFrameRef.current = requestAnimationFrame(updateRace);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameStatus]);

  const winnerDog = winner ? DOGS.find((d) => d.id === winner) : null;

  return (
    <div className="app">
      <h1>anydogs</h1>

      <div className="controls">
        {gameStatus === 'ready' && (
          <button className="start-button" onClick={startRace}>
            Start Race!
          </button>
        )}
        {gameStatus === 'racing' && (
          <div className="racing-status">🏁 Race in Progress! Click dogs for treats (5x) · Click 🐆 for cheetah speed (3x)! 🐆</div>
        )}
        {gameStatus === 'finished' && (
          <>
            <div className="winner-announcement">
              🏆 {winnerDog?.name} wins! 🏆
            </div>
            <button className="start-button" onClick={startRace}>
              Race Again!
            </button>
          </>
        )}
      </div>

      <RaceTrack 
        dogs={DOGS} 
        raceStates={raceStates} 
        onFeedTreat={feedTreat} 
        onUnlockCheetah={unlockCheetahSpeed}
        catCrossing={catCrossing}
      />
    </div>
  );
}

export default App;
