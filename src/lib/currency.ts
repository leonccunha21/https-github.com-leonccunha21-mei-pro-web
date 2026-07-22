export const roundCurrency = (value: number): number => {
  return Math.round((value + 1e-9) * 100) / 100;
};
