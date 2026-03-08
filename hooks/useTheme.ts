import { useColorScheme } from 'react-native';
import { themes, ColorScheme } from '@/constants/colors';

export function useTheme(): ColorScheme {
  const scheme = useColorScheme();
  return scheme === 'dark' ? themes.dark : themes.light;
}
