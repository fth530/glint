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
  onStart: () => void;
  onHelp: () => void;
};

export function StartScreen({ bestScore, onStart, onHelp }: Props) {
  const fadeIn = useSharedValue(0);
  const slideUp = useSharedValue(24);
  const buttonScale = useSharedValue(0.92);

  useEffect(() => {
    fadeIn.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) });
    slideUp.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.quad) });
    buttonScale.value = withSpring(1, { damping: 16, stiffness: 180 });
  }, []);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
    transform: [{ translateY: slideUp.value }],
  }));
  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleStart = useCallback(() => onStart(), [onStart]);
  const handleHelp = useCallback(() => onHelp(), [onHelp]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.inner, contentStyle]}>
        <View style={styles.topRow}>
          <Text style={styles.subtitle}>WORD REFLEX GAME</Text>
          <Pressable onPress={handleHelp} style={styles.iconBtn} hitSlop={12}>
            <Ionicons name="help-circle-outline" size={22} color={Colors.textSec} />
          </Pressable>
        </View>

        <View style={styles.titleBlock}>
          <Text style={styles.titleTop}>Signal</Text>
          <Text style={styles.titleDivider}>vs</Text>
          <Text style={styles.titleBottom}>Noise</Text>
        </View>

        <View style={styles.ruleCards}>
          <RuleCard
            icon="checkmark-circle"
            iconColor={Colors.accent}
            bg={Colors.accentLight}
            label="Tap signal words"
            sub="Real, correct words"
          />
          <RuleCard
            icon="close-circle"
            iconColor={Colors.danger}
            bg={Colors.dangerLight}
            label="Ignore noise words"
            sub="Leet / fake words"
          />
        </View>

        {bestScore > 0 && (
          <View style={styles.bestRow}>
            <Text style={styles.bestLabel}>Best</Text>
            <Text style={styles.bestValue}>{bestScore}</Text>
          </View>
        )}

        <Animated.View style={buttonStyle}>
          <Pressable
            onPress={handleStart}
            style={({ pressed }) => [styles.startBtn, pressed && styles.startBtnPressed]}
          >
            <Ionicons name="play" size={18} color="#fff" style={styles.startIcon} />
            <Text style={styles.startBtnText}>Start Game</Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

function RuleCard({
  icon,
  iconColor,
  bg,
  label,
  sub,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  iconColor: string;
  bg: string;
  label: string;
  sub: string;
}) {
  return (
    <View style={[styles.ruleCard, { backgroundColor: bg }]}>
      <Ionicons name={icon} size={20} color={iconColor} />
      <View style={styles.ruleCardText}>
        <Text style={styles.ruleCardLabel}>{label}</Text>
        <Text style={styles.ruleCardSub}>{sub}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  inner: {
    gap: 0,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 36,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textTer,
    letterSpacing: 2.5,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.bgSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBlock: {
    marginBottom: 40,
  },
  titleTop: {
    fontSize: 58,
    fontWeight: '800',
    color: Colors.accent,
    lineHeight: 64,
    letterSpacing: -1.5,
  },
  titleDivider: {
    fontSize: 20,
    fontWeight: '400',
    color: Colors.textTer,
    marginVertical: 4,
    letterSpacing: 1,
  },
  titleBottom: {
    fontSize: 58,
    fontWeight: '800',
    color: Colors.danger,
    lineHeight: 64,
    letterSpacing: -1.5,
  },
  ruleCards: {
    gap: 10,
    marginBottom: 36,
  },
  ruleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 16,
  },
  ruleCardText: {
    flex: 1,
    gap: 2,
  },
  ruleCardLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  ruleCardSub: {
    fontSize: 12,
    color: Colors.textSec,
  },
  bestRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 24,
  },
  bestLabel: {
    fontSize: 13,
    color: Colors.textTer,
    fontWeight: '500',
  },
  bestValue: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textSec,
  },
  startBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 18,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  startBtnPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  startIcon: {
    marginLeft: 4,
  },
  startBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
});
