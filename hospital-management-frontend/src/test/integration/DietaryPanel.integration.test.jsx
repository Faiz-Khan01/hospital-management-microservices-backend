import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DietaryPanel from '../../components/dietary/DietaryPanel';
import PatientService from '../../services/PatientService';
import BedService from '../../services/BedService';

describe('Dietary & Nutrition Desk Integration Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(PatientService, 'getAllPatients').mockResolvedValue({
      data: [
        { id: 1, name: 'Rahul Sharma', firstName: 'Rahul', lastName: 'Sharma', uhid: 'UHID-101', age: 42, gender: 'Male' },
      ],
    });
    vi.spyOn(BedService, 'getAllBeds').mockResolvedValue({
      data: [{ id: 1, bedNumber: 'GW-101', ward: 'General Medicine Ward A' }],
    });
  });

  it('renders dietary desk hero and metric counters', async () => {
    render(<DietaryPanel />);

    expect(
      screen.getByText(/Hospital Dietary, Nutrition & Patient Food Management Desk/i)
    ).toBeInTheDocument();

    expect(screen.getByText(/Total Inpatient Meals/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Kitchen Preparing/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Trolley Dispatched/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Delivered to Bed/i).length).toBeGreaterThan(0);
  });

  it('filters meal orders by status using premium tabs', async () => {
    render(<DietaryPanel />);

    expect(screen.getByText('Rahul Sharma')).toBeInTheDocument();
    expect(screen.getByText('Anita Verma')).toBeInTheDocument();

    // Click Preparing tab
    const preparingTab = screen.getByRole('button', { name: /preparing/i });
    fireEvent.click(preparingTab);

    // Vikram Malhotra is KITCHEN_PREPARING
    expect(screen.getByText('Vikram Malhotra')).toBeInTheDocument();
    // Delivered patient Rahul Sharma should be filtered out
    await waitFor(() => {
      expect(screen.queryByText('Rahul Sharma')).not.toBeInTheDocument();
    });
  });

  it('progresses order status when status action button is clicked', async () => {
    render(<DietaryPanel />);

    // Click All tab to see all orders
    const allTab = screen.getByRole('button', { name: /^all/i });
    fireEvent.click(allTab);

    // Anita Verma is TROLLEY_DISPATCHED, has 'Mark Delivered' button
    const markDeliveredBtns = screen.getAllByRole('button', { name: /mark delivered/i });
    fireEvent.click(markDeliveredBtns[0]);

    // Status should now be updated to DELIVERED_TO_PATIENT
    await waitFor(() => {
      expect(screen.getAllByText('DELIVERED TO PATIENT').length).toBeGreaterThan(0);
    });
  });

  it('opens Prescribe Diet Order modal and handles cancellation', () => {
    render(<DietaryPanel />);

    const openModalBtn = screen.getByRole('button', { name: /prescribe diet order/i });
    fireEvent.click(openModalBtn);

    expect(
      screen.getByText(/Prescribe Clinical Therapeutic Diet Order/i)
    ).toBeInTheDocument();

    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelBtn);

    expect(
      screen.queryByText(/Prescribe Clinical Therapeutic Diet Order/i)
    ).not.toBeInTheDocument();
  });
});
