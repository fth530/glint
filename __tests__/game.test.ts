import { SIGNALS, generateNoiseWord, getLevel, getDifficulty } from '../constants/game';

describe('Game Constants & Glitch Engine', () => {
    describe('SIGNALS', () => {
        it('should contain a large variety of valid Turkish words', () => {
            expect(SIGNALS.length).toBeGreaterThan(50);
            expect(SIGNALS).toContain('KEDİ');
            expect(SIGNALS).toContain('BİLGİSAYAR');
        });
    });

    describe('generateNoiseWord (Glitch Engine)', () => {
        it('should NEVER return the exact original word', () => {
            // Let's test this heavily to ensure no pure signals leak as noise
            for (let i = 0; i < 100; i++) {
                const randomSignal = SIGNALS[Math.floor(Math.random() * SIGNALS.length)];
                const noised = generateNoiseWord(randomSignal);
                expect(noised).not.toBe(randomSignal);
            }
        });

        it('should alter words using leet speak or swapping', () => {
            const original = 'MASA'; // Contains 'A' and 'S'
            const noised = generateNoiseWord(original);

            // It should either replace A->4, S->5, or swap letters. M, A, S, A
            expect(noised).not.toEqual('MASA');
            expect(noised.length === original.length).toBeTruthy(); // Length should remain the same
        });

        it('should safely handle very short words', () => {
            const shortWord = 'A';
            const noised = generateNoiseWord(shortWord);
            expect(noised).not.toBe('A');
        });
    });
});

describe('getLevel', () => {
    it('should return 1 at score 0', () => {
        expect(getLevel(0)).toBe(1);
    });

    it('should increment every 5 points', () => {
        expect(getLevel(9)).toBe(2);
        expect(getLevel(10)).toBe(3);
        expect(getLevel(50)).toBe(11);
    });
});

describe('getDifficulty', () => {
    it('should get harder as score increases', () => {
        const level0 = getDifficulty(0);
        const level1 = getDifficulty(5);
        const level5 = getDifficulty(25);
        const level20 = getDifficulty(100);

        // Fall duration decreases
        expect(level1.fallDuration).toBeLessThan(level0.fallDuration);
        expect(level5.fallDuration).toBeLessThan(level1.fallDuration);

        // Noise ratio increases
        expect(level1.noiseRatio).toBeGreaterThan(level0.noiseRatio);
        expect(level5.noiseRatio).toBeGreaterThan(level1.noiseRatio);

        // Never reaches absolute minimum — always room to get harder
        expect(level20.fallDuration).toBeGreaterThan(1000);
        expect(level20.spawnInterval).toBeGreaterThan(400);
        expect(level20.noiseRatio).toBeLessThan(0.76);
    });
});
