/* eslint-disable @typescript-eslint/no-explicit-any */
import { PortableTextBlock } from '@portabletext/types';
import { format, isToday, isYesterday, isThisWeek, parseISO } from 'date-fns';

export function formatAdmissionDeadline(dateString: string) {
  if (!dateString) return { formattedDate: 'Coming Soon', hasPassed: true };
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  };

  const date = new Date(dateString);
  const formattedDate = date
    .toLocaleDateString('en-GB', options)
    .replace(/ /g, ' ');

  // Standardize comparison to start of day to match getAdmissionStatus
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);

  return {
    formattedDate,
    hasPassed: compareDate < now
  };
}

export function getAdmissionStatus(
  admissionStartDate?: string,
  admissionEndDate?: string,
  receivingApplications?: string | boolean
): string {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const endDate = admissionEndDate ? new Date(admissionEndDate) : null;
  if (endDate) endDate.setHours(0, 0, 0, 0);

  const startDate = admissionStartDate ? new Date(admissionStartDate) : null;
  if (startDate) startDate.setHours(0, 0, 0, 0);

  const isNotReceivingApplications =
    receivingApplications === false || receivingApplications === 'false';
  const isReceivingApplications =
    receivingApplications === true || receivingApplications === 'true';

  // RA = false → Opening Soon (start date in future) or Not Accepting Applications.
  // 'Closed' must NEVER apply when RA = false.
  if (isNotReceivingApplications) {
    if (startDate && startDate >= now) {
      return 'Opening Soon';
    }
    return 'Not Accepting Applications';
  }

  // RA = true (or unspecified): use deadline to derive Closed / Closing Soon / Open.
  if (endDate && endDate < now) {
    return 'Closed';
  }

  if (endDate) {
    const tenDaysFromNow = new Date(now);
    tenDaysFromNow.setDate(now.getDate() + 10);

    if (endDate >= now && endDate <= tenDaysFromNow) {
      return 'Closing Soon';
    }
  }

  if (startDate) {
    const fifteenDaysFromNow = new Date(now);
    fifteenDaysFromNow.setDate(now.getDate() + 15);

    if (startDate >= now && startDate <= fifteenDaysFromNow) {
      return 'Opening Soon';
    }
  }

  // RA explicitly true → Open. Unspecified → also default to Open.
  if (isReceivingApplications) return 'Open';
  return 'Open';
}

export function getYearFromTimestamp(timestamp: string) {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  return year;
}

export function formattedDate(inputDate: string): string {
  if (!inputDate) return '';
  const date = new Date(inputDate);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are zero-based
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getNextTenYears(): { label: string; value: string }[] {
  const currentYear = new Date().getFullYear();
  const yearsArray = [];

  for (let i = 0; i < 2; i++) {
    const year = currentYear + i;
    yearsArray.push({
      label: year.toString(),
      value: year.toString()
    });
  }

  return yearsArray;
}

export const toKebabCase = (str: string): string => {
  if (!str) return '';
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '_')
    .toLowerCase();
};

export function toUrlSlug(str: string): string {
  if (!str || typeof str !== 'string') return '';

  const trailingWhitespace = str.match(/\s+$/)?.[0] ?? '';
  const core = trailingWhitespace
    ? str.slice(0, -trailingWhitespace.length)
    : str;

  const slugCore = core
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-&]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return `${slugCore}${trailingWhitespace}`;
}

export function toProgramCityPathSegment(city: string): string {
  if (!city || typeof city !== 'string') return '';
  return city.trim().toLowerCase();
}

/**
 * Detail URL for admission program cards and notifications:
 * /programs/[seo_title_key]/[city]/[campus_slug]?session=[term]-[year]
 */
export function buildAdmissionProgramDetailUrl(params: {
  seoTitleKey: string;
  city: string;
  campusSlug: string;
  sessionTerm: string;
  sessionYear?: string | number;
}): string {
  const seo = params.seoTitleKey?.trim();
  const city = toProgramCityPathSegment(params.city);
  const campus = params.campusSlug?.trim();
  const session = params.sessionTerm?.trim().toLowerCase();
  const year = params.sessionYear?.toString()?.trim()?.toLowerCase() ?? '';
  if (!seo || !city || !campus || !session) return '';
  const sessionQuery = year ? `${session}-${year}` : session;
  return `/programs/${seo}/${city}/${campus}?session=${sessionQuery}`;
}

/**
 * Builds the canonical program detail URL: /programs/[program-slug]/[city]/[uni]
 * All segments are lowercase, hyphenated, no special characters.
 */
export function getProgramDetailPath(segments: {
  programSlug: string;
  citySlug: string;
  uniSlug: string;
  sessionSegment: string;
  sessionYear: string;
}): string {
  const { programSlug, citySlug, uniSlug, sessionSegment, sessionYear } =
    segments;
  const p = toUrlSlug(programSlug);
  const c = citySlug?.toString()?.toLowerCase();
  const u = toUrlSlug(uniSlug);
  const s = toUrlSlug(sessionSegment?.toLowerCase() ?? '');
  const y = toUrlSlug(sessionYear?.toString()?.trim()?.toLowerCase() ?? '');
  if (!p || !c || !u) return '';
  return `/programs/${p}/${c}/${u}?session=${s}-${y}`;
}

