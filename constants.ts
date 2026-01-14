import { AppConfig, FormField } from './types';

export const DEFAULT_FORM_FIELDS: FormField[] = [
  { id: 'nik', label: 'NIK Calon Siswa', type: 'number', required: true, placeholder: '16 digit NIK' },
  { id: 'fullName', label: 'Nama Lengkap', type: 'text', required: true, placeholder: 'Sesuai Ijazah' },
  { id: 'birthPlace', label: 'Tempat Lahir', type: 'text', required: true, placeholder: 'Kota Kelahiran' },
  { id: 'birthDate', label: 'Tanggal Lahir', type: 'date', required: true },
  { id: 'gender', label: 'Jenis Kelamin', type: 'text', required: true, placeholder: 'Laki-laki / Perempuan' },
  { id: 'address', label: 'Alamat Lengkap', type: 'textarea', required: true, placeholder: 'Jl. ...' },
  { id: 'fatherName', label: 'Nama Ayah', type: 'text', required: true },
  { id: 'motherName', label: 'Nama Ibu', type: 'text', required: true },
  { id: 'phone', label: 'Nomor WhatsApp', type: 'number', required: true, placeholder: '08...' },
  { id: 'kkFile', label: 'Scan Kartu Keluarga', type: 'file', required: true },
  { id: 'photoFile', label: 'Pas Foto (3x4)', type: 'file', required: true },
];

export const INITIAL_CONFIG: AppConfig = {
  sheetUrl: '',
  registrationOpen: true,
  formFields: DEFAULT_FORM_FIELDS,
};

export const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'password123' // Simple hardcoded admin for demo
};