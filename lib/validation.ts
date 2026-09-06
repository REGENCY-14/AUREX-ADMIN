export const MIN_PASSWORD_LENGTH = 8;

export function hasPasswordNumber(value: string): boolean {
  return /\d/.test(value);
}

export function hasPasswordSymbol(value: string): boolean {
  return /[^A-Za-z0-9]/.test(value);
}

export function isValidPassword(value: string): boolean {
  return value.length >= MIN_PASSWORD_LENGTH && hasPasswordNumber(value) && hasPasswordSymbol(value);
}
