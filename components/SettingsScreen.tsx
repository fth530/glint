import React, { useCallback, useState } from 'react';
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
import Colors from '@/constants/colors';

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

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const botPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const handleBack = useCallback(() => onBack(), [onBack]);

  const handleReset = useCallback(() => {
    if (Platform.OS === 'web') {
      onResetBestScore();
      setResetConfirmed(true);
      setTimeout(() => setResetConfirmed(false), 2000);
    } else {
      Alert.alert(
        'Reset Best Score',
        'This will permanently delete your best score. Are you sure?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Reset',
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

  return (
    <View style={[styles.container, { paddingTop: topPad, paddingBottom: botPad }]}>
      <Animated.View style={[styles.inner, animStyle]}>
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backBtn} hitSlop={12}>
            <Ionicons name="chevron-back" size={22} color={Colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.backBtnPlaceholder} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>GAMEPLAY</Text>

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={styles.rowIconBg}>
                <Ionicons name="phone-portrait-outline" size={16} color={Colors.accent} />
              </View>
              <View>
                <Text style={styles.rowTitle}>Haptic Feedback</Text>
                <Text style={styles.rowSub}>Vibration on tap and game over</Text>
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
          <Text style={styles.sectionLabel}>DATA</Text>

          <Pressable
            onPress={handleReset}
            style={({ pressed }) => [styles.resetBtn, pressed && styles.resetBtnPressed]}
            testID="reset-score-button"
          >
            <Ionicons
              name={resetConfirmed ? 'checkmark-circle' : 'trash-outline'}
              size={18}
              color={resetConfirmed ? Colors.accent : Colors.danger}
            />
            <Text style={[styles.resetBtnText, resetConfirmed && { color: Colors.accent }]}>
              {resetConfirmed ? 'Score Reset' : 'Reset Best Score'}
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
    backgroundColor: Colors.bg,
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
    backgroundColor: Colors.bgSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnPlaceholder: {
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: -0.3,
  },
  section: {
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textTer,
    letterSpacing: 1.8,
    marginBottom: 12,
    marginLeft: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.bgSoft,
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
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  rowSub: {
    fontSize: 12,
    color: Colors.textSec,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.dangerLight,
    borderRadius: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: Colors.dangerMid,
  },
  resetBtnPressed: {
    opacity: 0.80,
  },
  resetBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.danger,
  },
});
