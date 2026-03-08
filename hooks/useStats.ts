import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STATS_KEY = '@glint_stats';

export type GameStats = {
  totalGames: number;
  totalScore: number;
  bestScore: number;
  bestCombo: number;
};

const DEFAULT_STATS: GameStats = {
  totalGames: 0,
  totalScore: 0,
  bestScore: 0,
  bestCombo: 0,
};

export function useStats() {
  const [stats, setStats] = useState<GameStats>(DEFAULT_STATS);

  useEffect(() => {
    AsyncStorage.getItem(STATS_KEY)
      .then((val) => {
        if (val) setStats(JSON.parse(val));
      })
      .catch(() => {});
  }, []);

  const recordGame = useCallback(async (score: number, maxCombo: number) => {
    setStats((prev) => {
      const updated: GameStats = {
        totalGames: prev.totalGames + 1,
        totalScore: prev.totalScore + score,
        bestScore: Math.max(prev.bestScore, score),
        bestCombo: Math.max(prev.bestCombo, maxCombo),
      };
      AsyncStorage.setItem(STATS_KEY, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  }, []);

  const resetStats = useCallback(async () => {
    setStats(DEFAULT_STATS);
    await AsyncStorage.removeItem(STATS_KEY).catch(() => {});
  }, []);

  return { stats, recordGame, resetStats };
}
