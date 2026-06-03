import slugify from 'slugify';

export const SLUG_DEFAULT_OPTIONS = {
  lower: true,
  strict: true,
  replacement: '-',
};

/**
 * Converts a string into a URL-friendly slug.
 * @param text The string to slugify
 * @param options Optional overrides for slugify
 * @returns The slugified string
 */
export const toSlug = (text: string, options?: any): string => {
  return slugify(text, { ...SLUG_DEFAULT_OPTIONS, ...options });
};
