/**
 * Auth Component Tests
 * Tests for authentication-related components
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock component that simulates auth form behavior
const MockAuthForm = ({ onSubmit, type = 'signin' }) => {
    const [email, setEmail] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validate SIT email
        if (!email.endsWith('@sit.ac.in')) {
            setError('Please use your SIT email (@sit.ac.in)');
            return;
        }

        setLoading(true);
        try {
            await onSubmit?.(email);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} data-testid="auth-form">
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your SIT email"
                aria-label="email"
            />
            {error && <p role="alert">{error}</p>}
            <button type="submit" disabled={loading}>
                {loading ? 'Loading...' : type === 'signin' ? 'Sign In' : 'Sign Up'}
            </button>
        </form>
    );
};

// Import React for the mock component
import React from 'react';

describe('Auth Form Behavior', () => {
    it('renders sign in form', () => {
        render(<MockAuthForm type="signin" />);
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('renders sign up form', () => {
        render(<MockAuthForm type="signup" />);
        expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
    });

    it('shows error for non-SIT email', async () => {
        render(<MockAuthForm />);

        const emailInput = screen.getByLabelText(/email/i);
        await userEvent.type(emailInput, 'test@gmail.com');

        fireEvent.click(screen.getByRole('button'));

        expect(await screen.findByRole('alert')).toHaveTextContent(/SIT email/i);
    });

    it('accepts valid SIT email', async () => {
        const mockSubmit = jest.fn().mockResolvedValue(undefined);
        render(<MockAuthForm onSubmit={mockSubmit} />);

        const emailInput = screen.getByLabelText(/email/i);
        await userEvent.type(emailInput, '1si23cs117@sit.ac.in');

        fireEvent.click(screen.getByRole('button'));

        await waitFor(() => {
            expect(mockSubmit).toHaveBeenCalledWith('1si23cs117@sit.ac.in');
        });
    });

    it('shows loading state during submission', async () => {
        const mockSubmit = jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
        render(<MockAuthForm onSubmit={mockSubmit} />);

        const emailInput = screen.getByLabelText(/email/i);
        await userEvent.type(emailInput, 'test@sit.ac.in');

        fireEvent.click(screen.getByRole('button'));

        expect(screen.getByRole('button')).toHaveTextContent(/loading/i);
        expect(screen.getByRole('button')).toBeDisabled();
    });
});

describe('Email Validation', () => {
    const validateSITEmail = (email) => {
        if (!email) return false;
        return email.endsWith('@sit.ac.in');
    };

    it('accepts valid SIT emails', () => {
        expect(validateSITEmail('1si23cs117@sit.ac.in')).toBe(true);
        expect(validateSITEmail('faculty@sit.ac.in')).toBe(true);
        expect(validateSITEmail('admin@sit.ac.in')).toBe(true);
    });

    it('rejects non-SIT emails', () => {
        expect(validateSITEmail('test@gmail.com')).toBe(false);
        expect(validateSITEmail('user@yahoo.com')).toBe(false);
        expect(validateSITEmail('anyone@sit.com')).toBe(false);
    });

    it('handles edge cases', () => {
        expect(validateSITEmail('')).toBe(false);
        expect(validateSITEmail(null)).toBe(false);
        expect(validateSITEmail(undefined)).toBe(false);
    });
});

describe('OTP Input Validation', () => {
    const validateOTP = (otp) => {
        if (!otp) return false;
        return /^\d{6}$/.test(otp);
    };

    it('accepts valid 6-digit OTP', () => {
        expect(validateOTP('123456')).toBe(true);
        expect(validateOTP('000000')).toBe(true);
        expect(validateOTP('999999')).toBe(true);
    });

    it('rejects invalid OTPs', () => {
        expect(validateOTP('12345')).toBe(false);
        expect(validateOTP('1234567')).toBe(false);
        expect(validateOTP('abcdef')).toBe(false);
        expect(validateOTP('12345a')).toBe(false);
    });

    it('handles edge cases', () => {
        expect(validateOTP('')).toBe(false);
        expect(validateOTP(null)).toBe(false);
        expect(validateOTP(undefined)).toBe(false);
    });
});
