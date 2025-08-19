import { Transform } from 'class-transformer';

/**
 * Transform decorator to parse JSON strings and ensure array format for sort
 */
export function ParseJsonArray() {
  return Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        // If it's a single object, convert to array
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch (error) {
        // If parsing fails, return the original value
        return value;
      }
    }
    // If it's already an object, convert to array
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return [value];
    }
    return value;
  });
}
