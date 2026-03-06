import React, { useCallback, useState } from 'react';
import {
  View,
  StyleSheet,
  useWindowDimensions,
  Platform,
  Pressable,
  Text,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { useSignalGame } from '@/hooks/useSignalGame';
import { useSettings } from '@/hooks/useSettings';
import { FallingWord } from '@/components/FallingWord';
import { GameOverOverlay } from '@/components/GameOverOverlay';
import { MainMenu } from '@/components/MainMenu';
import { SettingsScreen } from '@/components/SettingsScreen';
import { HowToPlayModal } from '@/components/HowToPlayModal';
import Colors from '@/constants/colors';
import { getLevel } from '@/constants/game';
import { WEB_TOP_PAD, WEB_BOT_PAD } from '@/constants/layout';

type AppScreen = 'menu' | 'game' | 'settings';

export default function GameScreen() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('menu');
  const [showHelp, setShowHelp] = useState(false);

  const { hapticsEnabled, toggleHaptics } = useSettings();

  const { gameState, score, bestScore, words, startGame, tapWord, wordFellOff, resetBestScore } =
    useSignalGame(width, hapticsEnabled);

  const goToGame = useCallback(() => {
    startGame();
    setCurrentScreen('game');
  }, [startGame]);

  const goToMenu = useCallback(() => {
    setCurrentScreen('menu');
  }, []);

  const goToSettings = useCallback(() => {
    setCurrentScreen('settings');
  }, []);

  const handlePlayAgain = useCallback(() => {
    startGame();
  }, [startGame]);

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

  const topPad = Platform.OS === 'web' ? WEB_TOP_PAD : insets.top;
  const botPad = Platform.OS === 'web' ? WEB_BOT_PAD : insets.bottom;

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      {currentScreen === 'menu' && (
        <View style={[styles.fill, { paddingTop: topPad, paddingBottom: botPad }]}>
          <MainMenu
            bestScore={bestScore}
            onPlay={goToGame}
            onHowToPlay={openHelp}
            onSettings={goToSettings}
          />
        </View>
      )}

      {currentScreen === 'settings' && (
        <SettingsScreen
          hapticsEnabled={hapticsEnabled}
          onToggleHaptics={toggleHaptics}
          onResetBestScore={resetBestScore}
          onBack={goToMenu}
        />
      )}

      {currentScreen === 'game' && (
        <>
          <View style={[styles.hud, { paddingTop: topPad + 8 }]}>
            <Pressable onPress={goToMenu} style={styles.hudIconBtn} hitSlop={12}>
              <Ionicons name="arrow-back" size={20} color={Colors.textSec} />
            </Pressable>
            <View style={styles.hudCenter}>
              <Text style={styles.hudLabel}>SCORE</Text>
              <Text style={styles.hudScore}>{score}</Text>
            </View>
            <View style={styles.hudRight}>
              <View style={styles.hudLevel}>
                <Text style={styles.hudLevelText}>Lv {getLevel(score)}</Text>
              </View>
              <Pressable onPress={openHelp} style={styles.hudIconBtn} hitSlop={12}>
                <Ionicons name="help-circle-outline" size={22} color={Colors.textSec} />
              </Pressable>
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

            {gameState === 'gameover' && (
              <GameOverOverlay
                score={score}
                bestScore={bestScore}
                onPlayAgain={handlePlayAgain}
                onBackToMenu={goToMenu}
              />
            )}
          </View>
        </>
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
  fill: {
    flex: 1,
  },
  hud: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: Colors.bg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    zIndex: 10,
  },
  hudCenter: {
    alignItems: 'center',
    flex: 1,
  },
  hudLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textTer,
    letterSpacing: 2,
    marginBottom: 2,
  },
  hudScore: {
    fontSize: 34,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -1,
    lineHeight: 38,
  },
  hudRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 2,
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
});
