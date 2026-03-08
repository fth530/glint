import React, { useCallback, useState, useMemo, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  useWindowDimensions,
  useColorScheme,
  Platform,
  Pressable,
  Text,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  withSequence,
  withTiming,
  useAnimatedStyle,
} from 'react-native-reanimated';

import { useSignalGame } from '@/hooks/useSignalGame';
import { useSettings } from '@/hooks/useSettings';
import { useStats } from '@/hooks/useStats';
import { FallingWord } from '@/components/FallingWord';
import { GameOverOverlay } from '@/components/GameOverOverlay';
import { MainMenu } from '@/components/MainMenu';
import { SettingsScreen } from '@/components/SettingsScreen';
import { HowToPlayModal } from '@/components/HowToPlayModal';
import { PauseOverlay } from '@/components/PauseOverlay';
import { LevelUpBanner } from '@/components/LevelUpBanner';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '@/context/ThemeContext';
import { getLevel, LEVEL_COLORS } from '@/constants/game';
import { WEB_TOP_PAD, WEB_BOT_PAD } from '@/constants/layout';

type AppScreen = 'menu' | 'game' | 'settings';

export default function GameScreen() {
  const Colors = useColors();
  const colorScheme = useColorScheme();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('menu');
  const [showHelp, setShowHelp] = useState(false);

  const { hapticsEnabled, toggleHaptics } = useSettings();
  const { stats, recordGame } = useStats();

  const { gameState, score, bestScore, words, deathReason, combo, maxCombo, startGame, pauseGame, resumeGame, tapWord, wordFellOff, resetBestScore } =
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
    setCurrentScreen('game');
  }, [startGame]);

  const onTap = useCallback(
    (id: string, isSignal: boolean, wordText: string) => tapWord(id, isSignal, wordText),
    [tapWord],
  );

  const onFallOff = useCallback(
    (id: string, isSignal: boolean, wordText: string) => wordFellOff(id, isSignal, wordText),
    [wordFellOff],
  );

  // Record stats on game over
  const prevGameStateRef = useRef(gameState);
  useEffect(() => {
    if (prevGameStateRef.current === 'playing' && gameState === 'gameover') {
      recordGame(score, maxCombo);
    }
    prevGameStateRef.current = gameState;
  }, [gameState]);

  // Level up detection
  const currentLevel = getLevel(score);
  const [showLevelUp, setShowLevelUp] = useState(0);
  const prevLevelRef = useRef(1);
  useEffect(() => {
    if (currentLevel > prevLevelRef.current && gameState === 'playing') {
      setShowLevelUp(currentLevel);
      const timer = setTimeout(() => setShowLevelUp(0), 1400);
      prevLevelRef.current = currentLevel;
      return () => clearTimeout(timer);
    }
    if (gameState === 'idle' || gameState === 'gameover') {
      prevLevelRef.current = 1;
    }
  }, [currentLevel, gameState]);

  // Score pulse animation
  const scoreScale = useSharedValue(1);
  const prevScoreRef = useRef(score);
  useEffect(() => {
    if (score > prevScoreRef.current) {
      scoreScale.value = withSequence(
        withTiming(1.25, { duration: 80 }),
        withTiming(1, { duration: 150 }),
      );
    }
    prevScoreRef.current = score;
  }, [score]);
  const scoreAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scoreScale.value }],
  }));

  const openHelp = useCallback(() => setShowHelp(true), []);
  const closeHelp = useCallback(() => setShowHelp(false), []);

  const topPad = Platform.OS === 'web' ? WEB_TOP_PAD : insets.top;
  const botPad = Platform.OS === 'web' ? WEB_BOT_PAD : insets.bottom;

  // Level progress (0-1 within current level)
  const levelProgress = (score % 5) / 5;
  const levelColor = LEVEL_COLORS[(currentLevel - 1) % LEVEL_COLORS.length];

  const themed = useMemo(() => ({
    root: { backgroundColor: Colors.bg },
    hud: { backgroundColor: Colors.bg, borderBottomColor: Colors.border },
    hudLabel: { color: Colors.textTer },
    hudScore: { color: Colors.text },
    comboBadge: { backgroundColor: Colors.accentLight, borderWidth: 1, borderColor: Colors.accentMid },
    comboText: { color: Colors.accent },
    hudLevel: { backgroundColor: Colors.accentLight },
    hudLevelText: { color: Colors.accent },
    hudIconBtn: { backgroundColor: Colors.bgSoft },
    field: { backgroundColor: Colors.bgSoft },
    progressTrack: { backgroundColor: Colors.border },
    progressFill: { backgroundColor: levelColor },
  }), [Colors, levelColor]);

  return (
    <View style={[styles.root, themed.root]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

      {currentScreen === 'menu' && (
        <View style={[styles.fill, { paddingTop: topPad, paddingBottom: botPad }]}>
          <MainMenu
            bestScore={bestScore}
            stats={stats}
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
          <View style={[styles.hud, themed.hud, { paddingTop: topPad + 8 }]}>
            <Pressable onPress={pauseGame} style={[styles.hudIconBtn, themed.hudIconBtn]} hitSlop={12}>
              <Ionicons name="pause" size={18} color={Colors.textSec} />
            </Pressable>
            <View style={styles.hudCenter}>
              <Text style={[styles.hudLabel, themed.hudLabel]}>SKOR</Text>
              <Animated.Text style={[styles.hudScore, themed.hudScore, scoreAnimStyle]}>{score}</Animated.Text>
            </View>
            <View style={styles.hudRight}>
              <View style={[styles.hudLevel, themed.hudLevel]}>
                <Text style={[styles.hudLevelText, themed.hudLevelText]}>Lv {currentLevel}</Text>
              </View>
              <Pressable onPress={openHelp} style={[styles.hudIconBtn, themed.hudIconBtn]} hitSlop={12}>
                <Ionicons name="help-circle-outline" size={20} color={Colors.textSec} />
              </Pressable>
            </View>
          </View>

          {/* Level progress bar */}
          <View style={[styles.progressTrack, themed.progressTrack]}>
            <View style={[styles.progressFill, themed.progressFill, { width: `${levelProgress * 100}%` }]} />
          </View>

          <View style={[styles.field, themed.field]}>
            {/* Bottom danger zone gradient */}
            <LinearGradient
              colors={['transparent', `${Colors.danger}15`, `${Colors.danger}30`]}
              style={styles.bottomGradient}
              pointerEvents="none"
            />

            {showLevelUp > 0 && <LevelUpBanner level={showLevelUp} />}
            {combo >= 3 && (
              <View style={[styles.comboFloat, themed.comboBadge]}>
                <Text style={[styles.comboText, themed.comboText]}>{combo}x KOMBO</Text>
              </View>
            )}
            {words.map((word) => (
              <FallingWord
                key={word.id}
                word={word}
                screenHeight={height}
                paused={gameState === 'paused'}
                onTap={onTap}
                onFallOff={onFallOff}
              />
            ))}

            {gameState === 'paused' && (
              <PauseOverlay
                score={score}
                onResume={resumeGame}
                onQuit={goToMenu}
              />
            )}

            {gameState === 'gameover' && (
              <GameOverOverlay
                score={score}
                bestScore={bestScore}
                deathReason={deathReason}
                maxCombo={maxCombo}
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
    borderBottomWidth: 1,
    zIndex: 10,
  },
  hudCenter: {
    alignItems: 'center',
    flex: 1,
  },
  hudLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 2,
    marginBottom: 2,
  },
  hudScore: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -1,
    lineHeight: 38,
  },
  hudRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 2,
  },
  comboFloat: {
    position: 'absolute',
    top: 10,
    alignSelf: 'center',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
    zIndex: 50,
  },
  comboText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  hudLevel: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  hudLevelText: {
    fontSize: 12,
    fontWeight: '700',
  },
  hudIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressTrack: {
    height: 3,
    width: '100%',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  field: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    zIndex: 5,
  },
});
