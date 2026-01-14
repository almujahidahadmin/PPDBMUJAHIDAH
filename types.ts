export enum UserRole {
  ADMIN = 'ADMIN',
  STUDENT = 'STUDENT'
}

export enum ApplicationStatus {
  NEW = 'Baru',
  PENDING = 'Menunggu Verifikasi',
  ACCEPTED = 'Diterima',
  REVISION = 'Perlu Revisi',
  REJECTED = 'Ditolak'
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  password?: string; // Only for auth check logic
}

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'file' | 'textarea';
  required: boolean;
  placeholder?: string;
}

export interface StudentData {
  id: string;
  userId: string;
  fullName: string;
  submissionDate: string;
  status: ApplicationStatus;
  adminNote?: string;
  formData: Record<string, any>; // Keyed by FormField.id
}

export interface AppConfig {
  sheetUrl: string;
  registrationOpen: boolean;
  formFields: FormField[];
}