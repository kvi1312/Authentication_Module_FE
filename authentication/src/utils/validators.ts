import { EMAIL_PATTERN, PASSWORD_PATTERN, VALIDATION_RULES } from './constants';

export const validateEmail = (email: string): string | null => {
  if (!email) {
    return VALIDATION_RULES.EMAIL.REQUIRED;
  }
  if (!EMAIL_PATTERN.test(email)) {
    return VALIDATION_RULES.EMAIL.INVALID;
  }
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) {
    return VALIDATION_RULES.PASSWORD.REQUIRED;
  }
  if (password.length < 8) {
    return VALIDATION_RULES.PASSWORD.MIN_LENGTH;
  }
  if (!PASSWORD_PATTERN.test(password)) {
    return VALIDATION_RULES.PASSWORD.PATTERN;
  }
  return null;
};

export const validateConfirmPassword = (password: string, confirmPassword: string): string | null => {
  if (!confirmPassword) {
    return VALIDATION_RULES.CONFIRM_PASSWORD.REQUIRED;
  }
  if (password !== confirmPassword) {
    return VALIDATION_RULES.CONFIRM_PASSWORD.MISMATCH;
  }
  return null;
};

export const validateUsername = (username: string): string | null => {
  if (!username) {
    return VALIDATION_RULES.USERNAME.REQUIRED;
  }
  if (username.length < 3) {
    return VALIDATION_RULES.USERNAME.MIN_LENGTH;
  }
  return null;
};

export const validateRequired = (value: string, fieldName: string): string | null => {
  if (!value || value.trim() === '') {
    return `${fieldName} is required`;
  }
  return null;
};

export const validateTokenExpiry = (minutes: number, min: number, max: number): string | null => {
  if (minutes < min || minutes > max) {
    return `Value must be between ${min} and ${max}`;
  }
  return null;
};

export const validateTokenDays = (days: number, min: number, max: number): string | null => {
  if (days < min || days > max) {
    return `Value must be between ${min} and ${max}`;
  }
  return null;
};
