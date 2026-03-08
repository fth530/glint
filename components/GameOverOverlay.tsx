import React, { useEffect, useCallback, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, Share, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  withSpring,
  withDelay,
  withTiming,
  useAnimatedStyle,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/context/ThemeContext';
import { DeathReason } from '@/hooks/useSignalGame';

type Props = {
  score: number;
  bestScore: number;
  deathReason: DeathReason;
  maxCombo: number;
  onPlayAgain: () => void;
  onBackToMenu: () => void;
};

export function GameOverOverlay({ score, bestScore, deathReason, maxCombo, onPlayAgain, onBackToMenu }: Props) {
  const Colors = useColors();
  const overlayOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.88);
  const cardOpacity = useSharedValue(0);
  const btnScale = useSharedValue(0.8);

  useEffect(() => {
    overlayOpacity.value = withTiming(1, { duration: 280, easing: Easing.out(Easing.quad) });
    cardScale.value = withSpring(1, { damping: 18, stiffness: 200 });
    cardOpacity.value = withTiming(1, { duration: 260 });
    btnScale.value = withDelay(260, withSpring(1, { damping: 14, stiffness: 200 }));
  }, []);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlayOpacity.value }));
  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
    opacity: cardOpacity.value,
  }));
  const btnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
    opacity: btnScale.value,
  }));

  const handlePlay = useCallback(() => onPlayAgain(), [onPlayAgain]);
  const handleMenu = useCallback(() => onBackToMenu(), [onBackToMenu]);
  const handleShare = useCallback(async () => {
    const msg = `GLINT'te ${score} puan yaptım! Sen de dene!`;
    try {
      if (Platform.OS === 'web') {
        if (navigator.share) await navigator.share({ text: msg });
      } else {
        await Share.share({ message: msg });
      }
    } catch {}
  }, [score]);
  const isNewBest = score > 0 && score >= bestScore;

  const themed = useMemo(() => ({
    overlay: { backgroundColor: Colors.overlay },
    card: { backgroundColor: Colors.bgCard },
    iconCircle: { backgroundColor: Colors.dangerLight },
    title: { color: Colors.text },
    tagline: { color: Colors.textSec },
    reasonLabel: { color: Colors.textSec },
    reasonChipNoise: { backgroundColor: Colors.dangerLight, borderColor: Colors.dangerMid },
    reasonChipSignal: { backgroundColor: Colors.accentLight, borderColor: Colors.accentMid },
    comboLabel: { color: Colors.textSec },
    comboValue: { color: Colors.accent },
    divider: { backgroundColor: Colors.border },
    scoreLabel: { color: Colors.textTer },
    scoreValue: { color: Colors.text },
    newBestBadge: { backgroundColor: Colors.accentLight },
    newBestText: { color: Colors.accent },
    bestLabel: { color: Colors.textTer },
    bestValue: { color: Colors.textSec },
    replayBtn: { backgroundColor: Colors.accent, shadowColor: Colors.accent },
    menuBtn: { backgroundColor: Colors.bgSoft },
    menuBtnText: { color: Colors.textSec },
  }), [Colors]);

  return (
    <Animated.View style={[styles.overlay, themed.overlay, overlayStyle]}>
      <Animated.View style={[styles.card, themed.card, cardStyle]}>
        <View style={styles.iconRow}>
          <View style={[styles.iconCircle, themed.iconCircle]}>
            <Ionicons name="alert-circle" size={32} color={Colors.danger} />
          </View>
        </View>

        <Text style={[styles.title, themed.title]}>Oyun Bitti</Text>
        {deathReason ? (
          <View style={styles.reasonBlock}>
            <Text style={[styles.reasonLabel, themed.reasonLabel]}>
              {deathReason.type === 'tapped_noise' ? 'Sahte kelimeye dokundun' : 'Gerçek kelimeyi kaçırdın'}
            </Text>
            <View style={[
              styles.reasonChip,
              deathReason.type === 'tapped_noise' ? themed.reasonChipNoise : themed.reasonChipSignal,
            ]}>
              <Text style={[
                styles.reasonWord,
                { color: deathReason.type === 'tapped_noise' ? Colors.danger : Colors.accent },
              ]}>
                {deathReason.word}
              </Text>
            </View>
          </View>
        ) : (
          <Text style={[styles.tagline, themed.tagline]}>Sinyal kayboldu</Text>
        )}

        <View style={[styles.divider, themed.divider]} />

        <View style={styles.scoreBlock}>
          <Text style={[styles.scoreLabel, themed.scoreLabel]}>SKOR</Text>
          <Text style={[styles.scoreValue, themed.scoreValue]}>{score}</Text>
        </View>

        {maxCombo >= 3 && (
          <View style={styles.comboRow}>
            <Ionicons name="flame" size={14} color={Colors.accent} />
            <Text style={[styles.comboLabel, themed.comboLabel]}>Maks Kombo</Text>
            <Text style={[styles.comboValue, themed.comboValue]}>{maxCombo}x</Text>
          </View>
        )}

        {isNewBest ? (
          <View style={[styles.newBestBadge, themed.newBestBadge]}>
            <Ionicons name="trophy" size={13} color={Colors.accent} />
            <Text style={[styles.newBestText, themed.newBestText]}>Yeni Rekor</Text>
          </View>
        ) : bestScore > 0 ? (
          <View style={styles.bestRow}>
            <Text style={[styles.bestLabel, themed.bestLabel]}>En İyi</Text>
            <Text style={[styles.bestValue, themed.bestValue]}>{bestScore}</Text>
          </View>
        ) : null}

        <Animated.View style={[styles.btnWrap, btnStyle]}>
          <Pressable
            onPress={handlePlay}
            style={({ pressed }) => [styles.replayBtn, themed.replayBtn, pressed && styles.replayBtnPressed]}
            testID="play-again-button"
          >
            <Ionicons name="refresh" size={20} color="#fff" />
            <Text style={styles.replayText}>Tekrar Oyna</Text>
          </Pressable>

          <View style={styles.bottomRow}>
            <Pressable
              onPress={handleShare}
              style={({ pressed }) => [styles.shareBtn, themed.menuBtn, pressed && styles.menuBtnPressed]}
            >
              <Ionicons name="share-outline" size={18} color={Colors.textSec} />
              <Text style={[styles.menuBtnText, themed.menuBtnText]}>Paylaş</Text>
            </Pressable>

            <Pressable
              onPress={handleMenu}
              style={({ pressed }) => [styles.shareBtn, themed.menuBtn, pressed && styles.menuBtnPressed]}
              testID="back-to-menu-button"
            >
              <Ionicons name="home-outline" size={16} color={Colors.textSec} />
              <Text style={[styles.menuBtnText, themed.menuBtnText]}>Menü</Text>
            </Pressable>
          </View>
        </Animated.View>
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
    maxWidth: 320,
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
    marginBottom: 20,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  tagline: {
    fontSize: 14,
    marginBottom: 24,
  },
  reasonBlock: {
    alignItems: 'center',
    marginBottom: 24,
    gap: 8,
  },
  reasonLabel: {
    fontSize: 13,
  },
  reasonChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  reasonWord: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2,
  },
  comboRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  comboLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  comboValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  divider: {
    width: '100%',
    height: 1,
    marginBottom: 24,
  },
  scoreBlock: {
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2,
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 64,
    fontWeight: '800',
    lineHeight: 72,
    letterSpacing: -2,
  },
  newBestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 28,
  },
  newBestText: {
    fontSize: 13,
    fontWeight: '700',
  },
  bestRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginBottom: 28,
  },
  bestLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  bestValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  btnWrap: {
    width: '100%',
    gap: 10,
  },
  replayBtn: {
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
  replayBtnPressed: {
    opacity: 0.88,
  },
  replayText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  bottomRow: {
    flexDirection: 'row',
    gap: 10,
  },
  shareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 18,
  },
  menuBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 18,
  },
  menuBtnPressed: {
    opacity: 0.80,
  },
  menuBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
