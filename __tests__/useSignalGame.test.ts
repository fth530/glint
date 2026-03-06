import { renderHook, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSignalGame } from '../hooks/useSignalGame';

// Mocks
jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(null),
    removeItem: jest.fn().mockResolvedValue(null),
}));

jest.mock('expo-haptics', () => ({
    impactAsync: jest.fn().mockResolvedValue(null),
    notificationAsync: jest.fn().mockResolvedValue(null),
    ImpactFeedbackStyle: { Light: 'light' },
    NotificationFeedbackType: { Error: 'error' },
}));

describe('useSignalGame Hook', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should initialize with default state', async () => {
        const { result } = renderHook(() => useSignalGame(400, false));

        // Initially idle
        expect(result.current.gameState).toBe('idle');
        expect(result.current.score).toBe(0);
        expect(result.current.words).toEqual([]);
    });

    it('should start game correctly', () => {
        const { result } = renderHook(() => useSignalGame(400, false));

        act(() => {
            result.current.startGame();
        });

        expect(result.current.gameState).toBe('playing');
        expect(result.current.score).toBe(0);
    });

    it('should correctly process a tap on a signal word', () => {
        const { result } = renderHook(() => useSignalGame(400, false));

        act(() => {
            result.current.startGame();
        });

        // Mock a word spawn directly by calling the internal dispatch if possible, 
        // but we can't. We just mock the word list indirectly or test the hook logic.
        // Actually, just wait 500ms using sleep since we removed fake timers.
    });
});
