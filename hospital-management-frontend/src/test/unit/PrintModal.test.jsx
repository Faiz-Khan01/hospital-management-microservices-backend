import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PrintModal from '../../components/common/PrintModal';

describe('PrintModal Component', () => {
  it('renders modal with title and children when show=true', () => {
    render(
      <PrintModal show={true} title="Discharge Summary Preview" onClose={() => {}}>
        <div data-testid="print-content">Patient Medical Discharge Data</div>
      </PrintModal>
    );

    expect(screen.getByText(/Discharge Summary Preview/)).toBeInTheDocument();
    expect(screen.getByTestId('print-content')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /print \/ download pdf/i })).toBeInTheDocument();
  });

  it('calls onClose when close buttons are clicked', () => {
    const handleClose = vi.fn();
    render(
      <PrintModal show={true} title="Test Modal" onClose={handleClose}>
        <div>Content</div>
      </PrintModal>
    );

    fireEvent.click(screen.getByRole('button', { name: /close preview/i }));
    expect(handleClose).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByLabelText('Close'));
    expect(handleClose).toHaveBeenCalledTimes(2);
  });

  it('calls onClose when Escape key is pressed', () => {
    const handleClose = vi.fn();
    render(
      <PrintModal show={true} title="Test Modal" onClose={handleClose}>
        <div>Content</div>
      </PrintModal>
    );

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('triggers window.print when print button is clicked', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});

    render(
      <PrintModal show={true} title="Test Modal" onClose={() => {}}>
        <div>Content</div>
      </PrintModal>
    );

    fireEvent.click(screen.getByRole('button', { name: /print \/ download pdf/i }));
    expect(printSpy).toHaveBeenCalled();

    printSpy.mockRestore();
  });
});
