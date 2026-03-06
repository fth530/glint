import React, { useEffect, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  withTiming,
  withSpring,
  useAnimatedStyle,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';

type Props = {
  bestScore: number;
  onPlay: () => void;
  onHowToPlay: () => void;
  onSettings: () => void;
};

export function MainMenu({ bestScore, onPlay, onHowToPlay, onSettings }: Props) {
  const fadeIn = useSharedValue(0);
  const slideUp = useSharedValue(20);
  const btnScale = useSharedValue(0.94);

  useEffect(() => {
    fadeIn.value = withTiming(1, { duration: 420, easing: Easing.out(Easing.quad) });
    slideUp.value = withTiming(0, { duration: 420, easing: Easing.out(Easing.quad) });
    btnScale.value = withSpring(1, { damping: 15, stiffness: 180 });
  }, []);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
    transform: [{ translateY: slideUp.value }],
  }));
  const btnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
  }));

  const handlePlay = useCallback(() => onPlay(), [onPlay]);
  const handleHow = useCallback(() => onHowToPlay(), [onHowToPlay]);
  const handleSettings = useCallback(() => onSettings(), [onSettings]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.inner, contentStyle]}>
        <View style={styles.titleBlock}>
          <Text style={styles.titleLine1}>GLINT</Text>
        </View>

        {bestScore > 0 && (
          <View style={styles.bestBlock}>
            <Ionicons name="trophy-outline" size={15} color={Colors.textTer} />
            <Text style={styles.bestLabel}>Best</Text>
            <Text style={styles.bestValue}>{bestScore}</Text>
          </View>
        )}

        <Animated.View style={[styles.btnStack, btnStyle]}>
          <Pressable
            onPress={handlePlay}
            style={({ pressed }) => [styles.btn, styles.btnPrimary, pressed && styles.btnPressed]}
            testID="play-button"
          >
            <Ionicons name="play" size={18} color="#fff" />
            <Text style={[styles.btnText, styles.btnTextPrimary]}>PLAY</Text>
          </Pressable>

          <Pressable
            onPress={handleHow}
            style={({ pressed }) => [styles.btn, styles.btnSecondary, pressed && styles.btnPressed]}
            testID="how-to-play-button"
          >
            <Ionicons name="book-outline" size={17} color={Colors.textSec} />
            <Text style={[styles.btnText, styles.btnTextSecondary]}>HOW TO PLAY</Text>
          </Pressable>

          <Pressable
            onPress={handleSettings}
            style={({ pressed }) => [styles.btn, styles.btnSecondary, pressed && styles.btnPressed]}
            testID="settings-button"
          >
            <Ionicons name="settings-outline" size={17} color={Colors.textSec} />
            <Text style={[styles.btnText, styles.btnTextSecondary]}>SETTINGS</Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  inner: {
    gap: 0,
  },
  titleBlock: {
    marginBottom: 28,
  },
  titleLine1: {
    fontSize: 52,
    fontWeight: '900',
    color: Colors.accent,
    lineHeight: 58,
    letterSpacing: 2,
  },
  bestBlock: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginBottom: 44,
  },
  bestLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textTer,
  },
  bestValue: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.textSec,
    letterSpacing: -0.5,
  },
  btnStack: {
    gap: 12,
  },
  btn: {
    borderRadius: 18,
    paddingVertical: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  btnPrimary: {
    backgroundColor: Colors.accent,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 6,
  },
  btnSecondary: {
    backgroundColor: Colors.bgSoft,
  },
  btnPressed: {
    opacity: 0.84,
  },
  btnText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  btnTextPrimary: {
    color: '#ffffff',
  },
  btnTextSecondary: {
    color: Colors.textSec,
  },
});
