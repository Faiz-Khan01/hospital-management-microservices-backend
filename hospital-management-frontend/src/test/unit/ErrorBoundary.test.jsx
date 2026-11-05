import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from '../../components/common/ErrorBoundary';

function BrokenComponent({ shouldThrow }) {
  if (shouldThrow) {
    throw new Error('Simulation of catastrophic runtime failure');
  }
  return <div>Healthy Content Rendered</div>;
}

describe('ErrorBoundary Component', () => {
  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Healthy Content Rendered')).toBeInTheDocument();
  });

  it('catches render errors and displays fallback recovery UI', () => {
    // Suppress console.error in test output for intentional throw
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <BrokenComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong in this module')).toBeInTheDocument();
    expect(
      screen.getByText('Simulation of catastrophic runtime failure')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();

    consoleErrorSpy.mockRestore();
  });

  it('triggers onReset callback when Try Again button is clicked', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const handleReset = vi.fn();

    render(
      <ErrorBoundary onReset={handleReset}>
        <BrokenComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(handleReset).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });
});
