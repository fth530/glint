import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HAPTICS_KEY = '@svn_haptics_enabled';

export function useSettings() {
  const [hapticsEnabled, setHapticsEnabled] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(HAPTICS_KEY).then((val) => {
      if (val !== null) setHapticsEnabled(val === 'true');
    });
  }, []);

  const toggleHaptics = useCallback(async (val: boolean) => {
    setHapticsEnabled(val);
    await AsyncStorage.setItem(HAPTICS_KEY, String(val));
  }, []);

  return { hapticsEnabled, toggleHaptics };
}
