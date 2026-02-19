/**
 * Shared frontend validation helpers
 */

// Simple email format (RFC-style, not exhaustive)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Phone: digits, optional + at start, optional spaces/dashes, reasonable length (e.g. 9–15 digits)
const PHONE_REGEX = /^\+?[\d\s\-()]{9,20}$/;
const PHONE_DIGITS_MIN = 9;

export function isValidEmail(value) {
  if (!value || typeof value !== "string") return false;
  const trimmed = value.trim();
  return trimmed.length > 0 && EMAIL_REGEX.test(trimmed);
}

export function isValidPhone(value) {
  if (!value || typeof value !== "string") return false;
  const trimmed = value.trim();
  if (trimmed.length === 0) return false;
  const digitsOnly = trimmed.replace(/\D/g, "");
  return PHONE_REGEX.test(trimmed) && digitsOnly.length >= PHONE_DIGITS_MIN;
}

export function validateEmail(value) {
  if (!value?.trim()) return null;
  return isValidEmail(value) ? null : "Please enter a valid email address.";
}

export function validatePhone(value) {
  if (!value?.trim()) return null;
  return isValidPhone(value) ? null : "Please enter a valid phone number (at least 9 digits).";
}

const MIN_PASSWORD_LENGTH = 6;

export function validatePassword(value, options = {}) {
  const { minLength = MIN_PASSWORD_LENGTH, required = true } = options;
  if (!value?.trim()) {
    return required ? "Password is required." : null;
  }
  if (value.length < minLength) {
    return `Password must be at least ${minLength} characters.`;
  }
  return null;
}

export function validateName(value, required = true) {
  if (!value?.trim()) {
    return required ? "Name is required." : null;
  }
  if (value.trim().length < 2) {
    return "Name must be at least 2 characters.";
  }
  return null;
}
