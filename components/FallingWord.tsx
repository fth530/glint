import React, { useEffect, memo, useCallback, useRef } from 'react';
import { StyleSheet, Text, Platform, View } from 'react-native';
import Animated, {
  useSharedValue,
  withTiming,
  Easing,
  useAnimatedStyle,
  cancelAnimation,
} from 'react-native-reanimated';
import {
  GestureDetector,
  Gesture,
} from 'react-native-gesture-handler';
import { WordItem } from '@/hooks/useSignalGame';
import Colors from '@/constants/colors';

export const WORD_WIDTH = 168;
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

  // Visual animation (purely cosmetic — does NOT drive game logic)
  const translateY = useSharedValue(-80);
  const tapped = useRef(false);

  // Keep latest callbacks accessible without recreating effects
  const onFallOffRef = useRef(onFallOff);
  useEffect(() => {
    onFallOffRef.current = onFallOff;
  }, [onFallOff]);

  // === Visual animation ===
  useEffect(() => {
    translateY.value = withTiming(screenHeight + 80, {
      duration: fallDuration,
      easing: Easing.linear,
    });
    return () => {
      cancelAnimation(translateY);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // === Fall-off detection (JS setTimeout — reliable on all platforms) ===
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!tapped.current) {
        onFallOffRef.current(id, isSignal);
      }
    }, fallDuration);

    return () => {
      clearTimeout(timer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const tapGesture = Gesture.Tap()
    .maxDuration(500)
    .runOnJS(true)
    .onStart(handlePress);

  return (
    <Animated.View
      style={[styles.container, { left: x - WORD_WIDTH / 2 }, animStyle]}
    >
      <GestureDetector gesture={tapGesture}>
        <View style={styles.pressable}>
          <Text style={styles.text}>{text}</Text>
        </View>
      </GestureDetector>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 2,
    backgroundColor: Colors.neonFaint,
    alignItems: 'center',
    width: WORD_WIDTH,
  },
  text: {
    color: Colors.wordColor,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 4,
    fontFamily: MONO_FONT,
  },
});
