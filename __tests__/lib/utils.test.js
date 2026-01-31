/**
 * Utility Function Tests
 * Tests for lib/utils.js helper functions
 */

import { cn, generateAvatar, formatDate, truncateText, getInitials, validateEmail, formatNumber, debounce } from '@/lib/utils';

describe('cn (className merge)', () => {
    it('merges simple classNames', () => {
        expect(cn('foo', 'bar')).toBe('foo bar');
    });

    it('handles conditional classNames', () => {
        expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
        expect(cn('foo', true && 'bar', 'baz')).toBe('foo bar baz');
    });

    it('handles undefined and null values', () => {
        expect(cn('foo', undefined, null, 'bar')).toBe('foo bar');
    });

    it('deduplicates conflicting Tailwind classes', () => {
        const result = cn('px-2 py-1', 'px-4');
        expect(result).toContain('px-4');
        expect(result).toContain('py-1');
    });
});

describe('generateAvatar', () => {
    it('generates initials from name', () => {
        const result = generateAvatar('John Doe');
        expect(result.initials).toBe('JD');
        expect(result.backgroundColor).toBeDefined();
    });

    it('handles single name', () => {
        const result = generateAvatar('John');
        expect(result.initials).toBe('J');
    });

    it('handles empty name', () => {
        const result = generateAvatar('');
        expect(result.initials).toBe('?');
    });

    it('handles null/undefined', () => {
        const result = generateAvatar(null);
        expect(result.initials).toBe('?');
    });
});

describe('formatDate', () => {
    it('formats date correctly', () => {
        const date = new Date('2024-01-15T10:30:00Z');
        const result = formatDate(date);
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
    });

    it('handles string input', () => {
        const result = formatDate('2024-01-15');
        expect(result).toBeDefined();
    });

    it('handles invalid date', () => {
        const result = formatDate('invalid');
        expect(result).toBeDefined();
    });
});

describe('truncateText', () => {
    it('truncates long text', () => {
        const text = 'This is a very long text that should be truncated';
        const result = truncateText(text, 20);
        expect(result.length).toBeLessThanOrEqual(23); // 20 + '...'
        expect(result.endsWith('...')).toBe(true);
    });

    it('returns short text unchanged', () => {
        const text = 'Short';
        const result = truncateText(text, 20);
        expect(result).toBe('Short');
    });

    it('handles empty string', () => {
        expect(truncateText('', 20)).toBe('');
    });
});

describe('getInitials', () => {
    it('gets initials from full name', () => {
        expect(getInitials('John Doe')).toBe('JD');
    });

    it('handles single name', () => {
        expect(getInitials('John')).toBe('J');
    });

    it('handles multiple names', () => {
        expect(getInitials('John Michael Doe')).toBe('JD');
    });

    it('handles empty string', () => {
        expect(getInitials('')).toBe('');
    });
});

describe('validateEmail', () => {
    it('validates correct emails', () => {
        expect(validateEmail('test@example.com')).toBe(true);
        expect(validateEmail('user@sit.ac.in')).toBe(true);
    });

    it('rejects invalid emails', () => {
        expect(validateEmail('invalid')).toBe(false);
        expect(validateEmail('test@')).toBe(false);
        expect(validateEmail('@example.com')).toBe(false);
    });

    it('handles empty input', () => {
        expect(validateEmail('')).toBe(false);
        expect(validateEmail(null)).toBe(false);
    });
});

describe('formatNumber', () => {
    it('formats thousands', () => {
        expect(formatNumber(1000)).toBe('1K');
        expect(formatNumber(5500)).toBe('5.5K');
    });

    it('formats millions', () => {
        expect(formatNumber(1000000)).toBe('1M');
    });

    it('returns number as is if less than 1000', () => {
        expect(formatNumber(999)).toBe('999');
    });
});

describe('debounce', () => {
    jest.useFakeTimers();

    it('delays function execution', () => {
        const mockFn = jest.fn();
        const debouncedFn = debounce(mockFn, 300);

        debouncedFn();
        expect(mockFn).not.toHaveBeenCalled();

        jest.advanceTimersByTime(300);
        expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('cancels previous calls', () => {
        const mockFn = jest.fn();
        const debouncedFn = debounce(mockFn, 300);

        debouncedFn();
        debouncedFn();
        debouncedFn();

        jest.advanceTimersByTime(300);
        expect(mockFn).toHaveBeenCalledTimes(1);
    });
});
