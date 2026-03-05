# Signal vs Noise (Sinyal Gürültü)

A hypercasual brain-teaser mobile game built with Expo React Native.

## Architecture

- **Framework**: Expo + Expo Router (file-based routing)
- **State**: Custom hook `useSignalGame` (no Redux/Context needed — game is single-screen)
- **Animations**: `react-native-reanimated` — each falling word is its own memoized component with its own animation (60fps)
- **Haptics**: `expo-haptics` — light tap on signal, error on game over
- **Persistence**: `@react-native-async-storage/async-storage` — best score

## Game Rules

- **Signals** (tap): KEDİ, KÖPEK, TAVŞAN, ASLAN, KAPLAN, KARTAL
- **Noises** (ignore): K3Dİ, D0G, KÖP3K, T4VŞAN, A5LAN, MASA, ELMA
- Tap a signal → Score +1
- Tap a noise → Game Over
- Let a signal fall off screen → Game Over
- Let a noise fall off screen → Safe (disappears)

## Difficulty Scaling

Every 5 points increases a "level":
- Fall speed increases (max: 1.4s full-screen traversal)
- Spawn interval decreases (min: 550ms)
- Noise ratio increases (max: 72%)

## App Flow

Screen state managed in `app/index.tsx` via `const [currentScreen, setCurrentScreen] = useState<'menu' | 'game' | 'settings'>('menu')`:
- **menu** → Main Menu (default boot screen)
- **game** → Game field + HUD; GameOverOverlay shown when `gameState === 'gameover'`
- **settings** → Settings screen (haptics toggle, reset score)

## Project Structure

```
app/
  _layout.tsx            # Root layout (Stack, SafeAreaProvider, GestureHandlerRootView)
  index.tsx              # App screen router (menu / game / settings)
components/
  MainMenu.tsx           # Boot screen: title, best score, PLAY / HOW TO PLAY / SETTINGS
  SettingsScreen.tsx     # Haptic toggle + Reset Best Score
  FallingWord.tsx        # Animated word chip (memoized, GestureDetector tap)
  GameOverOverlay.tsx    # Centered card with Play Again + Back to Menu
  HowToPlayModal.tsx     # Bottom sheet with signal/noise word reference
  StartScreen.tsx        # (legacy, no longer rendered)
  ErrorBoundary.tsx      # Error boundary
  ErrorFallback.tsx      # Error fallback UI
hooks/
  useSignalGame.ts       # Game logic: state, spawning, difficulty, haptics, resetBestScore
  useSettings.ts         # Haptic preference persisted to AsyncStorage
```

## Visual Design

Clean, modern, premium aesthetic (chic Apple/Google style):
- **Background**: Pure white `#FFFFFF` / soft off-white `#F5F7FA`
- **Accent (Signal)**: Mint green `#00C853`
- **Danger (Noise/Error)**: Coral red `#FF5252`
- **Text**: Near-black `#111827`, secondary `#6B7280`
- **Typography**: System sans-serif (SF Pro on iOS, Roboto on Android) — no monospace
- **Word chips**: White pill with subtle shadow/border, dark gray text
- **HUD**: Clean white header bar with score + level badge
- **GameOver**: Centered modal card with overlay blur, refresh icon button
- **How to Play**: Bottom sheet with rounded top corners, chips color-coded green/red

## Key Technical Decisions

- `GestureDetector` + `Gesture.Tap().runOnJS(true)` — only reliable way to tap animated views
- `setTimeout` for fall-off detection (NOT Reanimated callbacks — unreliable on web)
- `activeIdsRef` (Set) tracks valid word IDs per session; reset on `startGame()` to prevent stale callbacks
- `SafeAreaProvider` in `_layout.tsx` — required for `useSafeAreaInsets` in game screen + modal

## Workflows

- **Start Frontend**: `npm run expo:dev` — runs Metro on port 8081
- **Start Backend**: `npm run server:dev` — Express server on port 5000 (serves landing page)
