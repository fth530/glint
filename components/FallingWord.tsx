import React, { useEffect, memo, useCallback, useRef } from 'react';
import { Pressable, StyleSheet, Text, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  withTiming,
  Easing,
  useAnimatedStyle,
  runOnJS,
  cancelAnimation,
} from 'react-native-reanimated';
import { WordItem } from '@/hooks/useSignalGame';

const WORD_WIDTH = 160;
const MONO_FONT = Platform.select({
  ios: 'Courier New',
  android: 'monospace',
  default: 'monospace',
});

type Props = {
  word: WordItem;
  screenHeight: number;
  onTap: (id: string, isSignal: boolean) => void;
  onFallOff: (id: string, isSignal: boolean) => void;
};

function FallingWordComponent({ word, screenHeight, onTap, onFallOff }: Props) {
  const { id, text, isSignal, x, fallDuration } = word;
  const translateY = useSharedValue(-80);
  const isMounted = useRef(true);
  const tapped = useRef(false);

  const onFallOffRef = useRef(onFallOff);
  useEffect(() => {
    onFallOffRef.current = onFallOff;
  }, [onFallOff]);

  const handleFallComplete = useCallback(() => {
    if (isMounted.current && !tapped.current) {
      onFallOffRef.current(id, isSignal);
    }
  }, [id, isSignal]);

  useEffect(() => {
    translateY.value = withTiming(
      screenHeight + 80,
      {
        duration: fallDuration,
        easing: Easing.linear,
      },
      (finished) => {
        'worklet';
        if (finished) {
          runOnJS(handleFallComplete)();
        }
      },
    );

    return () => {
      isMounted.current = false;
      cancelAnimation(translateY);
    };
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handlePress = useCallback(() => {
    if (tapped.current) return;
    tapped.current = true;
    cancelAnimation(translateY);
    onTap(id, isSignal);
  }, [id, isSignal, onTap]);

  return (
    <Animated.View
      style={[styles.container, { left: x - WORD_WIDTH / 2 }, animStyle]}
    >
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}
      >
        <Text style={styles.text}>{text}</Text>
      </Pressable>
    </Animated.View>
  );
}

export const FallingWord = memo(FallingWordComponent);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    width: WORD_WIDTH,
    alignItems: 'center',
  },
  pressable: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
  },
  pressed: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderColor: 'rgba(255,255,255,0.45)',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 3.5,
    fontFamily: MONO_FONT,
  },
});
