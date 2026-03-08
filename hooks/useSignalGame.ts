import { useReducer, useRef, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { SIGNALS, generateNoiseWord, getDifficulty } from '@/constants/game';

export type WordItem = {
  id: string;
  text: string;
  isSignal: boolean;
  x: number;
  fallDuration: number;
};

export type GameState = 'idle' | 'playing' | 'paused' | 'gameover';

export type DeathReason = {
  type: 'tapped_noise' | 'missed_signal';
  word: string;
} | null;

const BEST_SCORE_KEY = '@svn_best_score';

function genId(): string {
  return Date.now().toString() + Math.random().toString(36).substring(2, 11);
}

// REDUCER ALTYAPISI
type State = {
  gameState: GameState;
  score: number;
  bestScore: number;
  words: WordItem[];
  deathReason: DeathReason;
  combo: number;
  maxCombo: number;
};

type Action =
  | { type: 'SET_BEST_SCORE'; score: number }
  | { type: 'START_GAME' }
  | { type: 'SPAWN_WORD'; word: WordItem }
  | { type: 'REMOVE_WORD'; id: string }
  | { type: 'TAP_SIGNAL'; id: string }
  | { type: 'PAUSE_GAME' }
  | { type: 'RESUME_GAME' }
  | { type: 'GAME_OVER'; bestScore?: number; deathReason: DeathReason };

function gameReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_BEST_SCORE':
      return { ...state, bestScore: action.score };
    case 'START_GAME':
      return { ...state, gameState: 'playing', score: 0, words: [], deathReason: null, combo: 0, maxCombo: 0 };
    case 'SPAWN_WORD':
      return { ...state, words: [...state.words, action.word] };
    case 'REMOVE_WORD':
      return { ...state, words: state.words.filter((w) => w.id !== action.id) };
    case 'TAP_SIGNAL': {
      const newCombo = state.combo + 1;
      const bonus = newCombo > 0 && newCombo % 5 === 0 ? 1 : 0;
      return {
        ...state,
        score: state.score + 1 + bonus,
        combo: newCombo,
        maxCombo: Math.max(state.maxCombo, newCombo),
        words: state.words.filter((w) => w.id !== action.id),
      };
    }
    case 'PAUSE_GAME':
      return { ...state, gameState: 'paused' };
    case 'RESUME_GAME':
      return { ...state, gameState: 'playing' };
    case 'GAME_OVER':
      return {
        ...state,
        gameState: 'gameover',
        words: [],
        bestScore: action.bestScore ?? state.bestScore,
        deathReason: action.deathReason,
      };
    default:
      return state;
  }
}

