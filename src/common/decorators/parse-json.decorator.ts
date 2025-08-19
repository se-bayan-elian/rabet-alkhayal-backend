import { Transform } from 'class-transformer';

/**
 * Transform decorator to parse JSON strings in query parameters
 */
export function ParseJson() {
  return Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch (error) {
        // If parsing fails, return the original value
        return value;
      }
    }
    return value;
  });
}
