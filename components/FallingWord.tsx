import React, { useEffect, memo, useCallback, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  withTiming,
  Easing,
  useAnimatedStyle,
  cancelAnimation,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { WordItem } from '@/hooks/useSignalGame';
import Colors from '@/constants/colors';

export const WORD_WIDTH = 160;

type Props = {
  word: WordItem;
  screenHeight: number;
  onTap: (id: string, isSignal: boolean) => void;
  onFallOff: (id: string, isSignal: boolean) => void;
};

function FallingWordComponent({ word, screenHeight, onTap, onFallOff }: Props) {
  const { id, text, isSignal, x, fallDuration } = word;

  const translateY = useSharedValue(-72);
  const tapped = useRef(false);
  const onFallOffRef = useRef(onFallOff);
  useEffect(() => {
    onFallOffRef.current = onFallOff;
  }, [onFallOff]);

  useEffect(() => {
    translateY.value = withTiming(screenHeight + 72, {
      duration: fallDuration,
      easing: Easing.linear,
    });
    return () => {
      cancelAnimation(translateY);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!tapped.current) {
        onFallOffRef.current(id, isSignal);
      }
    }, fallDuration);
    return () => clearTimeout(timer);
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
    <Animated.View style={[styles.container, { left: x - WORD_WIDTH / 2 }, animStyle]}>
      <GestureDetector gesture={tapGesture}>
        <View style={styles.chip}>
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
  chip: {
    width: WORD_WIDTH,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: Colors.wordBg,
    borderWidth: 1,
    borderColor: Colors.wordBorder,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  text: {
    color: Colors.wordText,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 2.5,
  },
});
