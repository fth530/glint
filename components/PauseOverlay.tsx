import React, { useEffect, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/context/ThemeContext';

type Props = {
  score: number;
  onResume: () => void;
  onQuit: () => void;
};

export function PauseOverlay({ score, onResume, onQuit }: Props) {
  const Colors = useColors();
  const overlayOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.92);

  useEffect(() => {
    overlayOpacity.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.quad) });
    cardScale.value = withTiming(1, { duration: 250, easing: Easing.out(Easing.back(1.5)) });
  }, []);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlayOpacity.value }));
  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  const themed = useMemo(() => ({
    overlay: { backgroundColor: Colors.overlay },
    card: { backgroundColor: Colors.bgCard },
    title: { color: Colors.text },
    scoreLabel: { color: Colors.textTer },
    scoreValue: { color: Colors.text },
    resumeBtn: { backgroundColor: Colors.accent, shadowColor: Colors.accent },
    quitBtn: { backgroundColor: Colors.bgSoft },
    quitText: { color: Colors.textSec },
  }), [Colors]);

  return (
    <Animated.View style={[styles.overlay, themed.overlay, overlayStyle]}>
      <Animated.View style={[styles.card, themed.card, cardStyle]}>
        <View style={styles.iconRow}>
          <View style={[styles.iconCircle, { backgroundColor: Colors.accentLight }]}>
            <Ionicons name="pause" size={28} color={Colors.accent} />
          </View>
        </View>

        <Text style={[styles.title, themed.title]}>Duraklatıldı</Text>

        <View style={styles.scoreBlock}>
          <Text style={[styles.scoreLabel, themed.scoreLabel]}>SKOR</Text>
          <Text style={[styles.scoreValue, themed.scoreValue]}>{score}</Text>
        </View>

        <View style={styles.btnWrap}>
          <Pressable
            onPress={onResume}
            style={({ pressed }) => [styles.resumeBtn, themed.resumeBtn, pressed && styles.btnPressed]}
          >
            <Ionicons name="play" size={20} color="#fff" />
            <Text style={styles.resumeText}>Devam Et</Text>
          </Pressable>

          <Pressable
            onPress={onQuit}
            style={({ pressed }) => [styles.quitBtn, themed.quitBtn, pressed && styles.btnPressed]}
          >
            <Ionicons name="exit-outline" size={18} color={Colors.textSec} />
            <Text style={[styles.quitText, themed.quitText]}>Çık</Text>
          </Pressable>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    paddingHorizontal: 32,
  },
  card: {
    width: '100%',
    maxWidth: 300,
    borderRadius: 28,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.18,
    shadowRadius: 40,
    elevation: 20,
  },
  iconRow: {
    marginBottom: 16,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  scoreBlock: {
    alignItems: 'center',
    marginBottom: 24,
  },
  scoreLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 2,
    marginBottom: 2,
  },
  scoreValue: {
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: -1,
    lineHeight: 46,
  },
  btnWrap: {
    width: '100%',
    gap: 10,
  },
  resumeBtn: {
    borderRadius: 18,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 6,
  },
  resumeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  quitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 18,
  },
  quitText: {
    fontSize: 14,
    fontWeight: '600',
  },
  btnPressed: {
    opacity: 0.84,
  },
});
