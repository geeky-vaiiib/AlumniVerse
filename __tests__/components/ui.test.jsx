/**
 * UI Component Unit Tests
 * Tests for common UI components (Button, Card, etc.)
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

describe('Button Component', () => {
    it('renders with default variant', () => {
        render(<Button>Click me</Button>);
        const button = screen.getByRole('button', { name: /click me/i });
        expect(button).toBeInTheDocument();
    });

    it('renders with different variants', () => {
        const { rerender } = render(<Button variant="outline">Outline</Button>);
        expect(screen.getByRole('button')).toBeInTheDocument();

        rerender(<Button variant="secondary">Secondary</Button>);
        expect(screen.getByRole('button')).toBeInTheDocument();

        rerender(<Button variant="ghost">Ghost</Button>);
        expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('handles click events', () => {
        const handleClick = jest.fn();
        render(<Button onClick={handleClick}>Click me</Button>);

        fireEvent.click(screen.getByRole('button'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('can be disabled', () => {
        const handleClick = jest.fn();
        render(<Button disabled onClick={handleClick}>Disabled</Button>);

        const button = screen.getByRole('button');
        expect(button).toBeDisabled();

        fireEvent.click(button);
        expect(handleClick).not.toHaveBeenCalled();
    });

    it('renders with different sizes', () => {
        const { rerender } = render(<Button size="sm">Small</Button>);
        expect(screen.getByRole('button')).toBeInTheDocument();

        rerender(<Button size="lg">Large</Button>);
        expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('supports asChild prop', () => {
        render(
            <Button asChild>
                <a href="/test">Link Button</a>
            </Button>
        );
        expect(screen.getByRole('link', { name: /link button/i })).toBeInTheDocument();
    });
});

describe('Card Component', () => {
    it('renders basic card', () => {
        render(
            <Card>
                <CardContent>
                    <p>Card content</p>
                </CardContent>
            </Card>
        );
        expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('renders card with header', () => {
        render(
            <Card>
                <CardHeader>
                    <CardTitle>Card Title</CardTitle>
                    <CardDescription>Card description</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Content</p>
                </CardContent>
            </Card>
        );

        expect(screen.getByText('Card Title')).toBeInTheDocument();
        expect(screen.getByText('Card description')).toBeInTheDocument();
        expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('accepts custom className', () => {
        render(
            <Card className="custom-class" data-testid="custom-card">
                <CardContent>Content</CardContent>
            </Card>
        );

        expect(screen.getByTestId('custom-card')).toHaveClass('custom-class');
    });
});
