import React, { useEffect, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  withSequence,
  withTiming,
  withDelay,
  useAnimatedStyle,
  Easing,
} from 'react-native-reanimated';
import { useColors } from '@/context/ThemeContext';

type Props = {
  level: number;
};

export function LevelUpBanner({ level }: Props) {
  const Colors = useColors();
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.6);

  useEffect(() => {
    opacity.value = withSequence(
      withTiming(1, { duration: 200 }),
      withDelay(800, withTiming(0, { duration: 400 })),
    );
    scale.value = withSequence(
      withTiming(1.1, { duration: 200, easing: Easing.out(Easing.back(2)) }),
      withTiming(1, { duration: 150 }),
      withDelay(650, withTiming(0.8, { duration: 300 })),
    );
  }, [level]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const themed = useMemo(() => ({
    text: { color: Colors.accent },
  }), [Colors]);

  return (
    <Animated.View style={[styles.container, animStyle]} pointerEvents="none">
      <Animated.Text style={[styles.text, themed.text]}>
        SEVİYE {level}
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '35%',
    alignSelf: 'center',
    zIndex: 60,
  },
  text: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 4,
  },
});
