// A simple sanitizer that trims whitespace.
// In a real-world scenario with HTML content, you'd use a library like DOMPurify.
export const sanitizeInput = (input: string): string => {
  return input.trim();
};

// --- Validation Functions ---

export const validateEmail = (email: string): string | null => {
  const sanitized = sanitizeInput(email);
  if (!sanitized) return "Email is required.";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitized)) return "Please enter a valid email address.";
  return null;
};

export const validatePhone = (phone: string): string | null => {
  const sanitized = sanitizeInput(phone);
  if (!sanitized) return "Phone number is required.";
  // Regex for Nigerian phone numbers, e.g., 08012345678 or +2348012345678
  const phoneRegex = /^(?:0[7-9][0-9]{9}|\+234[7-9][0-9]{9})$/;
  if (!phoneRegex.test(sanitized)) return "Please enter a valid Nigerian phone number (e.g., 08012345678 or +2348012345678).";
  return null;
};

export const validateUsername = (username: string): string | null => {
  const sanitized = sanitizeInput(username);
  if (!sanitized) return "Username is required.";
  const usernameRegex = /^[a-zA-Z0-9_]{3,16}$/;
  if (!usernameRegex.test(sanitized)) return "Username must be 3-16 characters and contain only letters, numbers, or underscores.";
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) return "Password is required."; // No trim on password
  if (password.length < 8) return "Password must be at least 8 characters long.";
  return null;
};

export const validatePasswordStrength = (password: string): string | null => {
    if (!password) return "Password is required.";
    
    const errors: string[] = [];
    if (password.length < 8) {
        errors.push("be at least 8 characters long");
    }
    if (!/[a-z]/.test(password)) {
        errors.push("contain at least one lowercase letter");
    }
    if (!/[A-Z]/.test(password)) {
        errors.push("contain at least one uppercase letter");
    }
    if (!/[0-9]/.test(password)) {
        errors.push("contain at least one number");
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
        errors.push("contain at least one special character");
    }

    if (errors.length > 0) {
        return `Password must ${errors.join(', ')}.`;
    }

    return null;
};

export const validateRequired = (field: string, fieldName: string): string | null => {
    const sanitized = sanitizeInput(field);
    if (!sanitized) return `${fieldName} is required.`;
    return null;
}

export const validateNumber = (value: string, fieldName: string): string | null => {
    const sanitized = sanitizeInput(value);
    if (!sanitized) return `${fieldName} is required.`;
    const num = Number(sanitized);
    if (isNaN(num) || num < 0) return `${fieldName} must be a non-negative number.`;
    return null;
};