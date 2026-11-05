import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AnimatedTabs from '../../components/common/AnimatedTabs';

describe('AnimatedTabs Component', () => {
  const sampleTabs = [
    { id: 'overview', label: 'Overview', icon: 'bi-grid' },
    { id: 'analytics', label: 'Analytics', icon: 'bi-graph-up', count: 5 },
    { id: 'settings', label: 'Settings', icon: 'bi-gear' },
  ];

  it('renders all tab labels and counts', () => {
    render(<AnimatedTabs tabs={sampleTabs} activeTab="overview" onChange={() => {}} />);

    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('marks active tab with aria-selected="true" and tabIndex 0', () => {
    render(<AnimatedTabs tabs={sampleTabs} activeTab="analytics" onChange={() => {}} />);

    const activeTabButton = screen.getByRole('tab', { name: /analytics/i });
    const inactiveTabButton = screen.getByRole('tab', { name: /overview/i });

    expect(activeTabButton).toHaveAttribute('aria-selected', 'true');
    expect(activeTabButton).toHaveAttribute('tabindex', '0');
    expect(inactiveTabButton).toHaveAttribute('aria-selected', 'false');
    expect(inactiveTabButton).toHaveAttribute('tabindex', '-1');
  });

  it('calls onChange with clicked tab ID', () => {
    const handleChange = vi.fn();
    render(<AnimatedTabs tabs={sampleTabs} activeTab="overview" onChange={handleChange} />);

    fireEvent.click(screen.getByRole('tab', { name: /settings/i }));
    expect(handleChange).toHaveBeenCalledWith('settings');
  });

  it('supports keyboard navigation via ArrowRight and ArrowLeft', () => {
    const handleChange = vi.fn();
    render(<AnimatedTabs tabs={sampleTabs} activeTab="overview" onChange={handleChange} />);

    const firstTab = screen.getByRole('tab', { name: /overview/i });
    fireEvent.keyDown(firstTab, { key: 'ArrowRight' });
    expect(handleChange).toHaveBeenCalledWith('analytics');

    fireEvent.keyDown(firstTab, { key: 'ArrowLeft' });
    expect(handleChange).toHaveBeenCalledWith('settings'); // wraps around
  });
});
