/**
 * Timezone-aware date transformer utility.
 *
 * Problem: Dates stored in MongoDB are always in UTC. When a user in Pakistan
 * signs up at 12:00 AM PKT (UTC+5), the stored timestamp is 7:00 PM UTC the
 * previous day. A naive date filter built from a plain `new Date('2026-02-26')`
 * will miss that document because `2026-02-26T00:00:00.000Z` is actually
 * *after* `2026-02-25T19:00:00.000Z`.
 *
 * Solution: Interpret the caller-supplied `YYYY-MM-DD` string as midnight in
 * the user's local timezone, then convert to UTC before building the DB query.
 *
 * Usage:
 * ```ts
 * const { startUtc, endUtc } = localDateRangeToUtc({
 *   startDate: '2026-02-26',
 *   endDate:   '2026-02-26',
 *   timezone:  'Asia/Karachi',   // from request header, optional
 * });
 * filter.created_at = { $gte: startUtc, $lte: endUtc };
 * ```
 *
 * NOTE: This utility relies solely on the built-in `Intl` API (no extra
 * dependencies), which is available in all modern Node.js runtimes.
 */

/** Default timezone used when the caller does not supply one. */
export const DEFAULT_TIMEZONE = 'Asia/Karachi';

/**
 * Parameters accepted by {@link localDateRangeToUtc}.
 */
export interface LocalDateRangeInput {
    /** Local date string in `YYYY-MM-DD` format (start of range, inclusive). */
    startDate?: string;
    /** Local date string in `YYYY-MM-DD` format (end of range, inclusive). */
    endDate?: string;
    /**
     * IANA timezone identifier sent by the client (e.g. `"Asia/Karachi"`).
     * Falls back to {@link DEFAULT_TIMEZONE} when absent or invalid.
     */
    timezone?: string;
}

/**
 * Result returned by {@link localDateRangeToUtc}.
 */
export interface UtcDateRange {
    /** UTC equivalent of 00:00:00.000 on `startDate` in the local timezone. */
    startUtc?: Date;
    /** UTC equivalent of 23:59:59.999 on `endDate` in the local timezone. */
    endUtc?: Date;
}

/**
 * Validates that an IANA timezone string is recognised by the runtime.
 * Returns the timezone unchanged if valid, or the {@link DEFAULT_TIMEZONE} as
 * a safe fallback if not.
 *
 * @param tz - Timezone string to validate (e.g. `"Asia/Karachi"`).
 * @returns A valid IANA timezone string.
 */
export function resolveTimezone(tz?: string): string {
    if (!tz) return DEFAULT_TIMEZONE;

    try {
        // `Intl.DateTimeFormat` throws a RangeError for unknown timezone identifiers.
        Intl.DateTimeFormat(undefined, { timeZone: tz });
        return tz;
    } catch {
        return DEFAULT_TIMEZONE;
    }
}

/**
 * Converts a local `YYYY-MM-DD` date string to a UTC `Date` object by treating
 * midnight (00:00:00.000) on that day in the given `timezone`.
 *
 * @param dateStr  - Date in `YYYY-MM-DD` format.
 * @param timezone - Valid IANA timezone string.
 * @returns UTC `Date` for midnight at the start of that local day.
 */
function localMidnightToUtc(dateStr: string, timezone: string): Date {
    // Parse year, month, day — avoid `new Date(string)` which is UTC-based.
    const [year, month, day] = dateStr.split('-').map(Number);

    // Build a Date that corresponds to midnight local time in the target timezone.
    // Strategy: construct an ISO string that looks like local midnight, parse it
    // as UTC, then shift by the timezone offset at that moment.
    //
    // We use `Intl.DateTimeFormat` with `timeZoneName: 'shortOffset'` to read
    // the UTC offset, then apply the inverse shift.
    const naiveMidnight = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));

    // Determine the offset (in minutes) of the target timezone at naiveMidnight.
    const offsetMinutes = getTimezoneOffsetMinutes(naiveMidnight, timezone);

    // Shift naiveMidnight by the opposite of the offset to land on true UTC
    // midnight in the local timezone.
    return new Date(naiveMidnight.getTime() - offsetMinutes * 60 * 1000);
}

/**
 * Returns the UTC offset of a given `timezone` at a specific point in time,
 * expressed in **minutes** (positive = ahead of UTC, negative = behind).
 *
 * @param at       - The instant for which to determine the offset (DST-aware).
 * @param timezone - Valid IANA timezone string.
 * @returns Offset in minutes (e.g. +300 for Asia/Karachi UTC+5).
 */
function getTimezoneOffsetMinutes(at: Date, timezone: string): number {
    // Format the date twice — once in UTC and once in the target timezone —
    // then compute the difference.
    const utcParts = getDateParts(at, 'UTC');
    const localParts = getDateParts(at, timezone);

    const utcMs =
        Date.UTC(
            utcParts.year,
            utcParts.month - 1,
            utcParts.day,
            utcParts.hour,
            utcParts.minute,
            utcParts.second,
        );
    const localMs =
        Date.UTC(
            localParts.year,
            localParts.month - 1,
            localParts.day,
            localParts.hour,
            localParts.minute,
            localParts.second,
        );

    return (localMs - utcMs) / (60 * 1000);
}

/** Helper: extracts individual date parts using `Intl.DateTimeFormat`. */
function getDateParts(
    date: Date,
    timezone: string,
): {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
} {
    const fmt = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    });

    const parts = fmt.formatToParts(date);
    const get = (type: string) =>
        Number(parts.find((p) => p.type === type)?.value ?? '0');

    return {
        year: get('year'),
        month: get('month'),
        day: get('day'),
        hour: get('hour'),
        minute: get('minute'),
        second: get('second'),
    };
}

/**
 * Converts a local date range (`YYYY-MM-DD` strings) into a UTC `Date` range
 * suitable for MongoDB `$gte` / `$lte` comparisons.
 *
 * - `startDate` maps to **00:00:00.000** local time → UTC.
 * - `endDate`   maps to **23:59:59.999** local time → UTC.
 * - If `timezone` is missing or invalid, falls back to {@link DEFAULT_TIMEZONE}.
 *
 * @example
 * // User in Pakistan (UTC+5) queries for 2026-02-26
 * const { startUtc, endUtc } = localDateRangeToUtc({
 *   startDate: '2026-02-26',
 *   endDate:   '2026-02-26',
 *   timezone:  'Asia/Karachi',
 * });
 * // startUtc → 2026-02-25T19:00:00.000Z
 * // endUtc   → 2026-02-26T18:59:59.999Z
 */
export function localDateRangeToUtc(input: LocalDateRangeInput): UtcDateRange {
    const tz = resolveTimezone(input.timezone);
    const result: UtcDateRange = {};

    if (input.startDate) {
        result.startUtc = localMidnightToUtc(input.startDate, tz);
    }

    if (input.endDate) {
        // End of day = start of next day minus 1 ms
        const endOfDay = localMidnightToUtc(input.endDate, tz);
        endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);
        endOfDay.setUTCMilliseconds(endOfDay.getUTCMilliseconds() - 1);
        result.endUtc = endOfDay;
    }

    return result;
}
