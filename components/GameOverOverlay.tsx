import React, { useEffect, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  withSpring,
  withDelay,
  withTiming,
  useAnimatedStyle,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';

type Props = {
  score: number;
  bestScore: number;
  onPlayAgain: () => void;
  onBackToMenu: () => void;
};

export function GameOverOverlay({ score, bestScore, onPlayAgain, onBackToMenu }: Props) {
  const overlayOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.88);
  const cardOpacity = useSharedValue(0);
  const btnScale = useSharedValue(0.8);

  useEffect(() => {
    overlayOpacity.value = withTiming(1, { duration: 280, easing: Easing.out(Easing.quad) });
    cardScale.value = withSpring(1, { damping: 18, stiffness: 200 });
    cardOpacity.value = withTiming(1, { duration: 260 });
    btnScale.value = withDelay(260, withSpring(1, { damping: 14, stiffness: 200 }));
  }, []);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlayOpacity.value }));
  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
    opacity: cardOpacity.value,
  }));
  const btnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
    opacity: btnScale.value,
  }));

  const handlePlay = useCallback(() => onPlayAgain(), [onPlayAgain]);
  const handleMenu = useCallback(() => onBackToMenu(), [onBackToMenu]);
  const isNewBest = score > 0 && score >= bestScore;

  return (
    <Animated.View style={[styles.overlay, overlayStyle]}>
      <Animated.View style={[styles.card, cardStyle]}>
        <View style={styles.iconRow}>
          <View style={styles.iconCircle}>
            <Ionicons name="alert-circle" size={32} color={Colors.danger} />
          </View>
        </View>

        <Text style={styles.title}>Game Over</Text>
        <Text style={styles.tagline}>Signal lost</Text>

        <View style={styles.divider} />

        <View style={styles.scoreBlock}>
          <Text style={styles.scoreLabel}>SCORE</Text>
          <Text style={styles.scoreValue}>{score}</Text>
        </View>

        {isNewBest ? (
          <View style={styles.newBestBadge}>
            <Ionicons name="trophy" size={13} color={Colors.accent} />
            <Text style={styles.newBestText}>New Best</Text>
          </View>
        ) : bestScore > 0 ? (
          <View style={styles.bestRow}>
            <Text style={styles.bestLabel}>Best</Text>
            <Text style={styles.bestValue}>{bestScore}</Text>
          </View>
        ) : null}

        <Animated.View style={[styles.btnWrap, btnStyle]}>
          <Pressable
            onPress={handlePlay}
            style={({ pressed }) => [styles.replayBtn, pressed && styles.replayBtnPressed]}
            testID="play-again-button"
          >
            <Ionicons name="refresh" size={20} color="#fff" />
            <Text style={styles.replayText}>Play Again</Text>
          </Pressable>

          <Pressable
            onPress={handleMenu}
            style={({ pressed }) => [styles.menuBtn, pressed && styles.menuBtnPressed]}
            testID="back-to-menu-button"
          >
            <Ionicons name="home-outline" size={16} color={Colors.textSec} />
            <Text style={styles.menuBtnText}>Back to Menu</Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    paddingHorizontal: 32,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: Colors.bgCard,
    borderRadius: 28,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.18,
    shadowRadius: 40,
    elevation: 20,
  },
  iconRow: {
    marginBottom: 20,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.dangerLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  tagline: {
    fontSize: 14,
    color: Colors.textSec,
    marginBottom: 24,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: 24,
  },
  scoreBlock: {
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textTer,
    letterSpacing: 2,
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 64,
    fontWeight: '800',
    color: Colors.text,
    lineHeight: 72,
    letterSpacing: -2,
  },
  newBestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.accentLight,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 28,
  },
  newBestText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.accent,
  },
  bestRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginBottom: 28,
  },
  bestLabel: {
    fontSize: 13,
    color: Colors.textTer,
    fontWeight: '500',
  },
  bestValue: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textSec,
  },
  btnWrap: {
    width: '100%',
    gap: 10,
  },
  replayBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 18,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 6,
  },
  replayBtnPressed: {
    opacity: 0.88,
  },
  replayText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  menuBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 18,
    backgroundColor: Colors.bgSoft,
  },
  menuBtnPressed: {
    opacity: 0.80,
  },
  menuBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSec,
  },
});
