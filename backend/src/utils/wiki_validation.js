// utils/validation.js
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validateUsername = (username) => {
  const re = /^[a-zA-Z0-9_]{3,20}$/;
  return re.test(username);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const validateRegistration = (data) => {
  const errors = {};

  if (!data.username) {
    errors.username = 'Username is required';
  } else if (!validateUsername(data.username)) {
    errors.username = 'Username must be 3-20 characters (letters, numbers, underscore only)';
  }

  if (!data.email) {
    errors.email = 'Email is required';
  } else if (!validateEmail(data.email)) {
    errors.email = 'Please provide a valid email address';
  }

  if (!data.password) {
    errors.password = 'Password is required';
  } else if (!validatePassword(data.password)) {
    errors.password = 'Password must be at least 6 characters';
  }

  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  if (!data.acceptTerms) {
    errors.acceptTerms = 'You must accept the Terms of Use';
  }

  if (!data.acceptPrivacy) {
    errors.acceptPrivacy = 'You must accept the Privacy Policy';
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0
  };
};

export const validateLogin = (data) => {
  const errors = {};

  if (!data.email) {
    errors.email = 'Email is required';
  }

  if (!data.password) {
    errors.password = 'Password is required';
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0
  };
};