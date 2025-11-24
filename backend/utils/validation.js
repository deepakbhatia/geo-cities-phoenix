/**
 * Validate city input data
 * @param {string} name - City name
 * @param {string} theme - City theme
 * @param {string} vibe - City vibe
 * @returns {string[]} - Array of error messages (empty if valid)
 */
export function validateCityInput(name, theme, vibe) {
  const errors = [];

  // Validate name
  if (!name || typeof name !== 'string') {
    errors.push('Name is required');
  } else if (name.length < 3) {
    errors.push('Name must be at least 3 characters');
  } else if (name.length > 50) {
    errors.push('Name must be no more than 50 characters');
  }

  // Validate theme
  if (!theme || typeof theme !== 'string') {
    errors.push('Theme is required');
  } else if (theme.length < 3) {
    errors.push('Theme must be at least 3 characters');
  } else if (theme.length > 30) {
    errors.push('Theme must be no more than 30 characters');
  }

  // Validate vibe
  if (!vibe || typeof vibe !== 'string') {
    errors.push('Vibe is required');
  } else if (vibe.length < 3) {
    errors.push('Vibe must be at least 3 characters');
  } else if (vibe.length > 30) {
    errors.push('Vibe must be no more than 30 characters');
  }

  // Check for dangerous characters (XSS prevention)
  const dangerousPattern = /<script|javascript:|onerror=|onclick=|onload=/i;
  if (dangerousPattern.test(name) || dangerousPattern.test(theme) || dangerousPattern.test(vibe)) {
    errors.push('Invalid characters detected in input');
  }

  return errors;
}
