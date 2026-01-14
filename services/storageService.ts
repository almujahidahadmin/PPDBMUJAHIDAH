import { User, StudentData, AppConfig, UserRole, ApplicationStatus } from '../types';
import { INITIAL_CONFIG, ADMIN_CREDENTIALS } from '../constants';

const KEYS = {
  USERS: 'ppdb_users',
  STUDENTS: 'ppdb_students',
  CONFIG: 'ppdb_config',
  CURRENT_USER: 'ppdb_current_user',
};

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- Auth Services ---

export const registerUser = async (fullName: string, username: string, password: string): Promise<User> => {
  await delay(500);
  const users = getStoredUsers();
  
  if (users.find(u => u.username === username)) {
    throw new Error('Username sudah digunakan');
  }

  const newUser: User = {
    id: Date.now().toString(),
    username,
    fullName,
    password,
    role: UserRole.STUDENT
  };

  users.push(newUser);
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  
  // Initialize empty student data record
  const students = getStoredStudents();
  students.push({
    id: Date.now().toString() + '_s',
    userId: newUser.id,
    fullName: newUser.fullName,
    submissionDate: new Date().toISOString(),
    status: ApplicationStatus.NEW,
    formData: {}
  });
  localStorage.setItem(KEYS.STUDENTS, JSON.stringify(students));

  return newUser;
};

export const loginUser = async (username: string, password: string): Promise<User> => {
  await delay(500);
  
  // Check Hardcoded Admin
  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    const adminUser: User = { id: 'admin', username: 'admin', fullName: 'Administrator', role: UserRole.ADMIN };
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(adminUser));
    return adminUser;
  }

  const users = getStoredUsers();
  const user = users.find(u => u.username === username && u.password === password);
  
  if (!user) {
    throw new Error('Username atau password salah');
  }

  localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
  return user;
};

export const logoutUser = () => {
  localStorage.removeItem(KEYS.CURRENT_USER);
};

export const getCurrentSession = (): User | null => {
  const stored = localStorage.getItem(KEYS.CURRENT_USER);
  return stored ? JSON.parse(stored) : null;
};

// --- Data Services ---

export const getAppConfig = (): AppConfig => {
  const stored = localStorage.getItem(KEYS.CONFIG);
  return stored ? JSON.parse(stored) : INITIAL_CONFIG;
};

export const updateAppConfig = async (config: AppConfig): Promise<void> => {
  await delay(300);
  localStorage.setItem(KEYS.CONFIG, JSON.stringify(config));
};

export const getStudentDataByUserId = async (userId: string): Promise<StudentData | undefined> => {
  await delay(300);
  const students = getStoredStudents();
  return students.find(s => s.userId === userId);
};

export const getAllStudents = async (): Promise<StudentData[]> => {
  await delay(300);
  return getStoredStudents();
};

export const updateStudentData = async (studentId: string, data: Partial<StudentData>): Promise<void> => {
  await delay(400);
  const students = getStoredStudents();
  const index = students.findIndex(s => s.id === studentId);
  
  if (index !== -1) {
    students[index] = { ...students[index], ...data };
    localStorage.setItem(KEYS.STUDENTS, JSON.stringify(students));
    
    // In a real app, here we would trigger the Google App Script API call
    // syncToGoogleSheets(students[index]);
  }
};

export const deleteStudent = async (studentId: string): Promise<void> => {
  await delay(400);
  let students = getStoredStudents();
  students = students.filter(s => s.id !== studentId);
  localStorage.setItem(KEYS.STUDENTS, JSON.stringify(students));
};

// --- Helpers ---

const getStoredUsers = (): User[] => {
  const stored = localStorage.getItem(KEYS.USERS);
  return stored ? JSON.parse(stored) : [];
};

const getStoredStudents = (): StudentData[] => {
  const stored = localStorage.getItem(KEYS.STUDENTS);
  return stored ? JSON.parse(stored) : [];
};