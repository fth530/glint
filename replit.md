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

## Project Structure

```
app/
  _layout.tsx          # Root layout (Stack, no tabs)
  index.tsx            # Main game screen
components/
  FallingWord.tsx      # Animated word (memoized, own Reanimated animation)
  GameOverOverlay.tsx  # Game over modal with spring-animated button
  StartScreen.tsx      # Idle/start screen
  ErrorBoundary.tsx    # Error boundary
  ErrorFallback.tsx    # Error fallback UI
hooks/
  useSignalGame.ts     # Core game logic: state, spawning, difficulty, haptics
```

## Workflows

- **Start Frontend**: `npm run expo:dev` — runs Metro on port 8081
- **Start Backend**: `npm run server:dev` — Express server on port 5000 (serves landing page)