/**
 * Payment schedule display rules:
 * - per_semester → "Per Semester"
 * - per_year → "Per Year"
 * - null, empty, or any other value (including missing) → "Per Semester"
 */
export function getPaymentScheduleLabel(
  payment_schedule: string | null | undefined
): 'Per Semester' | 'Per Year' {
  const normalized = (payment_schedule ?? '')
    .trim()
    .toLowerCase()
    .replaceAll(' ', '_');
  if (normalized === 'per_year') return 'Per Year';
  return 'Per Semester';
}

/** True only when payment_schedule is explicitly per_year; otherwise false (treat as per semester). */
export function isPaymentSchedulePerYear(
  payment_schedule: string | null | undefined
): boolean {
  return getPaymentScheduleLabel(payment_schedule) === 'Per Year';
}

export const toTitleCase = (str: string): string => {
  return str
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

export const transformToPortableText = (data: any[]): PortableTextBlock[] => {
  return data.flatMap((section) => {
    const blocks = section.value.map((block: any, index: number) => {
      const children = block.children.map((child: any, childIdx: number) => ({
        _type: 'span',
        _key: `${section.id}-${index}-${childIdx}`,
        text: child.text || '',
        marks: child.bold ? ['bold'] : []
      }));

      if (block.type === 'ol' || block.type === 'ul') {
        return block.children.map((listItem: any, listIdx: number) => ({
          _type: 'block',
          _key: `${section.id}-${index}-${listIdx}`,
          listItem: block.type === 'ol' ? 'number' : 'bullet',
          style: 'normal',
          children: listItem.children.map((child: any, childIdx: number) => ({
            _type: 'span',
            _key: `${section.id}-${index}-${listIdx}-${childIdx}`,
            text: child.text || '',
            marks: child.bold ? ['bold'] : []
          }))
        }));
      }

      return {
        _type: 'block',
        _key: `${section.id}-${index}`,
        style: 'normal',
        children
      };
    });

    return blocks.flat();
  });
};

export const formatMoney = (amount: number | undefined | null): string => {
  if (amount === undefined || amount === null || amount === 0) {
    return 'Not Disclosed';
  }
  try {
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  } catch (error) {
    console.error('Error formatting money:', error);
    return 'Not Disclosed';
  }
};

export const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'pending':
      return '#FFB700';
    case 'draft':
      return '#464D5A';
    case 'approved':
      return '#44FF00';
    case 'rejected':
      return '#FF0000';
    case 'under review':
      return '#464D5A';
    case 'open':
      return '#44FF00';
    case 'closed':
      return '#FF0000';
    default:
      return '#F5B700';
  }
};

const allowedDomains = [
  'flagcdn.com',
  'scolarbee-s3-bucket.s3.us-east-1.amazonaws.com',
  'scolarbee-bucket.s3.amazonaws.com',
  'maps.googleapis.com',
  'storage.googleapis.com'
];

export function isDomainAllowed(imageUrl: string | undefined): boolean {
  if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.trim()) {
    return false;
  }
  try {
    const url = new URL(imageUrl);
    return allowedDomains.includes(url.hostname);
  } catch {
    return false;
  }
}

export const formatSnakeCase = (text: string): string => {
  return text
    ? text
        .split('_')
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(' ')
    : '';
};

export const formatLastChatTime = (isoString: string): string => {
  const date = parseISO(isoString);

  if (isToday(date)) {
    return format(date, 'hh:mm a');
  } else if (isYesterday(date)) {
    return ' yesterday';
  } else if (isThisWeek(date)) {
    return format(date, 'EEEE');
  } else {
    return format(date, 'dd-MM-yyyy');
  }
};

export function formatMessageTime(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const oneDay = 24 * 60 * 60 * 1000;
  const oneWeek = 7 * oneDay;

  const isToday = date.toDateString() === now.toDateString();
  const isYesterday =
    date.toDateString() === new Date(now.getTime() - oneDay).toDateString();
  const isWithinWeek = now.getTime() - date.getTime() < oneWeek;

  if (isToday) {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } else if (isYesterday) {
    return 'Yesterday';
  } else if (isWithinWeek) {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  } else {
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }
}

export const getFormattedMajorsAndDegreeLevels = (items: string[]) => {
  return items?.map((item: string) => ({
    label: item,
    value: item
  }));
};

/**
 * Text overlaid on the campus image on program cards (`ProgramCard`).
 * Listing data uses flattened `university_abbreviation`; favorites nest the same fields under
 * `program` / `campus_id.university_id`.
 */
export function resolveProgramUniversityAbbreviation(
  favorite: any,
  program: any,
  universityId: any
): string {
  const u =
    universityId && typeof universityId === 'object' ? universityId : null;
  const abbreviationCandidates = [
    u?.abbreviation,
    u?.short_name,
    u?.acronym,
    u?.initials,
    program?.university_abbreviation,
    favorite?.university_abbreviation
  ];
  const abbreviation = abbreviationCandidates.find(
    (candidate) => typeof candidate === 'string' && candidate.trim().length > 0
  );
  return abbreviation?.trim() ?? '';
}
