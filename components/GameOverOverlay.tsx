import React, { useEffect, useCallback } from 'react';
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
  Easing,
} from 'react-native-reanimated';
import Colors from '@/constants/colors';

const MONO = Platform.select({
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
  const contentScale = useSharedValue(0.88);
  const buttonScale = useSharedValue(0.8);
  const glitchX = useSharedValue(0);
  const scanlineOpacity = useSharedValue(0);

  useEffect(() => {
    overlayOpacity.value = withTiming(1, {
      duration: 250,
      easing: Easing.out(Easing.quad),
    });
    contentScale.value = withSpring(1, { damping: 18, stiffness: 200 });
    scanlineOpacity.value = withTiming(1, { duration: 400 });

    glitchX.value = withSequence(
      withTiming(-10, { duration: 40 }),
      withTiming(10, { duration: 40 }),
      withTiming(-6, { duration: 40 }),
      withTiming(6, { duration: 40 }),
      withTiming(0, { duration: 40 }),
    );

    buttonScale.value = withDelay(
      300,
      withSpring(1, { damping: 12, stiffness: 200 }),
    );
  }, []);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlayOpacity.value }));
  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ scale: contentScale.value }, { translateX: glitchX.value }],
  }));
  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
    opacity: buttonScale.value,
  }));

  const handlePress = useCallback(() => onPlayAgain(), [onPlayAgain]);

  const isNewBest = score > 0 && score >= bestScore;

  return (
    <Animated.View style={[styles.overlay, overlayStyle]}>
      <Animated.View style={[styles.content, contentStyle]}>
        <Text style={styles.sysLine}>{'// SYSTEM_FAILURE.log'}</Text>

        <View style={styles.errorBlock}>
          <Text style={styles.errorCode}>ERR_SIGNAL_LOST</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.scoreBlock}>
          <Text style={styles.scoreLabel}>FINAL_SCORE</Text>
          <Text style={styles.scoreValue}>{score}</Text>
        </View>

        {isNewBest ? (
          <View style={styles.newBestBadge}>
            <Text style={styles.newBestText}>NEW HIGH SCORE</Text>
          </View>
        ) : (
          <View style={styles.bestRow}>
            <Text style={styles.bestLabel}>HIGH_SCORE</Text>
            <Text style={styles.bestValue}>{bestScore}</Text>
          </View>
        )}

        <View style={styles.divider} />

        <Animated.View style={buttonStyle}>
          <Pressable
            onPress={handlePress}
            style={({ pressed }) => [
              styles.replayButton,
              pressed && styles.replayButtonPressed,
            ]}
          >
            <Text style={styles.replayText}>RESTART_SYSTEM</Text>
          </Pressable>
        </Animated.View>

        <Text style={styles.hint}>
          {'> tap signal words — ignore the noise'}
        </Text>
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
  content: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#050505',
    borderWidth: 1,
    borderColor: Colors.dangerDim,
    borderRadius: 2,
    padding: 28,
    gap: 0,
  },
  sysLine: {
    fontSize: 10,
    color: Colors.danger,
    fontFamily: MONO,
    letterSpacing: 1,
    opacity: 0.6,
    marginBottom: 16,
  },
  errorBlock: {
    marginBottom: 16,
  },
  errorCode: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.danger,
    fontFamily: MONO,
    letterSpacing: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderFaint,
    marginVertical: 20,
  },
  scoreBlock: {
    marginBottom: 14,
  },
  scoreLabel: {
    fontSize: 10,
    color: Colors.textFaint,
    fontFamily: MONO,
    letterSpacing: 4,
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 72,
    fontWeight: '900',
    color: Colors.neon,
    fontFamily: MONO,
    lineHeight: 80,
  },
  newBestBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.neon,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 2,
    marginBottom: 4,
  },
  newBestText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '900',
    fontFamily: MONO,
    letterSpacing: 3,
  },
  bestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  bestLabel: {
    fontSize: 10,
    color: Colors.textFaint,
    fontFamily: MONO,
    letterSpacing: 3,
  },
  bestValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.neonDim,
    fontFamily: MONO,
  },
  replayButton: {
    borderWidth: 1.5,
    borderColor: Colors.neon,
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 2,
    marginBottom: 16,
  },
  replayButtonPressed: {
    backgroundColor: Colors.neon,
  },
  replayText: {
    fontSize: 13,
    fontWeight: '900',
    fontFamily: MONO,
    letterSpacing: 4,
    color: Colors.neon,
  },
  replayTextPressed: {
    color: '#000000',
  },
  hint: {
    fontSize: 10,
    color: Colors.textFaint,
    fontFamily: MONO,
    letterSpacing: 1,
    textAlign: 'left',
  },
});
