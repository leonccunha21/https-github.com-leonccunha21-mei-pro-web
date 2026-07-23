export const roundCurrency = (value: number): number => {
  // Fix for floating point precision: use decimal.js-like approach
  // 1.005 * 100 = 100.5 -> round = 101 -> /100 = 1.01
  return Math.round(value * 100 + Number.EPSILON) / 100;
};
