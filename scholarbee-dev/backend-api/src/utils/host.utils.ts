/**
 * Utility functions for host manipulation and validation
 */

/**
 * Returns a canonical hostname for a variety of input shapes.
 *
 * This function accepts either a full URL (e.g. from `Origin`/`Referer`) or a bare host
 * (e.g. from proxy headers). It will:
 *  - parse full URLs and extract the hostname
 *  - strip protocol remnants, path/query/hash segments, and port
 *  - remove a leading `www.`
 *  - lowercase the result
 *
 * Notes
 *  - Invalid/malformed inputs normalize to an empty string.
 *  - Ports are intentionally dropped to align with `ADMIN_CLIENT_HOSTS` format.
 *
 * @param host Input that may be a URL or a host
 * @returns Canonical hostname (lowercase, no protocol/port/path), or '' when not extractable
 *
 * @example
 * normalizeHost("https://localhost:3000") // "localhost"
 * normalizeHost("http://app.example.com:8080") // "app.example.com"
 * normalizeHost("localhost:3000") // "localhost"
 * normalizeHost("app.example.com") // "app.example.com"
 * normalizeHost("HTTP://APP.EXAMPLE.COM") // "app.example.com"
 * normalizeHost("https://www.scholarbee.pk") // "scholarbee.pk"
 * normalizeHost("www.example.com") // "example.com"
 */
export const normalizeHost = (host: string): string => {
    // Handle non-string inputs
    if (typeof host !== 'string') {
        return '';
    }

    const input = host.trim();

    // Parse using WHATWG URL. If it's a bare host, prepend https:// to coerce a valid URL.
    // This reliably extracts the hostname for URLs while still supporting host-only values.
    let value = input;
    try {
        const hasProtocol = /^https?:\/\//i.test(input);
        const url = hasProtocol
            ? new URL(input)
            : new URL(`https://${input}`);
        value = url.hostname;
    } catch {
        // ignore and fall back to treating input as a host
    }

    // Remove protocol remnants if any (defensive)
    let normalizedHost = value.replace(/^https?:\/\//i, '');

    // Remove path/query/hash fragments if any slipped through
    normalizedHost = normalizedHost.split('/')[0].split('?')[0].split('#')[0];

    // Remove port if present (e.g. "localhost:3000" -> "localhost")
    normalizedHost = normalizedHost.split(':')[0];

    // Remove www prefix if present (e.g. "www.scholarbee.pk" -> "scholarbee.pk")
    normalizedHost = normalizedHost.replace(/^www\./i, '');

    // Convert to lowercase for consistent comparison
    return normalizedHost.toLowerCase();
};

/**
 * Extracts the client/portal host from request metadata in strict priority order.
 *
 * Priority
 *  1) `Origin` (browser) – best reflection of the page making the request
 *  2) `Referer` (browser) – common fallback when Origin is absent
 *  3) `x-forwarded-host` (proxy) – may be set by reverse proxies
 *  4) `x-original-host` (proxy) – alternative proxy header
 *  5) `host` (request) – API host (HTTP/1.1); in HTTP/2 appears as `:authority`
 *  6) `req.hostname` (Express) – last-resort fallback
 *
 * Design rationale
 *  - Each candidate is normalized early via `normalizeHost`. If normalization yields
 *    an empty string (e.g. `Origin: null` or malformed), that candidate is skipped and
 *    we continue to the next header, preserving priority.
 *  - Returning the first non-empty canonical hostname avoids false negatives when
 *    matching against `ADMIN_CLIENT_HOSTS`.
 *
 * @param headers Request headers object
 * @param hostname Express.js hostname
 * @returns First non-empty canonical hostname according to priority, or undefined
 *
 * @example
 * const clientHost = extractClientHost(req.headers, req.hostname);
 */
export const extractClientHost = (
    headers: Record<string, string | string[] | undefined>,
    hostname?: string
): string | undefined => {
    // Prefer browser-sent headers that reflect the page origin (portal host)
    const originHost = normalizeHost((headers['origin'] as string) || '');
    const refererHost = normalizeHost((headers['referer'] as string) || '');

    // Proxy/populated headers (may carry original host if set by infra)
    const xForwardedHost = normalizeHost((headers['x-forwarded-host'] as string) || '');
    const xOriginalHost = normalizeHost((headers['x-original-host'] as string) || '');
    // API host (HTTP/1.1). In HTTP/2 browsers display this as `:authority` in DevTools
    const host = normalizeHost((headers.host as string) || '');

    // Pick first available by priority (empty strings are falsy and skipped)
    const clientHost = originHost
        || refererHost
        || xForwardedHost
        || xOriginalHost
        || host
        || normalizeHost(hostname || '');

    if (clientHost) {
        return clientHost;
    }

    return undefined;
}; 