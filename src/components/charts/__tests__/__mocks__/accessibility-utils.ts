// Mock for accessibility-utils
export const generateAccessibilityId = (prefix: string) => `${prefix}-${Math.random().toString(36).substring(2, 9)}`;