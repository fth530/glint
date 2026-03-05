import { useState, useRef, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

const SIGNALS = ['KEDİ', 'KÖPEK', 'TAVŞAN', 'ASLAN', 'KAPLAN', 'KARTAL'];
const NOISES = ['K3Dİ', 'D0G', 'KÖP3K', 'T4VŞAN', 'A5LAN', 'MASA', 'ELMA'];

export type WordItem = {
  id: string;
  text: string;
  isSignal: boolean;
  x: number;
  fallDuration: number;
};

export type GameState = 'idle' | 'playing' | 'gameover';

const BEST_SCORE_KEY = '@svn_best_score';

function getDifficulty(score: number) {
  const level = Math.floor(score / 5);
  const fallDuration = Math.max(1400, 4200 - level * 220);
  const spawnInterval = Math.max(550, 2200 - level * 110);
  const noiseRatio = Math.min(0.72, 0.28 + level * 0.05);
  return { fallDuration, spawnInterval, noiseRatio };
}

function genId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

export function useSignalGame(screenWidth: number) {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [words, setWords] = useState<WordItem[]>([]);

  const scoreRef = useRef(0);
  const spawnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPlayingRef = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(BEST_SCORE_KEY).then((val) => {
      if (val) setBestScore(parseInt(val, 10));
    });
  }, []);

  const clearSpawnTimer = useCallback(() => {
    if (spawnTimerRef.current) {
      clearTimeout(spawnTimerRef.current);
      spawnTimerRef.current = null;
    }
  }, []);

  const spawnWordRef = useRef<() => void>(() => {});

  const scheduleNextSpawn = useCallback(() => {
    if (!isPlayingRef.current) return;
    const { spawnInterval } = getDifficulty(scoreRef.current);
    spawnTimerRef.current = setTimeout(() => {
      spawnWordRef.current();
    }, spawnInterval);
  }, []);

  const spawnWord = useCallback(() => {
    if (!isPlayingRef.current) return;

    const { noiseRatio, fallDuration } = getDifficulty(scoreRef.current);
    const isSignal = Math.random() > noiseRatio;
    const pool = isSignal ? SIGNALS : NOISES;
    const text = pool[Math.floor(Math.random() * pool.length)];
    const id = genId();
    const WORD_WIDTH = 160;
    const x = WORD_WIDTH / 2 + Math.random() * (screenWidth - WORD_WIDTH);

    setWords((prev) => [...prev, { id, text, isSignal, x, fallDuration }]);
    scheduleNextSpawn();
  }, [screenWidth, scheduleNextSpawn]);

  useEffect(() => {
    spawnWordRef.current = spawnWord;
  }, [spawnWord]);

  const triggerGameOver = useCallback(
    async (finalScore: number) => {
      isPlayingRef.current = false;
      clearSpawnTimer();
      setGameState('gameover');
      setWords([]);

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      const best = await AsyncStorage.getItem(BEST_SCORE_KEY);
      const bestNum = best ? parseInt(best, 10) : 0;
      if (finalScore > bestNum) {
        await AsyncStorage.setItem(BEST_SCORE_KEY, finalScore.toString());
        setBestScore(finalScore);
      }
    },
    [clearSpawnTimer],
  );

  const tapWord = useCallback(
    (id: string, isSignalWord: boolean) => {
      if (!isPlayingRef.current) return;

      if (isSignalWord) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const newScore = scoreRef.current + 1;
        scoreRef.current = newScore;
        setScore(newScore);
        setWords((prev) => prev.filter((w) => w.id !== id));
      } else {
        triggerGameOver(scoreRef.current);
      }
    },
    [triggerGameOver],
  );

  const wordFellOff = useCallback(
    (id: string, isSignalWord: boolean) => {
      if (!isPlayingRef.current) return;

      if (isSignalWord) {
        triggerGameOver(scoreRef.current);
      } else {
        setWords((prev) => prev.filter((w) => w.id !== id));
      }
    },
    [triggerGameOver],
  );

  const startGame = useCallback(() => {
    clearSpawnTimer();
    scoreRef.current = 0;
    isPlayingRef.current = true;
    setScore(0);
    setWords([]);
    setGameState('playing');

    setTimeout(() => {
      spawnWordRef.current();
    }, 400);
  }, [clearSpawnTimer]);

  useEffect(() => {
    return () => {
      isPlayingRef.current = false;
      clearSpawnTimer();
    };
  }, [clearSpawnTimer]);

  return { gameState, score, bestScore, words, startGame, tapWord, wordFellOff };
}
