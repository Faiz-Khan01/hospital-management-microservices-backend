// Hospital Information Configuration Service
export function getHospitalName() {
  return localStorage.getItem('hospital_name') || 'HospitalSync Super Speciality Hospital';
}

export function setHospitalName(name) {
  if (name && typeof name === 'string') {
    localStorage.setItem('hospital_name', name.trim());
  }
}

// Cleans repeated prefixes like "Dr. Dr. Sharma" or "dr. dr. Sharma" -> "Dr. Sharma"
export function formatDoctorName(name) {
  if (!name || typeof name !== 'string') return 'Dr. Specialist';
  const cleaned = name.trim().replace(/^(dr\.?\s*)+/i, '').trim();
  return cleaned ? `Dr. ${cleaned}` : 'Dr. Specialist';
}
