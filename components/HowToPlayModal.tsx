import React, { useEffect, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  withTiming,
  withSpring,
  useAnimatedStyle,
  Easing,
} from 'react-native-reanimated';
import Colors from '@/constants/colors';

const MONO = Platform.select({
  ios: 'Courier New',
  android: 'monospace',
  default: 'monospace',
});

type Props = {
  visible: boolean;
  onClose: () => void;
};

const SIGNALS = ['KEDİ', 'KÖPEK', 'TAVŞAN', 'ASLAN', 'KAPLAN', 'KARTAL'];
const NOISES = ['K3Dİ', 'D0G', 'KÖP3K', 'T4VŞAN', 'A5LAN', 'MASA', 'ELMA'];

export function HowToPlayModal({ visible, onClose }: Props) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.quad) });
      scale.value = withSpring(1, { damping: 18, stiffness: 220 });
    } else {
      opacity.value = withTiming(0, { duration: 150 });
      scale.value = withTiming(0.92, { duration: 150 });
    }
  }, [visible]);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const boxStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleClose = useCallback(() => onClose(), [onClose]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <Animated.View style={[styles.overlay, overlayStyle]}>
        <Animated.View style={[styles.box, boxStyle]}>
          <View style={styles.header}>
            <Text style={styles.headerLine}>{'// SYSTEM_MANUAL.txt'}</Text>
          </View>

          <Text style={styles.directive}>
            TARGET THE SIGNAL.{'\n'}IGNORE THE NOISE.
          </Text>

          <View style={styles.divider} />

          <Section
            label="SIGNAL"
            sublabel="TAP THESE"
            labelColor={Colors.neon}
            words={SIGNALS}
            wordColor={Colors.neon}
            borderColor={Colors.border}
            bgColor={Colors.neonFaint}
          />

          <Section
            label="NOISE"
            sublabel="IGNORE THESE"
            labelColor={Colors.danger}
            words={NOISES}
            wordColor={Colors.danger}
            borderColor={Colors.dangerDim}
            bgColor={Colors.dangerDim}
          />

          <View style={styles.divider} />

          <View style={styles.rulesBlock}>
            <RuleLine text="Tapping NOISE → System Failure" danger />
            <RuleLine text="Missing SIGNAL → System Failure" danger />
            <RuleLine text="Faster as score increases" />
          </View>

          <Pressable
            onPress={handleClose}
            style={({ pressed }) => [
              styles.ackButton,
              pressed && styles.ackButtonPressed,
            ]}
          >
            <Text style={styles.ackButtonText}>ACKNOWLEDGE</Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

function Section({
  label,
  sublabel,
  labelColor,
  words,
  wordColor,
  borderColor,
  bgColor,
}: {
  label: string;
  sublabel: string;
  labelColor: string;
  words: string[];
  wordColor: string;
  borderColor: string;
  bgColor: string;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionLabel, { color: labelColor }]}>{label}</Text>
        <Text style={styles.sectionSublabel}>{sublabel}</Text>
      </View>
      <View style={styles.wordGrid}>
        {words.map((w) => (
          <View key={w} style={[styles.wordChip, { borderColor, backgroundColor: bgColor }]}>
            <Text style={[styles.wordChipText, { color: wordColor }]}>{w}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function RuleLine({ text, danger }: { text: string; danger?: boolean }) {
  return (
    <View style={styles.ruleLine}>
      <Text style={[styles.ruleArrow, danger && { color: Colors.danger }]}>{'>'}</Text>
      <Text style={[styles.ruleText, danger && { color: Colors.danger }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.94)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  box: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#050505',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 2,
    padding: 24,
    gap: 0,
  },
  header: {
    marginBottom: 16,
  },
  headerLine: {
    fontSize: 11,
    color: Colors.textDim,
    fontFamily: MONO,
    letterSpacing: 1,
  },
  directive: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.white,
    fontFamily: MONO,
    letterSpacing: 2,
    lineHeight: 28,
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderFaint,
    marginVertical: 16,
  },
  section: {
    marginBottom: 16,
    gap: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '900',
    fontFamily: MONO,
    letterSpacing: 4,
  },
  sectionSublabel: {
    fontSize: 10,
    color: Colors.textFaint,
    fontFamily: MONO,
    letterSpacing: 2,
  },
  wordGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  wordChip: {
    borderWidth: 1,
    borderRadius: 2,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  wordChipText: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: MONO,
    letterSpacing: 2,
  },
  rulesBlock: {
    gap: 8,
    marginBottom: 24,
  },
  ruleLine: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  ruleArrow: {
    fontSize: 12,
    color: Colors.textDim,
    fontFamily: MONO,
    lineHeight: 18,
  },
  ruleText: {
    fontSize: 12,
    color: Colors.textDim,
    fontFamily: MONO,
    letterSpacing: 1,
    lineHeight: 18,
    flex: 1,
  },
  ackButton: {
    borderWidth: 1.5,
    borderColor: Colors.neon,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 2,
  },
  ackButtonPressed: {
    backgroundColor: Colors.neon,
  },
  ackButtonText: {
    fontSize: 13,
    fontWeight: '900',
    fontFamily: MONO,
    letterSpacing: 5,
    color: Colors.neon,
  },
  ackButtonTextPressed: {
    color: '#000000',
  },
});
