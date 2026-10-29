import apiClient from './apiClient';

const BASE_URL = "/appointments";

class AppointmentService {
  async getAllAppointments() {
    const response = await apiClient.get(BASE_URL);
    const list = Array.isArray(response.data) ? response.data : [];

    const normalized = list.map(item => ({
      id: item.appointmentId || item.id,
      patientId: item.patient?.id || item.patientId,
      patientName: item.patient?.name || item.patientName || 'Unknown Patient',
      patient: item.patient,
      doctorId: item.doctor?.id || item.doctorId,
      doctorName: item.doctor?.name
        ? `Dr. ${item.doctor.name.replace(/^(Dr\.?\s*)+/i, '')}`
        : item.doctorName || 'General Specialist',
      doctor: item.doctor,
      date: item.appointmentDate ? item.appointmentDate.split('T')[0] : (item.date || ''),
      time: item.time || '',
      reason: item.reason || '',
      status: this._normalizeStatus(item.status)
    }));

    return { data: normalized };
  }

  _normalizeStatus(raw) {
    if (!raw) return 'Scheduled';
    const s = String(raw).toUpperCase();
    if (s.includes('PROGRESS')) return 'In Progress';
    if (s.includes('COMPLET')) return 'Completed';
    if (s.includes('CANCEL')) return 'Cancelled';
    return 'Scheduled';
  }

  async bookAppointment(appointmentData) {
    const payload = {
      patientId: appointmentData.patientId,
      doctorId: appointmentData.doctorId,
      appointmentDate: appointmentData.date,
      time: appointmentData.time,
      reason: appointmentData.reason,
      status: 'SCHEDULED'
    };
    const response = await apiClient.post(BASE_URL, payload);
    return response;
  }

  async updateAppointmentStatus(id, newStatus) {
    const response = await apiClient.put(`${BASE_URL}/${id}/status`, {
      status: newStatus.toUpperCase().replace(/ /g, '_')
    });
    return response;
  }

  async deleteAppointment(id) {
    const response = await apiClient.delete(`${BASE_URL}/${id}`);
    return response;
  }
}

export default new AppointmentService();