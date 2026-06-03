import { normalizeHost, extractClientHost } from './host.utils';

describe('Host Utils', () => {
    describe('normalizeHost', () => {
        it('should remove protocol and port', () => {
            expect(normalizeHost('https://localhost:3000')).toBe('localhost');
            expect(normalizeHost('http://app.example.com:8080')).toBe('app.example.com');
            expect(normalizeHost('https://api.example.com:443')).toBe('api.example.com');
        });

        it('should remove only protocol when no port', () => {
            expect(normalizeHost('https://localhost')).toBe('localhost');
            expect(normalizeHost('http://app.example.com')).toBe('app.example.com');
        });

        it('should remove only port when no protocol', () => {
            expect(normalizeHost('localhost:3000')).toBe('localhost');
            expect(normalizeHost('app.example.com:8080')).toBe('app.example.com');
        });

        it('should convert to lowercase', () => {
            expect(normalizeHost('HTTP://APP.EXAMPLE.COM')).toBe('app.example.com');
            expect(normalizeHost('HTTPS://LOCALHOST:3000')).toBe('localhost');
        });

        it('should handle already normalized hosts', () => {
            expect(normalizeHost('localhost')).toBe('localhost');
            expect(normalizeHost('app.example.com')).toBe('app.example.com');
        });

        it('should remove www prefix', () => {
            expect(normalizeHost('www.scholarbee.pk')).toBe('scholarbee.pk');
            expect(normalizeHost('www.example.com')).toBe('example.com');
            expect(normalizeHost('www.localhost')).toBe('localhost');
        });

        it('should remove www prefix with protocol', () => {
            expect(normalizeHost('https://www.scholarbee.pk')).toBe('scholarbee.pk');
            expect(normalizeHost('http://www.example.com')).toBe('example.com');
            expect(normalizeHost('HTTP://WWW.SCHOLARBEE.PK')).toBe('scholarbee.pk');
        });

        it('should remove www prefix with port', () => {
            expect(normalizeHost('www.scholarbee.pk:3000')).toBe('scholarbee.pk');
            expect(normalizeHost('www.example.com:8080')).toBe('example.com');
        });

        it('should remove www prefix with protocol and port', () => {
            expect(normalizeHost('https://www.scholarbee.pk:3000')).toBe('scholarbee.pk');
            expect(normalizeHost('http://www.example.com:8080')).toBe('example.com');
            expect(normalizeHost('HTTP://WWW.SCHOLARBEE.PK:3000')).toBe('scholarbee.pk');
        });

        it('should handle www prefix case variations', () => {
            expect(normalizeHost('WWW.SCHOLARBEE.PK')).toBe('scholarbee.pk');
            expect(normalizeHost('Www.Scholarbee.Pk')).toBe('scholarbee.pk');
            expect(normalizeHost('www.SCHOLARBEE.pk')).toBe('scholarbee.pk');
        });

        it('should not remove www if it\'s part of the domain', () => {
            expect(normalizeHost('wwwwww.example.com')).toBe('wwwwww.example.com');
            expect(normalizeHost('mywww.example.com')).toBe('mywww.example.com');
            expect(normalizeHost('example.com')).toBe('example.com');
        });

        it('should handle edge cases', () => {
            expect(normalizeHost('')).toBe('');
            expect(normalizeHost('localhost:')).toBe('localhost');
            expect(normalizeHost(':3000')).toBe('');
            expect(normalizeHost('www.')).toBe('');
            expect(normalizeHost('www:3000')).toBe('www');
        });

        it('should handle complex real-world examples', () => {
            expect(normalizeHost('https://www.scholarbee.pk:3000')).toBe('scholarbee.pk');
            expect(normalizeHost('HTTP://WWW.APP.EXAMPLE.COM:8080')).toBe('app.example.com');
            expect(normalizeHost('www.api.scholarbee.pk')).toBe('api.scholarbee.pk');
            expect(normalizeHost('https://www.subdomain.example.com')).toBe('subdomain.example.com');
        });

        it('should strip routes, query strings, and fragments from URLs', () => {
            expect(normalizeHost('https://example.com/path/to/resource')).toBe('example.com');
            expect(normalizeHost('http://example.com/path?x=1&y=2')).toBe('example.com');
            expect(normalizeHost('https://example.com/path#section')).toBe('example.com');
            expect(normalizeHost('https://www.example.com/path/child?x=1#hash')).toBe('example.com');
            expect(normalizeHost('http://WWW.EXAMPLE.COM/Deep/Route/?q=1#frag')).toBe('example.com');
            expect(normalizeHost('https://example.com:8443/route/sub?q=1#h')).toBe('example.com');
            expect(normalizeHost('example.com/route/sub?q=1#h')).toBe('example.com');
            expect(normalizeHost('www.example.com/route')).toBe('example.com');
        });
    });

    describe('extractClientHost', () => {
        it('should extract from x-forwarded-host header', () => {
            const headers = {
                'x-forwarded-host': 'app.example.com:3000',
                'host': 'localhost:8080',
                'x-original-host': 'other.example.com'
            };
            const hostname = 'localhost';

            const result = extractClientHost(headers, hostname);
            expect(result).toBe('app.example.com');
        });

        it('should extract from x-original-host when x-forwarded-host not available', () => {
            const headers = {
                'host': 'localhost:8080',
                'x-original-host': 'app.example.com:3000'
            };
            const hostname = 'localhost';

            const result = extractClientHost(headers, hostname);
            expect(result).toBe('app.example.com');
        });

        it('should extract from host when other headers not available', () => {
            const headers = {
                'host': 'app.example.com:3000'
            };
            const hostname = 'localhost';

            const result = extractClientHost(headers, hostname);
            expect(result).toBe('app.example.com');
        });

        it('should extract from hostname when no headers available', () => {
            const headers = {};
            const hostname = 'app.example.com';

            const result = extractClientHost(headers, hostname);
            expect(result).toBe('app.example.com');
        });

        it('should return undefined when no host information available', () => {
            const headers = {};
            const hostname = undefined;

            const result = extractClientHost(headers, hostname);
            expect(result).toBeUndefined();
        });

        it('should normalize the extracted host', () => {
            const headers = {
                'x-forwarded-host': 'https://app.example.com:3000'
            };
            const hostname = 'localhost';

            const result = extractClientHost(headers, hostname);
            expect(result).toBe('app.example.com');
        });

        it('should normalize www prefixes in extracted hosts', () => {
            const headers = {
                'x-forwarded-host': 'https://www.scholarbee.pk:3000'
            };
            const hostname = 'localhost';

            const result = extractClientHost(headers, hostname);
            expect(result).toBe('scholarbee.pk');
        });

        it('should handle www prefixes in different header types', () => {
            const headers = {
                'host': 'www.scholarbee.pk:3000'
            };
            const hostname = 'localhost';

            const result = extractClientHost(headers, hostname);
            expect(result).toBe('scholarbee.pk');
        });

        it('should handle www prefixes in hostname fallback', () => {
            const headers = {};
            const hostname = 'www.scholarbee.pk';

            const result = extractClientHost(headers, hostname);
            expect(result).toBe('scholarbee.pk');
        });
    });
}); 