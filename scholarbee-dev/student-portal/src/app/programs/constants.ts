import { toUrlSlug } from '@/utils/helperFunctions';

/**
 * Easy program selection items: slug (for Level 1 URL) and major (for API filter).
 * Major values match what the admission-programs API expects.
 */
export const EASY_PROGRAM_SLUGS_AND_MAJORS: {
  slug: string;
  major: string;
  title: string;
}[] = [
  {
    slug: 'medicine-and-surgery',
    major: 'Medicine & Surgery',
    title: 'Medicine & Surgery'
  },
  {
    slug: 'computer-science-and-information-technology',
    major: 'Computer Science & Information Technology',
    title: 'Computer Science & Information Technology'
  },
  {
    slug: 'business-administration',
    major: 'Business Administration',
    title: 'Business Administration'
  },
  { slug: 'engineering', major: 'Engineering', title: 'Engineering' },
  {
    slug: 'accounting-and-finance',
    major: 'Accounting & Finance',
    title: 'Accounting & Finance'
  },
  { slug: 'education', major: 'Education', title: 'Education' },
  { slug: 'law', major: 'Law', title: 'Law' },
  { slug: 'psychology', major: 'Psychology', title: 'Psychology' },
  {
    slug: 'pharmacy-and-pharmaceutical-sciences',
    major: 'Pharmacy & Pharmaceutical Sciences',
    title: 'Pharmacy & Pharmaceutical Sciences'
  },
  {
    slug: 'management-sciences',
    major: 'Management Sciences',
    title: 'Management Sciences'
  }
];

const SLUG_TO_MAJOR = new Map(
  EASY_PROGRAM_SLUGS_AND_MAJORS.map(({ slug, major }) => [slug, major])
);

/**
 * Resolves major name for API from Level 1 program slug.
 * Uses known mapping first; falls back to title-casing the slug (e.g. "computer-science" -> "Computer Science").
 */
export function getMajorFromProgramSlug(programSlug: string): string {
  const known = SLUG_TO_MAJOR.get(programSlug.toLowerCase());
  if (known) return known;
  return programSlug
    .replaceAll('-', ' ')
    .replaceAll(/\b\w/g, (c) => c.toUpperCase());
}

export function getProgramSlugFromTitle(title: string): string {
  return toUrlSlug(title);
}

/** City segment (URL) → value for API. Matches OPTIONS.cities value (e.g. "islamabad"). */
export function getCityValueFromSlug(citySlug: string): string {
  return citySlug.toLowerCase().replaceAll('-', ' ');
}

/** City slug → display name (e.g. "Islamabad") for metadata/titles. */
export function getCityDisplayNameFromSlug(citySlug: string): string {
  return citySlug
    .replaceAll('-', ' ')
    .replaceAll(/\b\w/g, (c) => c.toUpperCase());
}
