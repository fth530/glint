import React, { useEffect, useState, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  withTiming,
  withSequence,
  useAnimatedStyle,
  Easing,
} from 'react-native-reanimated';
import { useColors } from '@/context/ThemeContext';

type Props = {
  onFinish: () => void;
};

const STEPS = ['3', '2', '1', 'BAŞLA!'];
const STEP_DURATION = 700;

export function CountdownOverlay({ onFinish }: Props) {
  const Colors = useColors();
  const [stepIndex, setStepIndex] = useState(0);

  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Animate current step
    scale.value = 0.5;
    opacity.value = 0;

    scale.value = withSequence(
      withTiming(1.2, { duration: STEP_DURATION * 0.4, easing: Easing.out(Easing.back(2)) }),
      withTiming(1, { duration: STEP_DURATION * 0.2 }),
      withTiming(0.8, {
        duration: STEP_DURATION * 0.4,
        easing: Easing.in(Easing.quad),
      }),
    );

    opacity.value = withSequence(
      withTiming(1, { duration: STEP_DURATION * 0.3 }),
      withTiming(1, { duration: STEP_DURATION * 0.3 }),
      withTiming(0, { duration: STEP_DURATION * 0.4 }),
    );

    const timer = setTimeout(() => {
      if (stepIndex < STEPS.length - 1) {
        setStepIndex((prev) => prev + 1);
      } else {
        onFinish();
      }
    }, STEP_DURATION);

    return () => clearTimeout(timer);
  }, [stepIndex]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const isGo = stepIndex === STEPS.length - 1;

  const themedStyles = useMemo(() => ({
    overlay: {
      backgroundColor: Colors.overlay,
    },
    text: {
      color: Colors.text,
    },
    textGo: {
      color: Colors.accent,
    },
  }), [Colors]);

  return (
    <View style={[styles.overlay, themedStyles.overlay]}>
      <Animated.Text
        style={[
          styles.text,
          themedStyles.text,
          isGo && styles.textGo,
          isGo && themedStyles.textGo,
          animStyle,
        ]}
      >
        {STEPS[stepIndex]}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 200,
  },
  text: {
    fontSize: 80,
    fontWeight: '900',
    letterSpacing: -2,
  },
  textGo: {
    fontSize: 64,
    letterSpacing: 4,
  },
});
