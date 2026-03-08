import React, { useEffect, useCallback, useMemo } from 'react';
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
import { useColors } from '@/context/ThemeContext';
import { SIGNALS, EXAMPLE_NOISES as NOISES } from '@/constants/game';
import { WEB_BOT_PAD } from '@/constants/layout';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function HowToPlayModal({ visible, onClose }: Props) {
  const Colors = useColors();
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

  const botPad = Platform.OS === 'web' ? WEB_BOT_PAD : insets.bottom;

  const themed = useMemo(() => ({
    overlay: { backgroundColor: Colors.overlay },
    sheet: { backgroundColor: Colors.bgCard },
    handle: { backgroundColor: Colors.border },
    sheetTitle: { color: Colors.text },
    closeBtn: { backgroundColor: Colors.bgSoft },
    sectionLabel: { color: Colors.textTer },
    bodyText: { color: Colors.textSec },
    chipSignal: { backgroundColor: Colors.accentLight, borderColor: Colors.accentMid },
    chipNoise: { backgroundColor: Colors.dangerLight, borderColor: Colors.dangerMid },
    ruleText: { color: Colors.textSec },
    ackBtn: { backgroundColor: Colors.accent, shadowColor: Colors.accent },
  }), [Colors]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <Animated.View style={[styles.overlay, themed.overlay, overlayStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        <Animated.View style={[styles.sheet, themed.sheet, sheetStyle, { paddingBottom: botPad + 20 }]}>
          <View style={[styles.handle, themed.handle]} />

          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetTitle, themed.sheetTitle]}>Nasıl Oynanır</Text>
            <Pressable onPress={handleClose} style={[styles.closeBtn, themed.closeBtn]} hitSlop={12}>
              <Ionicons name="close" size={20} color={Colors.textSec} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <Text style={[styles.sectionLabel, themed.sectionLabel]}>AMAÇ</Text>
            <Text style={[styles.bodyText, themed.bodyText]}>
              Kelimeler yukarıdan düşer. Gerçek olanlara dokun, sahte olanları görmezden gel. Hızlı ol — her saniye önemli.
            </Text>

            <View style={styles.spacer} />

            <Text style={[styles.sectionLabel, themed.sectionLabel]}>GERÇEK KELİMELER — BUNLARA DOKUN</Text>
            <View style={styles.chipRow}>
              {SIGNALS.slice(0, 5).map((w) => (
                <View key={w} style={[styles.chip, themed.chipSignal]}>
                  <Text style={[styles.chipText, { color: Colors.accent }]}>{w}</Text>
                </View>
              ))}
              <Text style={[styles.moreText, { color: Colors.textTer }]}>+{SIGNALS.length - 5} kelime daha</Text>
            </View>

            <View style={styles.spacer} />

            <Text style={[styles.sectionLabel, themed.sectionLabel]}>SAHTE KELİMELER — BUNLARI GÖRMEZDEN GEL</Text>
            <View style={styles.chipRow}>
              {NOISES.slice(0, 5).map((w) => (
                <View key={w} style={[styles.chip, themed.chipNoise]}>
                  <Text style={[styles.chipText, { color: Colors.danger }]}>{w}</Text>
                </View>
              ))}
            </View>

            <View style={styles.spacer} />

            <View style={styles.rulesList}>
              <Rule icon="checkmark-circle" color={Colors.accent} textColor={Colors.textSec} text="Gerçek kelimeye dokun → +1 puan" />
              <Rule icon="close-circle" color={Colors.danger} textColor={Colors.textSec} text="Sahte kelimeye dokun → Oyun Biter" />
              <Rule icon="close-circle" color={Colors.danger} textColor={Colors.textSec} text="Gerçek kelimeyi kaçır → Oyun Biter" />
              <Rule icon="trending-up" color={Colors.textSec} textColor={Colors.textSec} text="Skor arttıkça hız ve sahte kelime oranı artar" />
            </View>
          </ScrollView>

          <Pressable
            onPress={handleClose}
            style={({ pressed }) => [styles.ackBtn, themed.ackBtn, pressed && styles.ackBtnPressed]}
          >
            <Text style={styles.ackBtnText}>Anladım</Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

function Rule({
  icon,
  color,
  textColor,
  text,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  textColor: string;
  text: string;
}) {
  return (
    <View style={ruleStyles.ruleRow}>
      <Ionicons name={icon} size={16} color={color} />
      <Text style={[ruleStyles.ruleText, { color: textColor }]}>{text}</Text>
    </View>
  );
}

const ruleStyles = StyleSheet.create({
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  ruleText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
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
    letterSpacing: -0.4,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 8,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.8,
    marginBottom: 10,
  },
  bodyText: {
    fontSize: 15,
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
  chipText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  moreText: {
    fontSize: 12,
    fontWeight: '500',
    fontStyle: 'italic',
    alignSelf: 'center',
  },
  spacer: {
    height: 24,
  },
  rulesList: {
    gap: 12,
  },
  ackBtn: {
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
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
