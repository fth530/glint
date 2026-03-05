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
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  useAnimatedStyle,
  Easing,
} from 'react-native-reanimated';

const MONO_FONT = Platform.select({
  ios: 'Courier New',
  android: 'monospace',
  default: 'monospace',
});

type Props = {
  bestScore: number;
  onStart: () => void;
};

export function StartScreen({ bestScore, onStart }: Props) {
  const pulse = useSharedValue(1);
  const titleOpacity = useSharedValue(0);
  const subtitleOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(0.9);

  useEffect(() => {
    titleOpacity.value = withTiming(1, { duration: 600 });
    subtitleOpacity.value = withTiming(1, { duration: 900 });
    buttonScale.value = withSpring(1, { damping: 14, stiffness: 160 });

    pulse.value = withRepeat(
      withSequence(
        withTiming(1.04, { duration: 900, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, []);

  const titleStyle = useAnimatedStyle(() => ({ opacity: titleOpacity.value }));
  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));
  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const handlePress = useCallback(() => {
    onStart();
  }, [onStart]);

  return (
    <View style={styles.container}>
      <Animated.View style={titleStyle}>
        <Text style={styles.titleSignal}>SIGNAL</Text>
        <View style={styles.titleDividerRow}>
          <View style={styles.titleDividerLine} />
          <Text style={styles.titleVs}>VS</Text>
          <View style={styles.titleDividerLine} />
        </View>
        <Text style={styles.titleNoise}>NOISE</Text>
      </Animated.View>

      <Animated.View style={[styles.rules, subtitleStyle]}>
        <RuleRow color="#00FF85" label="TAP" desc="real words" />
        <RuleRow color="#FF3B30" label="IGNORE" desc="fake / leet words" />
        <RuleRow color="#FF3B30" label="MISS" desc="a real word = game over" />
      </Animated.View>

      {bestScore > 0 && (
        <Animated.View style={[styles.bestContainer, subtitleStyle]}>
          <Text style={styles.bestLabel}>BEST</Text>
          <Text style={styles.bestValue}>{bestScore}</Text>
        </Animated.View>
      )}

      <Animated.View style={[buttonStyle, pulseStyle]}>
        <Pressable
          onPress={handlePress}
          style={({ pressed }) => [
            styles.startButton,
            pressed && styles.startButtonPressed,
          ]}
        >
          <Text style={styles.startButtonText}>START</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

function RuleRow({
  color,
  label,
  desc,
}: {
  color: string;
  label: string;
  desc: string;
}) {
  return (
    <View style={styles.ruleRow}>
      <Text style={[styles.ruleLabel, { color }]}>{label}</Text>
      <Text style={styles.ruleDesc}>{desc}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
    paddingHorizontal: 40,
  },
  titleSignal: {
    fontSize: 48,
    fontWeight: '900',
    color: '#00FF85',
    fontFamily: MONO_FONT,
    letterSpacing: 6,
    textAlign: 'center',
  },
  titleDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
    gap: 12,
  },
  titleDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  titleVs: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.3)',
    fontFamily: MONO_FONT,
    letterSpacing: 4,
  },
  titleNoise: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FF3B30',
    fontFamily: MONO_FONT,
    letterSpacing: 6,
    textAlign: 'center',
    marginBottom: 48,
  },
  rules: {
    width: '100%',
    gap: 12,
    marginBottom: 36,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 20,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ruleLabel: {
    fontSize: 11,
    fontWeight: '900',
    fontFamily: MONO_FONT,
    letterSpacing: 3,
    width: 64,
  },
  ruleDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    fontFamily: MONO_FONT,
    letterSpacing: 1,
  },
  bestContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 32,
  },
  bestLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.3)',
    fontFamily: MONO_FONT,
    letterSpacing: 4,
  },
  bestValue: {
    fontSize: 20,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
    fontFamily: MONO_FONT,
  },
  startButton: {
    borderWidth: 1.5,
    borderColor: '#00FF85',
    paddingHorizontal: 52,
    paddingVertical: 18,
    borderRadius: 3,
  },
  startButtonPressed: {
    backgroundColor: '#00FF85',
  },
  startButtonText: {
    color: '#00FF85',
    fontSize: 16,
    fontWeight: '900',
    fontFamily: MONO_FONT,
    letterSpacing: 6,
  },
});
