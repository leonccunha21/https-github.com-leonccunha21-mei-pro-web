export const roundCurrency = (value: number): number => {
  const epsilon = value < 0 ? -Number.EPSILON : Number.EPSILON;
  return Math.round((value + epsilon) * 100) / 100;
};
