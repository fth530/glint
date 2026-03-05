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
import { Ionicons } from '@expo/vector-icons';

import { useSignalGame } from '@/hooks/useSignalGame';
import { FallingWord } from '@/components/FallingWord';
import { GameOverOverlay } from '@/components/GameOverOverlay';
import { StartScreen } from '@/components/StartScreen';
import { HowToPlayModal } from '@/components/HowToPlayModal';
import Colors from '@/constants/colors';

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
      <StatusBar style="dark" />

      {gameState === 'playing' && (
        <>
          <View style={[styles.hud, { paddingTop: topPad + 8 }]}>
            <View style={styles.hudLeft}>
              <Text style={styles.hudLabel}>Score</Text>
              <Text style={styles.hudScore}>{score}</Text>
            </View>
            <View style={styles.hudRight}>
              <View style={styles.hudLevel}>
                <Text style={styles.hudLevelText}>Lv {Math.floor(score / 5) + 1}</Text>
              </View>
              <Pressable onPress={openHelp} style={styles.hudIconBtn} hitSlop={12}>
                <Ionicons name="help-circle-outline" size={22} color={Colors.textSec} />
              </Pressable>
            </View>
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
        </>
      )}

      {gameState === 'idle' && (
        <View style={[styles.startWrapper, { paddingTop: topPad, paddingBottom: botPad }]}>
          <StartScreen bestScore={bestScore} onStart={startGame} onHelp={openHelp} />
        </View>
      )}

      {gameState === 'gameover' && (
        <View style={[styles.gameOverWrapper, { paddingTop: topPad, paddingBottom: botPad }]}>
          <GameOverOverlay score={score} bestScore={bestScore} onPlayAgain={startGame} />
        </View>
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
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 14,
    backgroundColor: Colors.bg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  hudLeft: {
    gap: 0,
  },
  hudLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textTer,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  hudScore: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -1,
    lineHeight: 40,
  },
  hudRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingBottom: 4,
  },
  hudLevel: {
    backgroundColor: Colors.accentLight,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  hudLevelText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.accent,
  },
  hudIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.bgSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  field: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: Colors.bgSoft,
  },
  startWrapper: {
    flex: 1,
  },
  gameOverWrapper: {
    flex: 1,
    backgroundColor: Colors.bgSoft,
  },
});
