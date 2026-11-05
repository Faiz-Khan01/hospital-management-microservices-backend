import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AnimatedCounter from '../../components/common/AnimatedCounter';

describe('AnimatedCounter Component', () => {
  it('renders numeric value accurately', () => {
    render(<AnimatedCounter value={42} />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders prefix and suffix properly', () => {
    const { container } = render(<AnimatedCounter value={1500} prefix="₹" suffix=" / day" />);
    const el = container.querySelector('.hs-animated-counter');
    expect(el).toBeInTheDocument();
    expect(el.textContent).toContain('₹');
    expect(el.textContent).toContain('/ day');
  });

  it('handles null and undefined gracefully with fallback dash', () => {
    const { rerender } = render(<AnimatedCounter value={null} />);
    expect(screen.getByText('—')).toBeInTheDocument();

    rerender(<AnimatedCounter value={undefined} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders non-numeric status strings without crashing', () => {
    render(<AnimatedCounter value="Optimal" />);
    expect(screen.getByText('Optimal')).toBeInTheDocument();
  });

  it('formats decimals when decimals prop is specified', () => {
    render(<AnimatedCounter value={98.6} decimals={1} />);
    expect(screen.getByText(/98\.6/)).toBeInTheDocument();
  });

  it('applies custom className and styles', () => {
    const { container } = render(
      <AnimatedCounter value={100} className="custom-counter-class" style={{ color: 'red' }} />
    );
    const span = container.querySelector('.hs-animated-counter');
    expect(span).toHaveClass('custom-counter-class');
    expect(span.style.color).toBe('red');
  });
});
