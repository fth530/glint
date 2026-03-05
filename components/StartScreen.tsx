import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  withTiming,
  withSpring,
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
  bestScore: number;
  onStart: () => void;
  onHelp: () => void;
};

export function StartScreen({ bestScore, onStart, onHelp }: Props) {
  const [cursorOn, setCursorOn] = useState(true);
  const fadeIn = useSharedValue(0);
  const buttonScale = useSharedValue(0.88);

  useEffect(() => {
    fadeIn.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.quad) });
    buttonScale.value = withSpring(1, { damping: 14, stiffness: 160 });

    const interval = setInterval(() => {
      setCursorOn((v) => !v);
    }, 530);
    return () => clearInterval(interval);
  }, []);

  const fadeStyle = useAnimatedStyle(() => ({ opacity: fadeIn.value }));
  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleStart = useCallback(() => onStart(), [onStart]);
  const handleHelp = useCallback(() => onHelp(), [onHelp]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.inner, fadeStyle]}>
        <View style={styles.topBar}>
          <Text style={styles.topBarText}>{'// SIGNAL_VS_NOISE v1.0'}</Text>
          <Pressable onPress={handleHelp} style={styles.helpButton} hitSlop={12}>
            <Text style={styles.helpButtonText}>[ ? ]</Text>
          </Pressable>
        </View>

        <View style={styles.titleBlock}>
          <Text style={styles.titleSignal}>SIGNAL</Text>
          <View style={styles.titleSepRow}>
            <View style={styles.titleSepLine} />
            <Text style={styles.titleSep}>vs</Text>
            <View style={styles.titleSepLine} />
          </View>
          <Text style={styles.titleNoise}>NOISE</Text>
        </View>

        <View style={styles.terminalBlock}>
          <View style={styles.termLine}>
            <Text style={styles.termPrompt}>{'> '}</Text>
            <Text style={styles.termText}>system ready.</Text>
          </View>
          <View style={styles.termLine}>
            <Text style={styles.termPrompt}>{'> '}</Text>
            <Text style={styles.termText}>words incoming</Text>
            <Text style={[styles.termCursor, !cursorOn && styles.termCursorHidden]}>
              {'_'}
            </Text>
          </View>
        </View>

        <View style={styles.rulesBlock}>
          <TermRule prefix="TAP" text="signal words to score" color={Colors.neon} />
          <TermRule prefix="MISS" text="a signal → failure" color={Colors.danger} />
          <TermRule prefix="TAP" text="noise → failure" color={Colors.danger} />
        </View>

        {bestScore > 0 && (
          <View style={styles.bestRow}>
            <Text style={styles.bestLabel}>HIGH_SCORE</Text>
            <Text style={styles.bestValue}>{bestScore}</Text>
          </View>
        )}

        <Animated.View style={buttonStyle}>
          <Pressable
            onPress={handleStart}
            style={({ pressed }) => [
              styles.startButton,
              pressed && styles.startButtonPressed,
            ]}
          >
            <Text style={styles.startButtonText}>EXECUTE</Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

function TermRule({ prefix, text, color }: { prefix: string; text: string; color: string }) {
  return (
    <View style={styles.ruleRow}>
      <Text style={[styles.rulePrefix, { color }]}>{prefix}</Text>
      <Text style={styles.ruleText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  inner: {
    gap: 0,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderFaint,
    paddingBottom: 12,
  },
  topBarText: {
    fontSize: 10,
    color: Colors.textFaint,
    fontFamily: MONO,
    letterSpacing: 1,
  },
  helpButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  helpButtonText: {
    fontSize: 12,
    color: Colors.textDim,
    fontFamily: MONO,
    letterSpacing: 2,
  },
  titleBlock: {
    marginBottom: 28,
  },
  titleSignal: {
    fontSize: 52,
    fontWeight: '900',
    color: Colors.neon,
    fontFamily: MONO,
    letterSpacing: 5,
  },
  titleSepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    gap: 10,
  },
  titleSepLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.borderFaint,
  },
  titleSep: {
    fontSize: 12,
    color: Colors.textFaint,
    fontFamily: MONO,
    letterSpacing: 4,
  },
  titleNoise: {
    fontSize: 52,
    fontWeight: '900',
    color: Colors.danger,
    fontFamily: MONO,
    letterSpacing: 5,
  },
  terminalBlock: {
    borderWidth: 1,
    borderColor: Colors.borderFaint,
    backgroundColor: 'rgba(0,255,65,0.03)',
    padding: 14,
    borderRadius: 2,
    gap: 4,
    marginBottom: 20,
  },
  termLine: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  termPrompt: {
    fontSize: 13,
    color: Colors.neon,
    fontFamily: MONO,
  },
  termText: {
    fontSize: 13,
    color: Colors.textDim,
    fontFamily: MONO,
  },
  termCursor: {
    fontSize: 13,
    color: Colors.neon,
    fontFamily: MONO,
  },
  termCursorHidden: {
    opacity: 0,
  },
  rulesBlock: {
    gap: 8,
    marginBottom: 28,
    paddingLeft: 4,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rulePrefix: {
    fontSize: 10,
    fontWeight: '900',
    fontFamily: MONO,
    letterSpacing: 3,
    width: 44,
  },
  ruleText: {
    fontSize: 12,
    color: Colors.textFaint,
    fontFamily: MONO,
    letterSpacing: 1,
  },
  bestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 24,
    paddingLeft: 4,
  },
  bestLabel: {
    fontSize: 10,
    color: Colors.textFaint,
    fontFamily: MONO,
    letterSpacing: 3,
  },
  bestValue: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.neonDim,
    fontFamily: MONO,
  },
  startButton: {
    borderWidth: 1.5,
    borderColor: Colors.neon,
    paddingVertical: 18,
    alignItems: 'center',
    borderRadius: 2,
  },
  startButtonPressed: {
    backgroundColor: Colors.neon,
  },
  startButtonText: {
    fontSize: 15,
    fontWeight: '900',
    fontFamily: MONO,
    letterSpacing: 7,
    color: Colors.neon,
  },
});
