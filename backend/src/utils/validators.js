export const isValidAge = (age) => {
  const n = Number(age);
  return Number.isInteger(n) && n >= 18 && n <= 120;
};

export const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

export const isValidDuration = (hours) => {
  const n = Number(hours);
  return !Number.isNaN(n) && n > 0 && n <= 24;
};

export const isValidCategory = (value) => value === 'F' || value === 'N';
export const isValidQuartier = (value) => typeof value === 'string' && value.trim().length > 0;
export const isValidOwnerAge = (age) => Number.isInteger(Number(age)) && Number(age) >= 18 && Number(age) <= 100;