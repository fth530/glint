import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  Platform,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { useSignalGame } from '@/hooks/useSignalGame';
import { FallingWord } from '@/components/FallingWord';
import { GameOverOverlay } from '@/components/GameOverOverlay';
import { StartScreen } from '@/components/StartScreen';
import { HowToPlayModal } from '@/components/HowToPlayModal';
import Colors from '@/constants/colors';

const MONO = Platform.select({
  ios: 'Courier New',
  android: 'monospace',
  default: 'monospace',
});

export default function GameScreen() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [showHelp, setShowHelp] = useState(false);

  const { gameState, score, bestScore, words, startGame, tapWord, wordFellOff } =
    useSignalGame(width);

  const onTap = useCallback(
    (id: string, isSignal: boolean) => tapWord(id, isSignal),
    [tapWord],
  );

  const onFallOff = useCallback(
    (id: string, isSignal: boolean) => wordFellOff(id, isSignal),
    [wordFellOff],
  );

  const openHelp = useCallback(() => setShowHelp(true), []);
  const closeHelp = useCallback(() => setShowHelp(false), []);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const botPad = Platform.OS === 'web' ? 34 : insets.bottom;

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {gameState === 'playing' && (
        <>
          <View style={[styles.hud, { paddingTop: topPad + 10 }]}>
            <View style={styles.hudLeft}>
              <Text style={styles.hudPrompt}>{'> '}</Text>
              <Text style={styles.hudScoreLabel}>SCORE</Text>
            </View>
            <Text style={styles.hudScore}>{score}</Text>
            <Pressable onPress={openHelp} style={styles.helpBtn} hitSlop={12}>
              <Text style={styles.helpBtnText}>[ ? ]</Text>
            </Pressable>
          </View>

          <View style={[styles.field, { pointerEvents: 'box-none' }]}>
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

          <View style={[styles.cornerBR, { pointerEvents: 'none' }]}>
            <Text style={styles.cornerText}>
              {`LVL_${Math.floor(score / 5) + 1}`}
            </Text>
          </View>
        </>
      )}

      {gameState === 'idle' && (
        <View
          style={[
            styles.startWrapper,
            { paddingTop: topPad, paddingBottom: botPad },
          ]}
        >
          <StartScreen
            bestScore={bestScore}
            onStart={startGame}
            onHelp={openHelp}
          />
        </View>
      )}

      {gameState === 'gameover' && (
        <GameOverOverlay
          score={score}
          bestScore={bestScore}
          onPlayAgain={startGame}
        />
      )}

      <HowToPlayModal visible={showHelp} onClose={closeHelp} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  hud: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderFaint,
    backgroundColor: 'rgba(0,0,0,0.75)',
  },
  hudLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  hudPrompt: {
    fontSize: 14,
    color: Colors.neon,
    fontFamily: MONO,
  },
  hudScoreLabel: {
    fontSize: 11,
    color: Colors.textFaint,
    fontFamily: MONO,
    letterSpacing: 3,
  },
  hudScore: {
    fontSize: 34,
    fontWeight: '900',
    color: Colors.neon,
    fontFamily: MONO,
  },
  helpBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  helpBtnText: {
    fontSize: 12,
    color: Colors.textDim,
    fontFamily: MONO,
    letterSpacing: 2,
  },
  field: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  cornerBR: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 5,
  },
  cornerText: {
    fontSize: 10,
    color: Colors.textFaint,
    fontFamily: MONO,
    letterSpacing: 2,
  },
  startWrapper: {
    flex: 1,
  },
});
