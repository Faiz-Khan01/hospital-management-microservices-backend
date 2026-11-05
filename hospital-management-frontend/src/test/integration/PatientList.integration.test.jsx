import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PatientList from '../../components/patients/PatientList';

const mockPatients = [
  {
    id: 1,
    name: 'Aarav Patel',
    age: 45,
    gender: 'Male',
    bloodGroup: 'B +ve',
    contactNumber: '+91 98765 43210',
    disease: 'Hypertension Stage II',
    status: 'Admitted',
    address: 'Andheri West, Mumbai',
  },
  {
    id: 2,
    name: 'Diya Sen',
    age: 29,
    gender: 'Female',
    bloodGroup: 'O +ve',
    contactNumber: '+91 98112 33445',
    disease: 'Viral Pharyngitis',
    status: 'Outpatient',
    address: 'Salt Lake, Kolkata',
  },
  {
    id: 3,
    name: 'Kabir Mehta',
    age: 62,
    gender: 'Male',
    bloodGroup: 'AB +ve',
    contactNumber: '+91 99221 88990',
    disease: 'Coronary Artery Disease',
    status: 'Discharged',
    address: 'Koregaon Park, Pune',
  },
];

describe('PatientList Integration Suite', () => {
  it('renders patient registry metrics and patient cards', () => {
    render(<PatientList patients={mockPatients} />);

    expect(screen.getByText('Aarav Patel')).toBeInTheDocument();
    expect(screen.getByText('Diya Sen')).toBeInTheDocument();
    expect(screen.getByText('Kabir Mehta')).toBeInTheDocument();

    // Check disease diagnostics
    expect(screen.getByText(/Hypertension Stage II/i)).toBeInTheDocument();
    expect(screen.getByText(/Viral Pharyngitis/i)).toBeInTheDocument();
  });

  it('filters patients interactively via search input', async () => {
    render(<PatientList patients={mockPatients} />);

    const searchInput = screen.getByPlaceholderText(/search name, patient id, or diagnosis/i);
    fireEvent.change(searchInput, { target: { value: 'Diya' } });

    expect(screen.getByText('Diya Sen')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByText('Aarav Patel')).not.toBeInTheDocument();
      expect(screen.queryByText('Kabir Mehta')).not.toBeInTheDocument();
    });
  });

  it('filters patients by clinical status', async () => {
    render(<PatientList patients={mockPatients} />);

    const statusSelect = screen.getByDisplayValue(/all patient status/i);
    fireEvent.change(statusSelect, { target: { value: 'Outpatient' } });

    expect(screen.getByText('Diya Sen')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByText('Kabir Mehta')).not.toBeInTheDocument();
    });
  });

  it('displays empty state message when search yields no match', async () => {
    render(<PatientList patients={mockPatients} />);

    const searchInput = screen.getByPlaceholderText(/search name, patient id, or diagnosis/i);
    fireEvent.change(searchInput, { target: { value: 'Nonexistent Patient XYZ' } });

    await waitFor(() => {
      expect(screen.getByText(/no patient records found/i)).toBeInTheDocument();
    });
  });
});
