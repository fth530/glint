import React, { useEffect, memo, useCallback, useRef, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  withTiming,
  withSequence,
  withSpring,
  Easing,
  useAnimatedStyle,
  cancelAnimation,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { WordItem } from '@/hooks/useSignalGame';
import { useColors } from '@/context/ThemeContext';

export const WORD_WIDTH = 160;

type Props = {
  word: WordItem;
  screenHeight: number;
  paused: boolean;
  onTap: (id: string, isSignal: boolean, wordText: string) => void;
  onFallOff: (id: string, isSignal: boolean, wordText: string) => void;
};

function FallingWordComponent({ word, screenHeight, paused, onTap, onFallOff }: Props) {
  const Colors = useColors();
  const { id, text, isSignal, x, fallDuration } = word;

  const translateY = useSharedValue(-72);
  const chipScale = useSharedValue(1);
  const chipOpacity = useSharedValue(1);
  const shakeX = useSharedValue(0);
  const bgColor = useSharedValue(0);
  const tapped = useRef(false);
  const onFallOffRef = useRef(onFallOff);
  const startTimeRef = useRef(Date.now());
  const elapsedRef = useRef(0);
  const fallTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const accentColor = Colors.accent;
  const dangerColor = Colors.danger;
  const wordBgColor = Colors.wordBg;
  const wordTextColor = Colors.wordText;

  useEffect(() => {
    onFallOffRef.current = onFallOff;
  }, [onFallOff]);

  // Start/resume/pause fall animation
  useEffect(() => {
    if (tapped.current) return;

    if (paused) {
      // Pause: cancel animation (freezes at current position) and clear timer
      cancelAnimation(translateY);
      elapsedRef.current += Date.now() - startTimeRef.current;
      if (fallTimerRef.current) {
        clearTimeout(fallTimerRef.current);
        fallTimerRef.current = null;
      }
    } else {
      // Start or resume
      const remaining = Math.max(0, fallDuration - elapsedRef.current);
      startTimeRef.current = Date.now();

      translateY.value = withTiming(screenHeight + 72, {
        duration: remaining,
        easing: Easing.linear,
      });

      fallTimerRef.current = setTimeout(() => {
        if (!tapped.current) {
          onFallOffRef.current(id, isSignal, text);
        }
      }, remaining);
    }

    return () => {
      if (fallTimerRef.current) {
        clearTimeout(fallTimerRef.current);
        fallTimerRef.current = null;
      }
    };
  }, [paused]);

  // Initial animation start
  useEffect(() => {
    translateY.value = withTiming(screenHeight + 72, {
      duration: fallDuration,
      easing: Easing.linear,
    });
    fallTimerRef.current = setTimeout(() => {
      if (!tapped.current) {
        onFallOffRef.current(id, isSignal, text);
      }
    }, fallDuration);

    return () => {
      cancelAnimation(translateY);
      if (fallTimerRef.current) {
        clearTimeout(fallTimerRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: shakeX.value },
      { scale: chipScale.value },
    ],
    opacity: chipOpacity.value,
  }));

  const themed = useMemo(() => ({
    chip: {
      backgroundColor: Colors.wordBg,
      borderColor: Colors.wordBorder,
    },
    text: {
      color: Colors.wordText,
    },
  }), [Colors]);

  const chipAnimStyle = useAnimatedStyle(() => {
    const bg =
      bgColor.value > 0.5
        ? accentColor
        : bgColor.value < -0.5
          ? dangerColor
          : wordBgColor;
    return { backgroundColor: bg };
  });

  const textAnimStyle = useAnimatedStyle(() => {
    const color =
      bgColor.value > 0.5
        ? '#FFFFFF'
        : bgColor.value < -0.5
          ? '#FFFFFF'
          : wordTextColor;
    return { color };
  });

  const handlePress = useCallback(() => {
    if (tapped.current || paused) return;
    tapped.current = true;
    cancelAnimation(translateY);
    if (fallTimerRef.current) {
      clearTimeout(fallTimerRef.current);
      fallTimerRef.current = null;
    }

    if (isSignal) {
      bgColor.value = 1;
      chipScale.value = withSpring(1.15, { damping: 12, stiffness: 300 });
      chipOpacity.value = withTiming(0, { duration: 300 });
    } else {
      bgColor.value = -1;
      shakeX.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-8, { duration: 50 }),
        withTiming(8, { duration: 50 }),
        withTiming(0, { duration: 50 }),
      );
      chipOpacity.value = withTiming(0, { duration: 400 });
    }

    onTap(id, isSignal, text);
  }, [id, isSignal, text, onTap, paused]);

  const tapGesture = Gesture.Tap()
    .maxDuration(500)
    .runOnJS(true)
    .onStart(handlePress);

  return (
    <Animated.View style={[styles.container, { left: x - WORD_WIDTH / 2 }, animStyle]}>
      <GestureDetector gesture={tapGesture}>
        <Animated.View style={[styles.chip, themed.chip, chipAnimStyle]}>
          <Animated.Text style={[styles.text, themed.text, textAnimStyle]}>{text}</Animated.Text>
        </Animated.View>
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
  chip: {
    width: WORD_WIDTH,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
  text: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 3,
  },
});