export function useSignalGame(screenWidth: number, hapticsEnabled: boolean) {
  const [state, dispatch] = useReducer(gameReducer, {
    gameState: 'idle',
    score: 0,
    bestScore: 0,
    words: [],
    deathReason: null,
    combo: 0,
    maxCombo: 0,
  });

  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const spawnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPlayingRef = useRef(false);
  const activeIdsRef = useRef<Set<string>>(new Set());
  const hapticsRef = useRef(hapticsEnabled);

  useEffect(() => {
    hapticsRef.current = hapticsEnabled;
  }, [hapticsEnabled]);

  useEffect(() => {
    AsyncStorage.getItem(BEST_SCORE_KEY)
      .then((val) => {
        if (val) dispatch({ type: 'SET_BEST_SCORE', score: parseInt(val, 10) });
      })
      .catch((e) => console.log('AsyncStorage err:', e));
  }, []);

  const clearSpawnTimer = useCallback(() => {
    if (spawnTimerRef.current) {
      clearTimeout(spawnTimerRef.current);
      spawnTimerRef.current = null;
    }
  }, []);

  const spawnWordRef = useRef<() => void>(() => { });

  const scheduleNextSpawn = useCallback(() => {
    if (!isPlayingRef.current) return;
    const { spawnInterval } = getDifficulty(scoreRef.current);
    spawnTimerRef.current = setTimeout(() => {
      spawnWordRef.current();
    }, spawnInterval);
  }, []);

  const recentXRef = useRef<number[]>([]);

  const spawnWord = useCallback(() => {
    if (!isPlayingRef.current) return;

    const { noiseRatio, fallDuration } = getDifficulty(scoreRef.current);
    const isSignal = Math.random() > noiseRatio;
    const baseWord = SIGNALS[Math.floor(Math.random() * SIGNALS.length)];
    const text = isSignal ? baseWord : generateNoiseWord(baseWord);
    const id = genId();
    const WORD_WIDTH = 168;
    const minX = WORD_WIDTH / 2;
    const maxX = screenWidth - WORD_WIDTH / 2;

    // Try to find a non-overlapping X position (max 5 attempts)
    let x = minX + Math.random() * (maxX - minX);
    for (let attempt = 0; attempt < 5; attempt++) {
      const overlaps = recentXRef.current.some((rx) => Math.abs(rx - x) < WORD_WIDTH);
      if (!overlaps) break;
      x = minX + Math.random() * (maxX - minX);
    }

    // Track recent X positions, keep only last 3
    recentXRef.current.push(x);
    if (recentXRef.current.length > 3) recentXRef.current.shift();

    activeIdsRef.current.add(id);
    dispatch({ type: 'SPAWN_WORD', word: { id, text, isSignal, x, fallDuration } });
    scheduleNextSpawn();
  }, [screenWidth, scheduleNextSpawn]);

  useEffect(() => {
    spawnWordRef.current = spawnWord;
  }, [spawnWord]);

  const removeWord = useCallback((id: string) => {
    activeIdsRef.current.delete(id);
    dispatch({ type: 'REMOVE_WORD', id });
  }, []);

  const triggerGameOver = useCallback(
    async (reason: DeathReason) => {
      isPlayingRef.current = false;
      clearSpawnTimer();
      activeIdsRef.current.clear();

      if (hapticsRef.current) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => { });
      }

      const finalScore = scoreRef.current;
      let newBest: number | undefined = undefined;

      try {
        const best = await AsyncStorage.getItem(BEST_SCORE_KEY);
        const bestNum = best ? parseInt(best, 10) : 0;
        if (finalScore > bestNum) {
          await AsyncStorage.setItem(BEST_SCORE_KEY, finalScore.toString());
          newBest = finalScore;
        }
      } catch (e) {
        console.log('AsyncStorage set err:', e);
      }

      dispatch({ type: 'GAME_OVER', bestScore: newBest, deathReason: reason });
    },
    [clearSpawnTimer],
  );

  const tapWord = useCallback(
    (id: string, isSignalWord: boolean, wordText?: string) => {
      if (!isPlayingRef.current) return;
      if (!activeIdsRef.current.has(id)) return;

      if (isSignalWord) {
        if (hapticsRef.current) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => { });
        }
        // combo is 0-indexed before this tap, so +1 to get current combo
        const comboAfter = comboRef.current + 1;
        const bonus = comboAfter > 0 && comboAfter % 5 === 0 ? 1 : 0;
        scoreRef.current += 1 + bonus;
        comboRef.current = comboAfter;
        activeIdsRef.current.delete(id);
        dispatch({ type: 'TAP_SIGNAL', id });
      } else {
        triggerGameOver({ type: 'tapped_noise', word: wordText ?? '???' });
      }
    },
    [triggerGameOver],
  );

  const wordFellOff = useCallback(
    (id: string, isSignalWord: boolean, wordText?: string) => {
      if (!isPlayingRef.current) return;
      if (!activeIdsRef.current.has(id)) return;

      if (isSignalWord) {
        triggerGameOver({ type: 'missed_signal', word: wordText ?? '???' });
      } else {
        removeWord(id);
      }
    },
    [removeWord, triggerGameOver],
  );

  const startGame = useCallback(() => {
    clearSpawnTimer();
    activeIdsRef.current.clear();
    recentXRef.current = [];
    scoreRef.current = 0;
    comboRef.current = 0;
    isPlayingRef.current = true;

    dispatch({ type: 'START_GAME' });

    setTimeout(() => {
      spawnWordRef.current();
    }, 500);
  }, [clearSpawnTimer]);

  const pauseGame = useCallback(() => {
    if (!isPlayingRef.current) return;
    isPlayingRef.current = false;
    clearSpawnTimer();
    dispatch({ type: 'PAUSE_GAME' });
  }, [clearSpawnTimer]);

  const resumeGame = useCallback(() => {
    isPlayingRef.current = true;
    dispatch({ type: 'RESUME_GAME' });
    setTimeout(() => {
      spawnWordRef.current();
    }, 500);
  }, []);

  const resetBestScore = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(BEST_SCORE_KEY);
      dispatch({ type: 'SET_BEST_SCORE', score: 0 });
    } catch (e) {
      console.log('AsyncStorage remove err:', e);
    }
  }, []);

  useEffect(() => {
    return () => {
      isPlayingRef.current = false;
      clearSpawnTimer();
    };
  }, [clearSpawnTimer]);

  return {
    gameState: state.gameState,
    score: state.score,
    bestScore: state.bestScore,
    words: state.words,
    deathReason: state.deathReason,
    combo: state.combo,
    maxCombo: state.maxCombo,
    startGame,
    pauseGame,
    resumeGame,
    tapWord,
    wordFellOff,
    resetBestScore,
  };
}
