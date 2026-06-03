import type { Metadata } from 'next';

const truncate = (text: string, max: number) =>
  text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;

const formatDate = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const toFeeNumber = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/,/g, '').trim());
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildAdmissionProgramDetailMetadata(
  details: any | null,
  canonical: string
): Metadata {
  const programName =
    details?.program?.name || details?.program_title || 'Program';
  const universityName =
    details?.admission?.university?.name ||
    details?.university?.name ||
    details?.university_name ||
    'University';
  const cityName =
    details?.admission?.campus?.address?.city ||
    details?.campus?.city ||
    'City';
  const year = new Date().getFullYear();

  const feeStructure = details?.fee_structure;
  const amount = toFeeNumber(
    feeStructure?.first_semester_fee ??
      feeStructure?._preview_first_semester_total ??
      feeStructure?.tuition_fee
  );
  const feeText = amount ? `PKR ${amount.toLocaleString()}` : 'PKR amount';

  const admissions = Array.isArray(details?.admissions)
    ? details.admissions
    : details?.admission
      ? [details.admission]
      : [];
  const firstSession = admissions[0];
  const secondSession = admissions[1];
  const session1 = firstSession?.session_term || 'Session';
  const session2 = secondSession?.session_term || 'Next session';
  const deadline1 = formatDate(firstSession?.admission_deadline) || 'TBA';
  const deadline2 = formatDate(secondSession?.admission_deadline) || 'TBA';

  const title = truncate(
    `${programName} Admission ${year} - ${universityName} ${cityName}`,
    60
  );
  const description = truncate(
    `Apply for ${programName} at ${universityName}, ${cityName}. ${session1} open - deadline ${deadline1}. ${session2} open - deadline ${deadline2}. Fee ${feeText}/sem.`,
    160
  );
  const ogTitle = truncate(
    `${universityName} ${programName} ${cityName} - Admissions ${year}`,
    110
  );

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title: ogTitle,
      description,
      url: canonical
    }
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildProgramListDetailMetadata(
  details: any | null,
  canonical: string,
  cityFallback: string
): Metadata {
  const programName = details?.name || 'Program';
  const universityName = details?.university?.name || 'University';
  const cityName = details?.campus?.city || cityFallback;

  const feeStructure = details?.fee_structure;
  const amount = toFeeNumber(
    feeStructure?.first_semester_fee ??
      feeStructure?._preview_first_semester_total ??
      feeStructure?.tuition_fee
  );
  const feeText = amount ? `PKR ${amount.toLocaleString()}` : 'PKR amount';

  const admissions = Array.isArray(details?.admissions)
    ? details.admissions
    : [];
  const firstSession = admissions[0];
  const secondSession = admissions[1];
  const year = firstSession?.session_year || new Date().getFullYear();
  const session1 = firstSession?.session_term || 'Session';
  const session2 = secondSession?.session_term || 'Next session';
  const deadline1 = formatDate(firstSession?.admission_deadline) || 'TBA';
  const deadline2 = formatDate(secondSession?.admission_deadline) || 'TBA';

  const title = truncate(
    `${programName} Admission ${year} - ${universityName} ${cityName}`,
    60
  );
  const description = truncate(
    `Apply for ${programName} at ${universityName}, ${cityName}. ${session1} open - deadline ${deadline1}. ${session2} open - deadline ${deadline2}. Fee ${feeText}/sem.`,
    160
  );
  const ogTitle = truncate(
    `${universityName} ${programName} ${cityName} - Admissions ${year}`,
    110
  );

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title: ogTitle,
      description,
      url: canonical
    }
  };
}

export function parseSessionSearchParam(session?: string) {
  const sessionComponents = session?.split('-');
  return {
    sessionSegment: sessionComponents?.[0],
    sessionYear: sessionComponents?.[1]
  };
}
