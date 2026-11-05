import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MedicalRecordPanel from '../../components/medicalrecords/MedicalRecordPanel';
import MedicalRecordService from '../../services/MedicalRecordService';

const mockPatients = [
  {
    id: 1,
    name: 'John Doe',
    age: 34,
    gender: 'Male',
    bloodGroup: 'B +ve',
    phone: '+91 98765-43210',
    email: 'john.doe@gmail.com',
    allergies: 'Penicillin, Dust Mites',
  },
  {
    id: 2,
    name: 'Priya Sharma',
    age: 28,
    gender: 'Female',
    bloodGroup: 'O +ve',
    phone: '+91 98112-33445',
    email: 'priya.sharma@yahoo.com',
    allergies: 'Sulfa Drugs',
  },
];

const mockRecords = [
  {
    id: 101,
    patientId: 1,
    doctorId: 1,
    recordType: 'OPD',
    diagnosis: 'Acute Upper Respiratory Tract Infection',
    treatment: 'Amoxicillin 625mg + Paracetamol',
    notes: 'Patient presented with 3-day history of sore throat and fever.',
    visitDate: '2026-10-27',
  },
];

describe('MedicalRecordPanel (Patient 360° Dossier) Integration Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(MedicalRecordService, 'getAllRecords').mockResolvedValue({
      data: mockRecords,
    });
  });

  it('renders EHR hero banner and metric counters', async () => {
    render(<MedicalRecordPanel patients={mockPatients} />);

    expect(
      screen.getByText(/Patient 360° Health Record, EHR & Clinical Timeline/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Total EHR Records/i)).toBeInTheDocument();
    expect(screen.getByText(/OPD Encounters/i)).toBeInTheDocument();
  });

  it('renders Patient 360° dossier with vitals matrix and demographics', () => {
    render(<MedicalRecordPanel patients={mockPatients} />);

    // Selected patient name and blood group
    expect(screen.getByRole('heading', { name: 'John Doe' })).toBeInTheDocument();
    expect(screen.getByText(/MRN-2026-PT1/i)).toBeInTheDocument();
    expect(screen.getByText(/Penicillin, Dust Mites/i)).toBeInTheDocument();

    // Vitals
    expect(screen.getByText('122/80')).toBeInTheDocument();
    expect(screen.getByText('76 bpm')).toBeInTheDocument();
    expect(screen.getByText('99%')).toBeInTheDocument();
    expect(screen.getByText('98.4 °F')).toBeInTheDocument();
  });

  it('switches between Patient Dossier and Records Ledger tabs', async () => {
    render(<MedicalRecordPanel patients={mockPatients} />);

    // Click Records Ledger tab
    const ledgerTab = screen.getByRole('button', { name: /records ledger/i });
    fireEvent.click(ledgerTab);

    // Should display records table header
    await waitFor(() => {
      expect(screen.getByText('Diagnosis')).toBeInTheDocument();
      expect(screen.getByText('Treatment Plan')).toBeInTheDocument();
    });

    // Switch back to Dossier
    const dossierTab = screen.getByRole('button', { name: /patient 360° dossier/i });
    fireEvent.click(dossierTab);

    await waitFor(() => {
      expect(screen.getByText(/Clinical Journey/i)).toBeInTheDocument();
    });
  });

  it('filters timeline milestones using category buttons', () => {
    render(<MedicalRecordPanel patients={mockPatients} />);

    // Click OPD Visits filter
    const opdFilterBtn = screen.getByRole('button', { name: /opd visits/i });
    fireEvent.click(opdFilterBtn);

    expect(screen.getByRole('button', { name: /opd visits/i })).toHaveClass('active');
  });

  it('switches active patient via dropdown', () => {
    render(<MedicalRecordPanel patients={mockPatients} />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '2' } });

    expect(screen.getByRole('heading', { name: 'Priya Sharma' })).toBeInTheDocument();
    expect(screen.getByText(/MRN-2026-PT2/i)).toBeInTheDocument();
  });
});
