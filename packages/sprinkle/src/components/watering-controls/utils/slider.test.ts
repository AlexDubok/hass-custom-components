import { getTickValues } from './slider';

describe('Slider utils', () => {
    describe('getTickValues', () => {
        it('should return n equally split value steps (rounded)', () => {
            const n = 5;
            const min = 0;
            const max = 100;
            const expected = [0, 25, 50, 75, 100];
            const result = getTickValues(n, min, max);
            expect(result).toEqual(expected);
        });

        it('should return [min] when n is 1', () => {
            expect(getTickValues(5, 0, 25)).toEqual([0, 5, 10, 15, 20, 25]);
        });

        it('should return [min] when n is 1', () => {
            expect(getTickValues(1, 10, 50)).toEqual([10]);
        });

        it('should handle negative min and max (rounded)', () => {
            expect(getTickValues(3, -10, 10)).toEqual([-10, 0, 10]);
        });

        it('should handle min greater than max (rounded)', () => {
            expect(getTickValues(3, 10, -10)).toEqual([10, 0, -10]);
        });

        it('should handle floating point steps (rounded)', () => {
            expect(getTickValues(4, 0, 1)).toEqual([0, 0, 1, 1]);
        });

        it('should handle n = 2', () => {
            expect(getTickValues(2, 5, 15)).toEqual([5, 15]);
        });

        it('should handle large n with rounding', () => {
            expect(getTickValues(6, 0, 10)).toEqual([0, 2, 4, 6, 8, 10]);
        });

        it('should handle negative range with rounding', () => {
            expect(getTickValues(4, -5, -1)).toEqual([-5, -4, -2, -1]);
        });

        it('should handle all zeros', () => {
            expect(getTickValues(3, 0, 0)).toEqual([0, 0, 0]);
        });
    });
});