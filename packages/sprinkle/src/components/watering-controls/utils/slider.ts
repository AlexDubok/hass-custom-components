export const getTickValues = (n: number, min: number, max: number): number[] => {
    if (n === 1) return [min];
    const step = (max - min) / (n - 1);
    return Array.from({ length: n }, (_, i) => Math.round(min + i * step));
};