import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  withSpring,
  withSequence,
  withDelay,
  withTiming,
  useAnimatedStyle,
  interpolate,
  Easing,
} from 'react-native-reanimated';

const MONO_FONT = Platform.select({
  ios: 'Courier New',
  android: 'monospace',
  default: 'monospace',
});

type Props = {
  score: number;
  bestScore: number;
  onPlayAgain: () => void;
};

export function GameOverOverlay({ score, bestScore, onPlayAgain }: Props) {
  const overlayOpacity = useSharedValue(0);
  const contentScale = useSharedValue(0.85);
  const buttonScale = useSharedValue(0.8);
  const glitchX = useSharedValue(0);

  useEffect(() => {
    overlayOpacity.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.quad) });
    contentScale.value = withSpring(1, { damping: 16, stiffness: 180 });

    glitchX.value = withSequence(
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(-5, { duration: 50 }),
      withTiming(5, { duration: 50 }),
      withTiming(0, { duration: 50 }),
    );

    buttonScale.value = withDelay(
      350,
      withSpring(1, { damping: 12, stiffness: 200 }),
    );
  }, []);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ scale: contentScale.value }, { translateX: glitchX.value }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
    opacity: interpolate(buttonScale.value, [0.8, 1], [0, 1]),
  }));

  const handlePress = useCallback(() => {
    onPlayAgain();
  }, [onPlayAgain]);

  const isNewBest = score > 0 && score >= bestScore;

  return (
    <Animated.View style={[styles.overlay, overlayStyle]}>
      <Animated.View style={[styles.content, contentStyle]}>
        <View style={styles.titleRow}>
          <Text style={styles.titleRed}>GAME</Text>
          <Text style={styles.titleWhite}> OVER</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>SCORE</Text>
          <Text style={styles.scoreValue}>{score}</Text>
        </View>

        {isNewBest ? (
          <View style={styles.newBestBadge}>
            <Text style={styles.newBestText}>NEW BEST</Text>
          </View>
        ) : (
          <View style={styles.bestContainer}>
            <Text style={styles.bestLabel}>BEST</Text>
            <Text style={styles.bestValue}>{bestScore}</Text>
          </View>
        )}

        <Animated.View style={buttonStyle}>
          <Pressable
            onPress={handlePress}
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.buttonText}>PLAY AGAIN</Text>
          </Pressable>
        </Animated.View>

        <Text style={styles.hint}>tap signal words — ignore the noise</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  content: {
    width: '80%',
    maxWidth: 320,
    alignItems: 'center',
    gap: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 20,
  },
  titleRed: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FF3B30',
    fontFamily: MONO_FONT,
    letterSpacing: 4,
  },
  titleWhite: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFFFF',
    fontFamily: MONO_FONT,
    letterSpacing: 4,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginBottom: 28,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    fontFamily: MONO_FONT,
    letterSpacing: 4,
    marginBottom: 6,
  },
  scoreValue: {
    fontSize: 72,
    fontWeight: '900',
    color: '#FFFFFF',
    fontFamily: MONO_FONT,
    lineHeight: 80,
  },
  newBestBadge: {
    backgroundColor: '#00FF85',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 3,
    marginBottom: 32,
  },
  newBestText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '900',
    fontFamily: MONO_FONT,
    letterSpacing: 3,
  },
  bestContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 32,
  },
  bestLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.35)',
    fontFamily: MONO_FONT,
    letterSpacing: 3,
  },
  bestValue: {
    fontSize: 18,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.55)',
    fontFamily: MONO_FONT,
  },
  button: {
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 3,
    marginBottom: 24,
  },
  buttonPressed: {
    backgroundColor: '#FFFFFF',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    fontFamily: MONO_FONT,
    letterSpacing: 4,
  },
  hint: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.2)',
    fontFamily: MONO_FONT,
    letterSpacing: 1.5,
    textAlign: 'center',
  },
});
