import React, { useCallback, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  Pressable,
  Platform,
  Alert,
} from 'react-native';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/context/ThemeContext';
import { WEB_TOP_PAD, WEB_BOT_PAD } from '@/constants/layout';

type Props = {
  hapticsEnabled: boolean;
  onToggleHaptics: (val: boolean) => void;
  onResetBestScore: () => void;
  onBack: () => void;
};

export function SettingsScreen({
  hapticsEnabled,
  onToggleHaptics,
  onResetBestScore,
  onBack,
}: Props) {
  const Colors = useColors();
  const insets = useSafeAreaInsets();
  const [resetConfirmed, setResetConfirmed] = useState(false);

  const slideIn = useSharedValue(24);
  const fadeIn = useSharedValue(0);

  React.useEffect(() => {
    slideIn.value = withTiming(0, { duration: 320, easing: Easing.out(Easing.quad) });
    fadeIn.value = withTiming(1, { duration: 320 });
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
    transform: [{ translateX: slideIn.value }],
  }));

  const topPad = Platform.OS === 'web' ? WEB_TOP_PAD : insets.top;
  const botPad = Platform.OS === 'web' ? WEB_BOT_PAD : insets.bottom;

  const handleBack = useCallback(() => onBack(), [onBack]);

  const handleReset = useCallback(() => {
    if (Platform.OS === 'web') {
      onResetBestScore();
      setResetConfirmed(true);
      setTimeout(() => setResetConfirmed(false), 2000);
    } else {
      Alert.alert(
        'Skoru Sıfırla',
        'En iyi skorun kalıcı olarak silinecek. Emin misin?',
        [
          { text: 'İptal', style: 'cancel' },
          {
            text: 'Sıfırla',
            style: 'destructive',
            onPress: () => {
              onResetBestScore();
              setResetConfirmed(true);
              setTimeout(() => setResetConfirmed(false), 2000);
            },
          },
        ],
      );
    }
  }, [onResetBestScore]);

  const themed = useMemo(() => ({
    container: { backgroundColor: Colors.bg },
    backBtn: { backgroundColor: Colors.bgSoft },
    headerTitle: { color: Colors.text },
    sectionLabel: { color: Colors.textTer },
    row: { backgroundColor: Colors.bgSoft },
    rowIconBg: { backgroundColor: Colors.accentLight },
    rowTitle: { color: Colors.text },
    rowSub: { color: Colors.textSec },
    resetBtn: { backgroundColor: Colors.dangerLight, borderColor: Colors.dangerMid },
    resetBtnText: { color: Colors.danger },
  }), [Colors]);

  return (
    <View style={[styles.container, themed.container, { paddingTop: topPad, paddingBottom: botPad }]}>
      <Animated.View style={[styles.inner, animStyle]}>
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={[styles.backBtn, themed.backBtn]} hitSlop={12}>
            <Ionicons name="chevron-back" size={22} color={Colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, themed.headerTitle]}>Ayarlar</Text>
          <View style={styles.backBtnPlaceholder} />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, themed.sectionLabel]}>OYUN</Text>

          <View style={[styles.row, themed.row]}>
            <View style={styles.rowLeft}>
              <View style={[styles.rowIconBg, themed.rowIconBg]}>
                <Ionicons name="phone-portrait-outline" size={16} color={Colors.accent} />
              </View>
              <View>
                <Text style={[styles.rowTitle, themed.rowTitle]}>Titreşim</Text>
                <Text style={[styles.rowSub, themed.rowSub]}>Dokunma ve oyun sonu titreşimi</Text>
              </View>
            </View>
            <Switch
              value={hapticsEnabled}
              onValueChange={onToggleHaptics}
              trackColor={{ false: Colors.bgSoft, true: Colors.accentMid }}
              thumbColor={hapticsEnabled ? Colors.accent : Colors.textTer}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, themed.sectionLabel]}>VERİ</Text>

          <Pressable
            onPress={handleReset}
            style={({ pressed }) => [styles.resetBtn, themed.resetBtn, pressed && styles.resetBtnPressed]}
            testID="reset-score-button"
          >
            <Ionicons
              name={resetConfirmed ? 'checkmark-circle' : 'trash-outline'}
              size={18}
              color={resetConfirmed ? Colors.accent : Colors.danger}
            />
            <Text style={[styles.resetBtnText, themed.resetBtnText, resetConfirmed && { color: Colors.accent }]}>
              {resetConfirmed ? 'Skor Sıfırlandı' : 'En İyi Skoru Sıfırla'}
            </Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    marginBottom: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnPlaceholder: {
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  section: {
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.8,
    marginBottom: 12,
    marginLeft: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  rowIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  rowSub: {
    fontSize: 12,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 16,
    paddingVertical: 16,
    borderWidth: 1,
  },
  resetBtnPressed: {
    opacity: 0.80,
  },
  resetBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
