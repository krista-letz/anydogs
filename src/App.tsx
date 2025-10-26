import { useState, useEffect, useRef } from 'react';
import type { GameStatus, DogRaceState, Pickup, WeatherType } from './types';
import { DOGS } from './data/dogs';
import { RaceTrack } from './components/RaceTrack';
import { Confetti } from './components/Confetti';
import './App.css';

const BASE_SPEED = 0.015;
const SPEED_VARIANCE = 0.12;
const BOOST_MULTIPLIER = 1.5;
const BOOST_DURATION = 2000;
const CHEETAH_MULTIPLIER = 3.0;
const CHEETAH_DURATION = 4000;
const CAT_SLOW_MULTIPLIER = 0.3;
const CAT_DURATION = 2000;
const SUNNY_SPEED_MULTIPLIER = 1.1;
const RAINY_SPEED_MULTIPLIER = 0.8;

const MAX_TREATS_PER_DOG = 5;
const MAX_CHEETAH_PER_DOG = 3;

function App() {
  const [gameStatus, setGameStatus] = useState<GameStatus>('ready');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [weather, setWeather] = useState<WeatherType>('sunny');
  const [showTutorial, setShowTutorial] = useState(true);
  const [commentary, setCommentary] = useState<string>('');
  const lastWeatherChangeRef = useRef<number>(0);
  const lastCommentaryRef = useRef<number>(0);
  const lastLeaderRef = useRef<string | null>(null);
  const rainHappenedRef = useRef<boolean>(false);
  const [raceStates, setRaceStates] = useState<Map<string, DogRaceState>>(
    new Map(
      DOGS.map((dog) => [
        dog.id,
        {
          position: 0,
          speed: BASE_SPEED,
          currentSpeed: BASE_SPEED,
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
          fatigue: 0,
          fatiguedByBall: false,
          ballEndTime: 0,
        },
      ])
    )
  );
  const [winner, setWinner] = useState<string | null>(null);
  const [catCrossing, setCatCrossing] = useState(false);
  const [ballThrown, setBallThrown] = useState(false);
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const raceStatesRef = useRef<Map<string, DogRaceState>>(new Map());
  const lastCatEventRef = useRef<number>(0);
  const lastBallEventRef = useRef<number>(0);
  const lastPickupSpawnRef = useRef<number>(0);

  const startRace = () => {
    // Always start sunny
    setWeather('sunny');
    lastWeatherChangeRef.current = Date.now();
    lastCommentaryRef.current = Date.now();
    lastLeaderRef.current = null;
    rainHappenedRef.current = false;
    setCommentary('');
    
    // Start countdown
    setGameStatus('countdown');
    setCountdown(3);
    
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownInterval);
          setGameStatus('racing');
          setCountdown(null);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    
    setWinner(null);
    setCatCrossing(false);
    setBallThrown(false);
    setPickups([]);
    lastCatEventRef.current = Date.now();
    lastBallEventRef.current = Date.now();
    lastPickupSpawnRef.current = Date.now();
    const initialStates = new Map(
      DOGS.map((dog) => [
        dog.id,
        {
          position: 0,
          speed: BASE_SPEED,
          currentSpeed: BASE_SPEED,
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
          fatigue: 0,
          fatiguedByBall: false,
          ballEndTime: 0,
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
      const dog = DOGS.find(d => d.id === dogId);
      // Add fatigue when using power-ups
      const newFatigue = Math.min(state.fatigue + 15, 100);
      const updatedState = {
        ...state,
        boosted: true,
        boostEndTime: Date.now() + BOOST_DURATION,
        treatsUsed: state.treatsUsed + 1,
        barking: true,
        barkEndTime: Date.now() + 600,
        fatigue: newFatigue,
      };
      raceStatesRef.current.set(dogId, updatedState);
      // Immediately update React state to show count change
      setRaceStates(new Map(raceStatesRef.current));
      
      if (dog) {
        setCommentary(`🦴 ${dog.name} gets a treat boost!`);
        lastCommentaryRef.current = Date.now();
      }
    }
  };

  const unlockCheetahSpeed = (dogId: string) => {
    if (gameStatus !== 'racing') return;
    const state = raceStatesRef.current.get(dogId);
    if (state && state.cheetahUsed < MAX_CHEETAH_PER_DOG) {
      const dog = DOGS.find(d => d.id === dogId);
      // Add fatigue when using power-ups
      const newFatigue = Math.min(state.fatigue + 20, 100);
      const updatedState = {
        ...state,
        cheetahMode: true,
        cheetahEndTime: Date.now() + CHEETAH_DURATION,
        cheetahUsed: state.cheetahUsed + 1,
        fatigue: newFatigue,
      };
      raceStatesRef.current.set(dogId, updatedState);
      // Immediately update React state to show count change
      setRaceStates(new Map(raceStatesRef.current));
      
      if (dog) {
        setCommentary(`🐆 ${dog.name} activates cheetah speed!`);
        lastCommentaryRef.current = Date.now();
      }
    }
  };

  useEffect(() => {
    if (gameStatus !== 'racing') return;

    let lastUpdate = Date.now();
    
    const updateRace = () => {
      const now = Date.now();
      let raceFinished = false;
      let winningDog: string | null = null;

      // Rain event - happens once per game, lasts 7 seconds
      if (!rainHappenedRef.current && now - lastWeatherChangeRef.current > 10000 && Math.random() < 0.01) {
        rainHappenedRef.current = true;
        lastWeatherChangeRef.current = now;
        setWeather('rainy');
        setCommentary('🌧️ It\'s starting to rain!');
        lastCommentaryRef.current = now;
        
        // Stop rain after 7 seconds
        setTimeout(() => {
          setWeather('sunny');
          setCommentary('☀️ The sun is back out!');
        }, 7000);
      }

      // Random cat event (0.5% chance every 15 seconds)
      if (now - lastCatEventRef.current > 15000 && Math.random() < 0.005) {
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

      // Random ball event (0.5% chance every 15 seconds)
      if (now - lastBallEventRef.current > 15000 && Math.random() < 0.005) {
        lastBallEventRef.current = now;
        setBallThrown(true);
        setTimeout(() => setBallThrown(false), 2000);
        // Pick a random dog to chase the ball (speeds up)
        const dogIds = Array.from(raceStatesRef.current.keys());
        const randomDogId = dogIds[Math.floor(Math.random() * dogIds.length)];
        const ballState = raceStatesRef.current.get(randomDogId);
        if (ballState) {
          raceStatesRef.current.set(randomDogId, {
            ...ballState,
            fatiguedByBall: true,
            ballEndTime: now + 3000,
          });
        }
      }

      // No more automatic pickups on track

      const newStates = new Map(raceStatesRef.current);

      newStates.forEach((state, dogId) => {
        const isBoosted = state.boosted && now < state.boostEndTime;
        const isCheetahMode = state.cheetahMode && now < state.cheetahEndTime;
        const isDistracted = state.distractedByCat && now < state.catEndTime;
        const isBarking = state.barking && now < state.barkEndTime;
        const isChasingBall = state.fatiguedByBall && now < state.ballEndTime;

        // Decay fatigue over time
        const decayedFatigue = Math.max(0, state.fatigue - 0.5);

        const randomFactor = 1 + (Math.random() - 0.5) * SPEED_VARIANCE;
        let currentSpeed = state.speed * randomFactor;
        
        // Apply fatigue penalty (high fatigue slows down)
        const fatiguePenalty = 1 - (decayedFatigue / 200); // Max 50% speed reduction at 100 fatigue
        
        if (isDistracted) {
          currentSpeed = currentSpeed * CAT_SLOW_MULTIPLIER;
        } else if (isChasingBall) {
          currentSpeed = currentSpeed * 1.8; // Speed boost when chasing ball
        } else if (isCheetahMode) {
          currentSpeed = currentSpeed * CHEETAH_MULTIPLIER;
        } else if (isBoosted) {
          currentSpeed = currentSpeed * BOOST_MULTIPLIER;
        }
        
        // Apply weather effects
        if (weather === 'sunny') {
          currentSpeed = currentSpeed * SUNNY_SPEED_MULTIPLIER;
        } else if (weather === 'rainy') {
          currentSpeed = currentSpeed * RAINY_SPEED_MULTIPLIER;
        }
        
        currentSpeed = currentSpeed * fatiguePenalty;

        const newPosition = Math.min(state.position + currentSpeed, 100);

        if (newPosition >= 100 && !raceFinished) {
          raceFinished = true;
          winningDog = dogId;
        }

        newStates.set(dogId, {
          ...state,
          position: newPosition,
          currentSpeed: currentSpeed,
          boosted: isBoosted,
          cheetahMode: isCheetahMode,
          distractedByCat: isDistracted,
          barking: isBarking,
          fatigue: decayedFatigue,
          fatiguedByBall: isChasingBall,
        });
      });

      raceStatesRef.current = newStates;

      // Race commentary
      if (now - lastCommentaryRef.current > 3000) {
        const sorted = Array.from(newStates.entries())
          .sort((a, b) => b[1].position - a[1].position);
        const currentLeader = sorted[0][0];
        const leaderDog = DOGS.find(d => d.id === currentLeader);
        
        if (currentLeader !== lastLeaderRef.current && leaderDog) {
          setCommentary(`🏃 ${leaderDog.name} takes the lead!`);
          lastCommentaryRef.current = now;
          lastLeaderRef.current = currentLeader;
        } else if (sorted.length >= 2) {
          const gap = sorted[0][1].position - sorted[1][1].position;
          if (gap < 5 && Math.random() < 0.3) {
            const secondDog = DOGS.find(d => d.id === sorted[1][0]);
            if (secondDog && leaderDog) {
              setCommentary(`🔥 ${secondDog.name} is closing in on ${leaderDog.name}!`);
              lastCommentaryRef.current = now;
            }
          }
        }
      }

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
  }, [gameStatus, weather]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameStatus !== 'racing') return;
      
      const numKeys = ['1', '2', '3', '4', '5'];
      const index = numKeys.indexOf(e.key);
      
      if (index !== -1 && index < DOGS.length) {
        if (e.shiftKey) {
          unlockCheetahSpeed(DOGS[index].id);
        } else {
          feedTreat(DOGS[index].id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameStatus]);

  const winnerDog = winner ? DOGS.find((d) => d.id === winner) : null;

  return (
    <div className="app">
      <Confetti show={gameStatus === 'finished'} />
      {showTutorial && (
        <div className="tutorial-overlay" onClick={() => setShowTutorial(false)}>
          <div className="tutorial-content" onClick={(e) => e.stopPropagation()}>
            <h3>How to Play</h3>
            <p>🐕 Click dogs to feed treats (5x per dog)</p>
            <p>🐆 Click cheetah button for turbo speed (3x per dog)</p>
            <p>⛈️ Weather affects speed - sunny = faster, rain = slower</p>
            <button onClick={() => setShowTutorial(false)}>Got it!</button>
          </div>
        </div>
      )}
      <h1>anydogs</h1>

      <div className="controls">
        {gameStatus === 'ready' && (
          <button className="start-button" onClick={startRace}>
            Start Race!
          </button>
        )}
        {gameStatus === 'countdown' && (
          <div className="countdown-overlay">
            <div className="countdown-number">{countdown === 0 ? 'GO!' : countdown}</div>
          </div>
        )}
        {gameStatus === 'racing' && (
          <>
            <div className="racing-status">
              <span className="weather-indicator">{weather === 'sunny' ? '☀️ Sunny' : '🌧️ Rainy'}</span>
              <span>🏁 Race in Progress! Click dogs for treats (5x) · Click 🐆 for cheetah speed (3x)! 🐆</span>
            </div>
            {commentary && (
              <div className="race-commentary">{commentary}</div>
            )}
          </>
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
        ballThrown={ballThrown}
        pickups={pickups}
        weather={weather}
      />
    </div>
  );
}

export default App;
