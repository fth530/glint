import React, { useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { useSignalGame } from '@/hooks/useSignalGame';
import { FallingWord } from '@/components/FallingWord';
import { GameOverOverlay } from '@/components/GameOverOverlay';
import { StartScreen } from '@/components/StartScreen';

const MONO_FONT = Platform.select({
  ios: 'Courier New',
  android: 'monospace',
  default: 'monospace',
});

export default function GameScreen() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const { gameState, score, bestScore, words, startGame, tapWord, wordFellOff } =
    useSignalGame(width);

  const onTap = useCallback(
    (id: string, isSignal: boolean) => {
      tapWord(id, isSignal);
    },
    [tapWord],
  );

  const onFallOff = useCallback(
    (id: string, isSignal: boolean) => {
      wordFellOff(id, isSignal);
    },
    [wordFellOff],
  );

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const botPad = Platform.OS === 'web' ? 34 : insets.bottom;

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {gameState === 'playing' && (
        <>
          <View style={[styles.hud, { paddingTop: topPad + 12 }]}>
            <View style={styles.scoreBlock}>
              <Text style={styles.hudLabel}>SCORE</Text>
              <Text style={styles.hudScore}>{score}</Text>
            </View>
          </View>

          <View style={styles.field}>
            {words.map((word) => (
              <FallingWord
                key={word.id}
                word={word}
                screenHeight={height}
                onTap={onTap}
                onFallOff={onFallOff}
              />
            ))}
          </View>

          <View style={styles.scanlineRow}>
            {Array.from({ length: 3 }).map((_, i) => (
              <View key={i} style={styles.scanline} />
            ))}
          </View>
        </>
      )}

      {gameState === 'idle' && (
        <View style={[styles.startWrapper, { paddingTop: topPad, paddingBottom: botPad }]}>
          <StartScreen bestScore={bestScore} onStart={startGame} />
        </View>
      )}

      {gameState === 'gameover' && (
        <GameOverOverlay
          score={score}
          bestScore={bestScore}
          onPlayAgain={startGame}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
  },
  hud: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  scoreBlock: {
    alignItems: 'center',
  },
  hudLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.3)',
    fontFamily: MONO_FONT,
    letterSpacing: 4,
    marginBottom: 2,
  },
  hudScore: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    fontFamily: MONO_FONT,
    lineHeight: 36,
  },
  field: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  scanlineRow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-evenly',
    pointerEvents: 'none',
    zIndex: 1,
  },
  scanline: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.015)',
  },
  startWrapper: {
    flex: 1,
  },
});
