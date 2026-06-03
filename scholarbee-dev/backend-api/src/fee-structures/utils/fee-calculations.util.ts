import { FeeType, IFeeItem, SemesterApplicability } from '../schemas/fee-structure.schema';

/**
 * Helper function to check if a fee is a "total fee" placeholder
 * 
 * "Total fee" placeholders are fees with type 'other' and name containing "total".
 * These are often used as summary placeholders that should be excluded from calculations
 * when individual fee items are present, to avoid double-counting.
 */
function isTotalFeePlaceholder(fee: IFeeItem): boolean {
  if (fee.type !== FeeType.OTHER || typeof fee.name !== "string") {
    return false;
  }

  // use regex to match "total" or "per*semester"
  const regex = /total|per\s*semester/i; // matches "total" | "per semester" | "per     semester" | "ToTal" | "Per Semester"
  return regex.test(fee.name);
}

/**
 * Helper function to filter out total fee placeholders when other fees exist
 * 
 * Logic: If there are other real fee items in the array, skip "total fee" placeholders
 * to avoid double-counting. However, if "total fee" is the only fee item, include it
 * to ensure we don't return 0 when there's at least some fee information.
 */
function shouldSkipFee(fee: IFeeItem, allFees: IFeeItem[]): boolean {
  const hasNonTotalFees = allFees.some((f) => !isTotalFeePlaceholder(f));
  return hasNonTotalFees && isTotalFeePlaceholder(fee);
}

/**
 * Helper function to convert specific semesters to numbers
 */
function parseSemesterNumbers(specificSemesters: (string | number)[]): number[] {
  return specificSemesters
    .map((s: string | number) => (typeof s === 'string' ? parseInt(s, 10) : s))
    .filter((n: number) => !isNaN(n));
}

/**
 * Calculate the total fee amount for the first semester
 * 
 * A fee applies to the first semester if:
 * - semester_applicability is 'all_semesters'
 * - semester_applicability is 'first_semester_only'
 * - semester_applicability is 'not_semester_specific' (one-time fees)
 * - semester_applicability is 'specific_semesters' and includes semester 1
 * - semester_applicability is 'all_semesters_except_last' (includes first)
 * 
 * @param fees - Array of fee items
 * @param totalSemesters - Total number of semesters (default: 8)
 * @returns Total fee amount for the first semester
 */
export function calculateFirstSemesterFee(
  fees: IFeeItem[],
  totalSemesters: number = 8,
): number {
  if (!Array.isArray(fees) || fees.length === 0) {
    return 0;
  }

  let total = 0;

  for (const fee of fees) {
    if (shouldSkipFee(fee, fees)) {
      continue;
    }

    const amount = fee.amount || 0;
    const applicability = fee.semester_applicability;
    const semesterNumbers = parseSemesterNumbers(fee.specific_semesters || []);

    // Check if applies to first semester
    // A fee applies to the first semester if it matches any of these conditions:
    const appliesToFirst =
      // 1. Fee applies to all semesters (includes first semester)
      applicability === SemesterApplicability.ALL_SEMESTERS ||
      // 2. Fee is explicitly marked as first semester only
      applicability === SemesterApplicability.FIRST_SEMESTER_ONLY ||
      // 3. Fee is not semester-specific (one-time fees like application fees are paid in first semester)
      applicability === SemesterApplicability.NOT_SEMESTER_SPECIFIC ||
      // 4. Fee is set for specific semesters and semester 1 is included
      (applicability === SemesterApplicability.SPECIFIC_SEMESTERS &&
        semesterNumbers.includes(1)) ||
      // 5. Fee applies to all semesters except last (includes first semester)
      (applicability === SemesterApplicability.ALL_SEMESTERS_EXCEPT_LAST);

    if (appliesToFirst) {
      total += amount;
    }
  }

  return total;
}

/**
 * Calculate the total fee amount for regular semesters (not first, not last)
 * 
 * A fee applies to regular semesters if:
 * - semester_applicability is 'all_semesters'
 * - semester_applicability is 'all_semesters_except_first'
 * - semester_applicability is 'all_semesters_except_last'
 * - semester_applicability is 'specific_semesters' and includes any semester > 1 and < totalSemesters
 * 
 * @param fees - Array of fee items
 * @param totalSemesters - Total number of semesters (default: 8)
 * @returns Total fee amount for regular semesters
 */
export function calculateRegularSemesterFee(
  fees: IFeeItem[],
  totalSemesters: number = 8,
): number {
  if (!Array.isArray(fees) || fees.length === 0) {
    return 0;
  }

  let total = 0;

  for (const fee of fees) {
    if (shouldSkipFee(fee, fees)) {
      continue;
    }

    const amount = fee.amount || 0;
    const applicability = fee.semester_applicability;
    const semesterNumbers = parseSemesterNumbers(fee.specific_semesters || []);

    // Check if applies to regular semesters (not first, not last)
    const appliesToRegular =
      applicability === SemesterApplicability.ALL_SEMESTERS ||
      applicability === SemesterApplicability.ALL_SEMESTERS_EXCEPT_FIRST ||
      applicability === SemesterApplicability.ALL_SEMESTERS_EXCEPT_LAST ||
      (applicability === SemesterApplicability.SPECIFIC_SEMESTERS &&
        semesterNumbers.some((s: number) => s > 1 && s < totalSemesters));

    if (appliesToRegular) {
      total += amount;
    }
  }

  return total;
}

/**
 * Calculate the total fee amount for the last semester
 * 
 * A fee applies to the last semester if:
 * - semester_applicability is 'all_semesters'
 * - semester_applicability is 'last_semester_only'
 * - semester_applicability is 'specific_semesters' and includes the last semester number
 * - semester_applicability is 'all_semesters_except_first' (includes last)
 * 
 * @param fees - Array of fee items
 * @param totalSemesters - Total number of semesters (default: 8)
 * @returns Total fee amount for the last semester
 */
export function calculateLastSemesterFee(
  fees: IFeeItem[],
  totalSemesters: number = 8,
): number {
  if (!Array.isArray(fees) || fees.length === 0) {
    return 0;
  }

  let total = 0;

  for (const fee of fees) {
    if (shouldSkipFee(fee, fees)) {
      continue;
    }

    const amount = fee.amount || 0;
    const applicability = fee.semester_applicability;
    const semesterNumbers = parseSemesterNumbers(fee.specific_semesters || []);

    // Check if applies to last semester
    const appliesToLast =
      applicability === SemesterApplicability.ALL_SEMESTERS ||
      applicability === SemesterApplicability.LAST_SEMESTER_ONLY ||
      (applicability === SemesterApplicability.SPECIFIC_SEMESTERS &&
        semesterNumbers.includes(totalSemesters)) ||
      (applicability === SemesterApplicability.ALL_SEMESTERS_EXCEPT_FIRST);

    if (appliesToLast) {
      total += amount;
    }
  }

  return total;
}

/**
 * Calculate all semester fees at once
 * 
 * @param fees - Array of fee items
 * @param totalSemesters - Total number of semesters (default: 8)
 * @returns Object containing first, regular, and last semester fees
 */
export function calculateAllSemesterFees(
  fees: IFeeItem[],
  totalSemesters: number = 8,
): {
  first: number;
  regular: number;
  last: number;
} {
  return {
    first: calculateFirstSemesterFee(fees, totalSemesters),
    regular: calculateRegularSemesterFee(fees, totalSemesters),
    last: calculateLastSemesterFee(fees, totalSemesters),
  };
}
