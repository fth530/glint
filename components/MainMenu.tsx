import React, { useEffect, useCallback, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  withTiming,
  withSpring,
  withDelay,
  useAnimatedStyle,
  Easing,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/context/ThemeContext';

import { GameStats } from '@/hooks/useStats';

type Props = {
  bestScore: number;
  stats: GameStats;
  onPlay: () => void;
  onHowToPlay: () => void;
  onSettings: () => void;
};

export function MainMenu({ bestScore, stats, onPlay, onHowToPlay, onSettings }: Props) {
  const Colors = useColors();
  const fadeIn = useSharedValue(0);
  const slideUp = useSharedValue(30);
  const btnSlide = useSharedValue(40);
  const btnOpacity = useSharedValue(0);
  const titleGlow = useSharedValue(0.7);

  useEffect(() => {
    fadeIn.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) });
    slideUp.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.quad) });
    btnSlide.value = withDelay(200, withTiming(0, { duration: 400, easing: Easing.out(Easing.quad) }));
    btnOpacity.value = withDelay(200, withTiming(1, { duration: 400 }));
    titleGlow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.7, { duration: 2000, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      true,
    );
  }, []);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
    transform: [{ translateY: slideUp.value }],
  }));

  const btnStyle = useAnimatedStyle(() => ({
    opacity: btnOpacity.value,
    transform: [{ translateY: btnSlide.value }],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleGlow.value,
  }));

  const handlePlay = useCallback(() => onPlay(), [onPlay]);
  const handleHow = useCallback(() => onHowToPlay(), [onHowToPlay]);
  const handleSettings = useCallback(() => onSettings(), [onSettings]);

  const themed = useMemo(() => ({
    container: { backgroundColor: Colors.bg },
    subtitle: { color: Colors.textSec },
    statsPanel: { backgroundColor: Colors.bgSoft, borderColor: Colors.border },
    bestBadge: { backgroundColor: Colors.accentLight },
    bestIcon: { backgroundColor: Colors.accentMid },
    bestLabel: { color: Colors.textSec },
    bestValue: { color: Colors.text },
    divider: { backgroundColor: Colors.border },
    statValue: { color: Colors.text },
    statLabel: { color: Colors.textTer },
    btnPrimary: { backgroundColor: Colors.accent, shadowColor: Colors.accent },
    btnSecondary: { backgroundColor: Colors.bgSoft, borderColor: Colors.border },
    btnTextSecondary: { color: Colors.textSec },
  }), [Colors]);

  return (
    <View style={[styles.container, themed.container]}>
      {/* Decorative floating dots */}
      <View style={[styles.dot, styles.dot1, { backgroundColor: Colors.accentLight }]} />
      <View style={[styles.dot, styles.dot2, { backgroundColor: Colors.accentMid }]} />
      <View style={[styles.dot, styles.dot3, { backgroundColor: Colors.dangerLight }]} />

      <Animated.View style={[styles.headerBlock, headerStyle]}>
        <Animated.Text style={[styles.title, { color: Colors.accent }, titleStyle]}>GLINT</Animated.Text>
        <Text style={[styles.subtitle, themed.subtitle]}>Gerçeği yakala, sahteyi geç</Text>
      </Animated.View>

      {(bestScore > 0 || stats.totalGames > 0) && (
        <Animated.View style={[styles.statsPanel, themed.statsPanel, headerStyle]}>
          {bestScore > 0 && (
            <>
              <View style={styles.bestRow}>
                <View style={[styles.bestIcon, themed.bestIcon]}>
                  <Ionicons name="trophy" size={20} color={Colors.accent} />
                </View>
                <View style={styles.bestInfo}>
                  <Text style={[styles.bestLabel, themed.bestLabel]}>EN İYİ SKOR</Text>
                  <Text style={[styles.bestValue, themed.bestValue]}>{bestScore}</Text>
                </View>
                <View style={[styles.bestBadge, themed.bestBadge]}>
                  <Ionicons name="star" size={10} color={Colors.accent} />
                  <Text style={[styles.bestBadgeText, { color: Colors.accent }]}>REKOR</Text>
                </View>
              </View>
              {stats.totalGames > 0 && <View style={[styles.divider, themed.divider]} />}
            </>
          )}
          {stats.totalGames > 0 && (
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, themed.statValue]}>{stats.totalGames}</Text>
                <Text style={[styles.statLabel, themed.statLabel]}>Oyun</Text>
              </View>
              <View style={[styles.statDot, { backgroundColor: Colors.border }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, themed.statValue]}>
                  {Math.round(stats.totalScore / stats.totalGames)}
                </Text>
                <Text style={[styles.statLabel, themed.statLabel]}>Ort. Skor</Text>
              </View>
              <View style={[styles.statDot, { backgroundColor: Colors.border }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, themed.statValue]}>{stats.bestCombo}x</Text>
                <Text style={[styles.statLabel, themed.statLabel]}>Kombo</Text>
              </View>
            </View>
          )}
        </Animated.View>
      )}

      <Animated.View style={[styles.btnStack, btnStyle]}>
        <Pressable
          onPress={handlePlay}
          style={({ pressed }) => [styles.btn, styles.btnPrimary, themed.btnPrimary, pressed && styles.btnPressed]}
          testID="play-button"
        >
          <Ionicons name="play" size={20} color="#fff" />
          <Text style={[styles.btnText, styles.btnTextPrimary]}>OYNA</Text>
        </Pressable>

        <View style={styles.btnRow}>
          <Pressable
            onPress={handleHow}
            style={({ pressed }) => [styles.btn, styles.btnHalf, styles.btnSecondary, themed.btnSecondary, pressed && styles.btnPressed]}
            testID="how-to-play-button"
          >
            <Ionicons name="book-outline" size={16} color={Colors.textSec} />
            <Text style={[styles.btnTextSmall, themed.btnTextSecondary]}>KURALLAR</Text>
          </Pressable>

          <Pressable
            onPress={handleSettings}
            style={({ pressed }) => [styles.btn, styles.btnHalf, styles.btnSecondary, themed.btnSecondary, pressed && styles.btnPressed]}
            testID="settings-button"
          >
            <Ionicons name="settings-outline" size={16} color={Colors.textSec} />
            <Text style={[styles.btnTextSmall, themed.btnTextSecondary]}>AYARLAR</Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  // Decorative dots
  dot: {
    position: 'absolute',
    borderRadius: 100,
  },
  dot1: {
    width: 120,
    height: 120,
    top: '8%',
    right: -30,
    opacity: 0.6,
  },
  dot2: {
    width: 80,
    height: 80,
    top: '15%',
    left: -20,
    opacity: 0.4,
  },
  dot3: {
    width: 60,
    height: 60,
    bottom: '12%',
    right: 20,
    opacity: 0.3,
  },
  headerBlock: {
    marginBottom: 24,
  },
  title: {
    fontSize: 56,
    fontWeight: '900',
    lineHeight: 62,
    letterSpacing: 6,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    marginTop: 8,
    letterSpacing: 0.5,
  },
  statsPanel: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    marginBottom: 24,
  },
  bestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bestIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bestInfo: {
    flex: 1,
  },
  bestLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.5,
  },
  bestValue: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
    lineHeight: 30,
  },
  bestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  bestBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  divider: {
    height: 1,
    marginVertical: 14,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  statDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  btnStack: {
    gap: 12,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  btn: {
    borderRadius: 20,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  btnHalf: {
    flex: 1,
    paddingVertical: 16,
  },
  btnPrimary: {
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  btnSecondary: {
    borderWidth: 1,
  },
  btnPressed: {
    opacity: 0.84,
    transform: [{ scale: 0.98 }],
  },
  btnText: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  btnTextSmall: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  btnTextPrimary: {
    color: '#ffffff',
  },
});
