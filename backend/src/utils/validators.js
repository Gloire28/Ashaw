export const isValidAge = (age) => {
  const n = Number(age);
  return Number.isInteger(n) && n >= 13 && n <= 120;
};

export const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

export const isValidDuration = (hours) => {
  const n = Number(hours);
  return !Number.isNaN(n) && n > 0 && n <= 24;
};
