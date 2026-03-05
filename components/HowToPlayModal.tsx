import React, { useEffect, useCallback } from 'react';
import { Modal, View, Text, Pressable, StyleSheet, ScrollView, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  withTiming,
  withSpring,
  useAnimatedStyle,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';

const SIGNALS = ['KEDİ', 'KÖPEK', 'TAVŞAN', 'ASLAN', 'KAPLAN', 'KARTAL'];
const NOISES = ['K3Dİ', 'D0G', 'KÖP3K', 'T4VŞAN', 'A5LAN', 'MASA', 'ELMA'];

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function HowToPlayModal({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const overlayOpacity = useSharedValue(0);
  const sheetY = useSharedValue(80);

  useEffect(() => {
    if (visible) {
      overlayOpacity.value = withTiming(1, { duration: 240, easing: Easing.out(Easing.quad) });
      sheetY.value = withSpring(0, { damping: 20, stiffness: 220 });
    } else {
      overlayOpacity.value = withTiming(0, { duration: 180 });
      sheetY.value = withTiming(80, { duration: 200, easing: Easing.in(Easing.quad) });
    }
  }, [visible]);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlayOpacity.value }));
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: sheetY.value }],
  }));

  const handleClose = useCallback(() => onClose(), [onClose]);

  const botPad = Platform.OS === 'web' ? 34 : insets.bottom;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <Animated.View style={[styles.overlay, overlayStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        <Animated.View style={[styles.sheet, sheetStyle, { paddingBottom: botPad + 20 }]}>
          <View style={styles.handle} />

          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>How to Play</Text>
            <Pressable onPress={handleClose} style={styles.closeBtn} hitSlop={12}>
              <Ionicons name="close" size={20} color={Colors.textSec} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <Text style={styles.sectionLabel}>OBJECTIVE</Text>
            <Text style={styles.bodyText}>
              Words fall from the top. Tap the real ones, ignore the fakes. React fast — every second counts.
            </Text>

            <View style={styles.spacer} />

            <Text style={styles.sectionLabel}>SIGNAL WORDS — TAP THESE</Text>
            <View style={styles.chipRow}>
              {SIGNALS.map((w) => (
                <View key={w} style={[styles.chip, styles.chipSignal]}>
                  <Text style={[styles.chipText, { color: Colors.accent }]}>{w}</Text>
                </View>
              ))}
            </View>

            <View style={styles.spacer} />

            <Text style={styles.sectionLabel}>NOISE WORDS — IGNORE THESE</Text>
            <View style={styles.chipRow}>
              {NOISES.map((w) => (
                <View key={w} style={[styles.chip, styles.chipNoise]}>
                  <Text style={[styles.chipText, { color: Colors.danger }]}>{w}</Text>
                </View>
              ))}
            </View>

            <View style={styles.spacer} />

            <View style={styles.rulesList}>
              <Rule icon="checkmark-circle" color={Colors.accent} text="Tap a signal word → +1 point" />
              <Rule icon="close-circle" color={Colors.danger} text="Tap a noise word → Game Over" />
              <Rule icon="close-circle" color={Colors.danger} text="Miss a signal word → Game Over" />
              <Rule icon="trending-up" color={Colors.textSec} text="Speed and noise increase with score" />
            </View>
          </ScrollView>

          <Pressable
            onPress={handleClose}
            style={({ pressed }) => [styles.ackBtn, pressed && styles.ackBtnPressed]}
          >
            <Text style={styles.ackBtnText}>Got it</Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

function Rule({
  icon,
  color,
  text,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  text: string;
}) {
  return (
    <View style={styles.ruleRow}>
      <Ionicons name={icon} size={16} color={color} />
      <Text style={styles.ruleText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.bgCard,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingHorizontal: 24,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 20,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.4,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.bgSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 8,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textTer,
    letterSpacing: 1.8,
    marginBottom: 10,
  },
  bodyText: {
    fontSize: 15,
    color: Colors.textSec,
    lineHeight: 22,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  chipSignal: {
    backgroundColor: Colors.accentLight,
    borderColor: Colors.accentMid,
  },
  chipNoise: {
    backgroundColor: Colors.dangerLight,
    borderColor: Colors.dangerMid,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  spacer: {
    height: 24,
  },
  rulesList: {
    gap: 12,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  ruleText: {
    fontSize: 14,
    color: Colors.textSec,
    flex: 1,
    lineHeight: 20,
  },
  ackBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 6,
  },
  ackBtnPressed: {
    opacity: 0.88,
  },
  ackBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
});
