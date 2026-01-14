import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Button, Input, Card, StatusBadge, TextArea, Select } from './components/UI';
import { User, UserRole, StudentData, ApplicationStatus, FormField, AppConfig } from './types';
import * as storageService from './services/storageService';
import { INITIAL_CONFIG } from './constants';

// --- Page Components ---

const LandingPage: React.FC<{ onNavigate: (page: 'landing' | 'login' | 'register') => void }> = ({ onNavigate }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center bg-white">
    <div className="bg-white p-4 rounded-full shadow-xl mb-8 border border-green-50 animate-bounce">
       <div className="w-24 h-24 bg-islamic-green rounded-full flex items-center justify-center">
          <span className="text-5xl text-gold-main font-bold">M</span>
       </div>
    </div>
    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
      Penerimaan Peserta Didik Baru
    </h1>
    <h2 className="text-2xl text-islamic-green font-medium mb-8">MIS Al Mujahidah</h2>
    <p className="max-w-2xl text-gray-600 mb-10 text-lg">
      Bergabunglah dengan kami untuk mewujudkan generasi yang cerdas, berakhlak mulia, dan berprestasi.
    </p>
    <div className="flex gap-4 flex-col sm:flex-row w-full sm:w-auto">
      <Button onClick={() => onNavigate('register')} className="w-full sm:w-auto text-lg py-3">
        Daftar Akun Baru
      </Button>
      <Button variant="outline" onClick={() => onNavigate('login')} className="w-full sm:w-auto text-lg py-3">
        Masuk
      </Button>
    </div>
  </div>
);

const AuthPage: React.FC<{ mode: 'login' | 'register', onSuccess: (user: User) => void, onLinkClick: () => void }> = ({ mode, onSuccess, onLinkClick }) => {
  const [formData, setFormData] = useState({ fullName: '', username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      let user;
      if (mode === 'login') {
        user = await storageService.loginUser(formData.username, formData.password);
      } else {
        if (!formData.fullName) throw new Error("Nama Lengkap wajib diisi");
        user = await storageService.registerUser(formData.fullName, formData.username, formData.password);
      }
      onSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <Card title={mode === 'login' ? 'Masuk ke Akun' : 'Daftar Akun Baru'}>
        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <Input 
              label="Nama Lengkap Siswa" 
              value={formData.fullName} 
              onChange={e => setFormData({...formData, fullName: e.target.value})}
              required
            />
          )}
          <Input 
            label="Username" 
            value={formData.username} 
            onChange={e => setFormData({...formData, username: e.target.value})}
            required
          />
          <Input 
            label="Password" 
            type="password" 
            value={formData.password} 
            onChange={e => setFormData({...formData, password: e.target.value})}
            required
          />
          
          {error && <div className="mb-4 text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>}
          
          <Button type="submit" className="w-full mb-4" isLoading={loading}>
            {mode === 'login' ? 'Masuk' : 'Daftar'}
          </Button>
          
          <div className="text-center text-sm text-gray-600">
            {mode === 'login' ? 'Belum punya akun? ' : 'Sudah punya akun? '}
            <button type="button" onClick={onLinkClick} className="text-islamic-green hover:underline font-medium">
              {mode === 'login' ? 'Daftar disini' : 'Masuk disini'}
            </button>
          </div>
        </form>
      </Card>
      {mode === 'login' && (
        <div className="mt-4 text-center text-xs text-gray-400">
          Demo Admin: admin / password123
        </div>
      )}
    </div>
  );
};

// --- Student Dashboard Component ---
const StudentDashboard: React.FC<{ user: User }> = ({ user }) => {
  const [student, setStudent] = useState<StudentData | null>(null);
  const [config, setConfig] = useState<AppConfig>(INITIAL_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    const loadData = async () => {
      const cfg = storageService.getAppConfig();
      setConfig(cfg);
      const data = await storageService.getStudentDataByUserId(user.id);
      if (data) {
        setStudent(data);
        setFormData(data.formData || {});
      }
      setLoading(false);
    };
    loadData();
  }, [user.id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldId: string) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran file maksimal 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setFormData(prev => ({ ...prev, [fieldId]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (submit: boolean = false) => {
    if (!student) return;
    
    if (submit) {
      for (const field of config.formFields) {
        if (field.required && !formData[field.id]) {
          alert(`Mohon isi kolom "${field.label}"`);
          return;
        }
      }
    }

    setSaving(true);
    try {
      const updates: Partial<StudentData> = {
        formData,
        status: submit ? ApplicationStatus.PENDING : student.status
      };
      await storageService.updateStudentData(student.id, updates);
      setStudent({ ...student, ...updates });
      alert(submit ? 'Data berhasil dikirim untuk verifikasi.' : 'Draft berhasil disimpan.');
    } catch (e) {
      alert('Gagal menyimpan data.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-10">Memuat data...</div>;

  const canEdit = student?.status === ApplicationStatus.NEW || student?.status === ApplicationStatus.REVISION;

  // Determine Status Card Style based on requirement
  // Kuning: "Data sedang diperiksa", Hijau: "Selamat! Anda Diterima", Merah: "Mohon Maaf, perbaiki data Anda"
  let statusBg = "bg-gray-100";
  let statusText = "Status Aplikasi";
  let statusMessage = "Silahkan lengkapi data";
  
  switch(student?.status) {
    case ApplicationStatus.PENDING:
      statusBg = "bg-yellow-400 text-yellow-900";
      statusText = "Data sedang diperiksa";
      statusMessage = "Mohon menunggu verifikasi admin";
      break;
    case ApplicationStatus.ACCEPTED:
      statusBg = "bg-green-600 text-white";
      statusText = "Selamat! Anda Diterima";
      statusMessage = "Silahkan cetak bukti pendaftaran";
      break;
    case ApplicationStatus.REJECTED:
    case ApplicationStatus.REVISION:
      statusBg = "bg-red-500 text-white";
      statusText = student.status === ApplicationStatus.REVISION ? "Mohon Maaf, perbaiki data Anda" : "Pendaftaran Ditolak";
      statusMessage = student.adminNote || "Silahkan cek catatan admin";
      break;
    default:
      statusBg = "bg-islamic-green text-white";
      statusText = "Pendaftaran Baru";
      statusMessage = "Silahkan lengkapi formulir di bawah";
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Requirement: Header Status Card */}
      <div className={`rounded-xl shadow-md p-6 ${statusBg} transition-colors duration-300`}>
        <h2 className="text-2xl font-bold">{statusText}</h2>
        <p className="opacity-90 mt-1">{statusMessage}</p>
        {student?.adminNote && student.status !== ApplicationStatus.ACCEPTED && (
          <div className="mt-4 bg-white/20 p-3 rounded text-sm backdrop-blur-sm">
            <strong>Catatan Admin:</strong> {student.adminNote}
          </div>
        )}
      </div>

      {/* Form Card */}
      <Card title="Formulir Pendaftaran">
        {!canEdit && (
          <div className="bg-blue-50 text-blue-800 p-4 rounded-lg mb-6 text-sm border border-blue-100">
            Formulir sedang dalam tahap verifikasi atau sudah final. Anda hanya dapat melihat data.
          </div>
        )}

        <div className="space-y-4">
          {config.formFields.map(field => (
            <div key={field.id}>
              {field.type === 'file' ? (
                 <div className="mb-4">
                   <label className="block text-sm font-medium text-gray-700 mb-1">
                     {field.label} {field.required && <span className="text-red-500">*</span>}
                   </label>
                   {canEdit ? (
                     <div className="flex gap-4 items-center">
                       <input 
                         type="file" 
                         accept="image/*,application/pdf"
                         onChange={(e) => handleFileChange(e, field.id)}
                         className="block w-full text-sm text-gray-500
                           file:mr-4 file:py-2 file:px-4
                           file:rounded-md file:border-0
                           file:text-sm file:font-semibold
                           file:bg-green-50 file:text-islamic-green
                           hover:file:bg-green-100"
                       />
                     </div>
                   ) : null}
                   {formData[field.id] ? (
                     <div className="mt-2 text-sm text-green-700 flex items-center gap-2">
                       ✅ File terunggah 
                       {canEdit && <span className="text-gray-400 text-xs">(Upload ulang untuk mengganti)</span>}
                     </div>
                   ) : (
                     <div className="mt-1 text-xs text-gray-500">Belum ada file</div>
                   )}
                 </div>
              ) : field.type === 'textarea' ? (
                <TextArea
                  label={field.label + (field.required ? ' *' : '')}
                  value={formData[field.id] || ''}
                  onChange={e => setFormData({ ...formData, [field.id]: e.target.value })}
                  disabled={!canEdit}
                  placeholder={field.placeholder}
                  required={field.required}
                />
              ) : (
                <Input
                  type={field.type}
                  label={field.label + (field.required ? ' *' : '')}
                  value={formData[field.id] || ''}
                  onChange={e => setFormData({ ...formData, [field.id]: e.target.value })}
                  disabled={!canEdit}
                  placeholder={field.placeholder}
                  required={field.required}
                />
              )}
            </div>
          ))}
        </div>

        {canEdit && (
          <div className="mt-8 flex gap-3 pt-4 border-t border-gray-100">
            <Button variant="secondary" onClick={() => handleSave(false)} isLoading={saving}>
              Simpan Draft
            </Button>
            {/* Requirement: Tombol Kirim Pendaftaran berwarna Hijau Tua dengan teks Kuning */}
            <Button variant="primary" onClick={() => handleSave(true)} isLoading={saving} className="flex-grow">
              Kirim Pendaftaran
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

// --- Admin Dashboard Component ---
const AdminDashboard: React.FC = () => {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [config, setConfig] = useState<AppConfig>(INITIAL_CONFIG);
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);
  
  // Sidebar State
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [note, setNote] = useState('');
  
  // Settings State
  const [newField, setNewField] = useState<Partial<FormField>>({ type: 'text', required: true });

  // Initial Data Load
  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    setConfig(storageService.getAppConfig());
    const data = await storageService.getAllStudents();
    setStudents(data);
  };

  const handleUpdateStatus = async (status: ApplicationStatus) => {
    if (!selectedStudent) return;
    await storageService.updateStudentData(selectedStudent.id, {
      status,
      adminNote: note
    });
    alert(`Status siswa diperbarui ke: ${status}\nData disinkronkan ke Google Sheets.`);
    
    setStudents(prev => prev.map(s => s.id === selectedStudent.id ? { ...s, status, adminNote: note } : s));
    setSelectedStudent(null);
    setNote('');
  };

  const handleDeleteStudent = async (studentId: string) => {
    if(confirm('Apakah Anda yakin ingin menghapus data siswa ini?')) {
        await storageService.deleteStudent(studentId);
        setStudents(prev => prev.filter(s => s.id !== studentId));
    }
  }

  const handleSettingsSave = async (newConfig: AppConfig) => {
    await storageService.updateAppConfig(newConfig);
    setConfig(newConfig);
    alert('Pengaturan disimpan & Kolom Google Sheet diperbarui.');
  };

  const addField = () => {
    if (!newField.label) return alert("Label harus diisi");
    const id = newField.label.toLowerCase().replace(/\s+/g, '') + Date.now().toString().slice(-4);
    const field: FormField = {
      id,
      label: newField.label,
      type: newField.type as any,
      required: newField.required || false,
      placeholder: newField.placeholder
    };
    setConfig(prev => ({ ...prev, formFields: [...prev.formFields, field] }));
    setNewField({ type: 'text', required: true, label: '', placeholder: '' });
  };

  const removeField = (id: string) => {
    if (confirm("Hapus kolom ini? Data terkait di pendaftar mungkin tidak akan tampil.")) {
      setConfig(prev => ({ ...prev, formFields: prev.formFields.filter(f => f.id !== id) }));
    }
  };

  // Render Sub-views based on activeMenu

  // 1. Settings View
  if (activeMenu === 'settings') {
    return (
      <div className="max-w-4xl mx-auto animate-fadeIn">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Pengaturan Database</h2>
        <div className="grid grid-cols-1 gap-6">
          <Card title="Koneksi Google Sheets">
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-4 text-sm text-yellow-800">
              <strong>Info:</strong> Tempelkan link ID Google Sheet Anda di bawah ini untuk sinkronisasi data otomatis.
            </div>
            <Input 
              label="Link ID Google Sheet (Paste Disini)" 
              value={config.sheetUrl} 
              onChange={(e) => setConfig({...config, sheetUrl: e.target.value})}
              placeholder="Contoh: 1BxiMVs0XRA5nFMdKvBdBkJ..."
            />
             <div className="mb-4">
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={config.registrationOpen}
                  onChange={e => setConfig({...config, registrationOpen: e.target.checked})}
                  className="w-5 h-5 text-islamic-green rounded focus:ring-islamic-green"
                />
                <span className="font-medium text-gray-700">Buka Pendaftaran</span>
              </label>
            </div>
          </Card>

          <Card title="Manajemen Formulir (Kolom Data)">
             <div className="space-y-3 mb-6">
               {config.formFields.map((field, idx) => (
                 <div key={field.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
                    <div>
                      <span className="font-medium">{field.label}</span>
                      <span className="text-xs text-gray-500 ml-2">({field.type})</span>
                      {field.required && <span className="text-xs text-red-500 ml-2">Required</span>}
                    </div>
                    <Button variant="ghost" onClick={() => removeField(field.id)} className="text-red-500 !p-1 h-8 w-8">
                       🗑️
                    </Button>
                 </div>
               ))}
             </div>

             <div className="flex flex-col md:flex-row gap-3 items-end border-t border-gray-100 pt-4">
                <div className="flex-grow w-full">
                  <Input 
                     label="Label Kolom Baru"
                     value={newField.label || ''}
                     onChange={e => setNewField({...newField, label: e.target.value})}
                     className="!mb-0"
                  />
                </div>
                <div className="w-full md:w-40">
                  <Select 
                     label="Tipe Data"
                     value={newField.type}
                     onChange={e => setNewField({...newField, type: e.target.value as any})}
                     options={[
                       { label: 'Teks Singkat', value: 'text' },
                       { label: 'Angka', value: 'number' },
                       { label: 'Tanggal', value: 'date' },
                       { label: 'Teks Panjang', value: 'textarea' },
                       { label: 'Upload File', value: 'file' },
                     ]}
                     className="!mb-0"
                  />
                </div>
                <div className="w-full md:w-auto pb-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={newField.required}
                      onChange={e => setNewField({...newField, required: e.target.checked})}
                      className="w-4 h-4 text-islamic-green rounded"
                    />
                    <span className="text-sm font-medium">Wajib</span>
                  </label>
                </div>
                <Button onClick={addField} variant="secondary" className="mb-[2px]">Tambah</Button>
             </div>
          </Card>
          
          <Button onClick={() => handleSettingsSave(config)} className="w-full py-3 text-lg">Simpan Semua Pengaturan</Button>
        </div>
      </div>
    );
  }

  // 2. Detail View (Overlay)
  if (selectedStudent) {
    return (
      <div className="max-w-4xl mx-auto animate-fadeIn">
        <Button variant="outline" onClick={() => setSelectedStudent(null)} className="mb-4">← Kembali ke Daftar</Button>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card title={`Biodata: ${selectedStudent.fullName}`}>
              <div className="grid grid-cols-1 gap-4">
                 {config.formFields.map(field => (
                   <div key={field.id} className="pb-4 border-b border-gray-100 last:border-0">
                     <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1">{field.label}</label>
                     {field.type === 'file' ? (
                       <div className="mt-2">
                         {selectedStudent.formData[field.id] ? (
                           selectedStudent.formData[field.id].startsWith('data:image') ? (
                             <div className="border border-gray-200 rounded p-2 inline-block">
                               <img 
                                 src={selectedStudent.formData[field.id]} 
                                 alt={field.label} 
                                 className="max-h-48 object-contain rounded" 
                               />
                               <a 
                                 href={selectedStudent.formData[field.id]} 
                                 download={`dokumen_${field.id}.png`}
                                 className="block text-center text-xs text-islamic-green mt-2 hover:underline"
                               >
                                 Download Gambar
                               </a>
                             </div>
                           ) : (
                             <a 
                               href={selectedStudent.formData[field.id]} 
                               target="_blank" 
                               rel="noreferrer"
                               className="inline-flex items-center gap-2 text-islamic-green hover:underline font-medium p-2 bg-green-50 rounded"
                             >
                               📄 Buka Dokumen ({field.label})
                             </a>
                           )
                         ) : (
                           <span className="text-red-500 text-sm italic">File belum diupload</span>
                         )}
                       </div>
                     ) : (
                       <p className="font-medium text-gray-900 whitespace-pre-wrap">
                         {selectedStudent.formData[field.id] || '-'}
                       </p>
                     )}
                   </div>
                 ))}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
             <Card title="Verifikasi & Tindakan">
                <div className="mb-6 bg-gray-50 p-4 rounded border border-gray-100">
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Status Saat Ini</label>
                  <StatusBadge status={selectedStudent.status} />
                </div>
                
                <div className="mb-4">
                  <TextArea 
                    label="Catatan Admin (Wajib untuk Revisi/Tolak)" 
                    value={note} 
                    onChange={e => setNote(e.target.value)}
                    placeholder="Contoh: Foto kurang jelas, mohon upload ulang..."
                    className="h-32"
                  />
                </div>
                
                <div className="space-y-3">
                  <Button className="w-full justify-start !bg-green-600 hover:!bg-green-700" onClick={() => handleUpdateStatus(ApplicationStatus.ACCEPTED)}>
                    ✅ Terima Siswa
                  </Button>
                  <Button variant="secondary" className="w-full justify-start !bg-orange-100 hover:!bg-orange-200 !text-orange-800" onClick={() => handleUpdateStatus(ApplicationStatus.REVISION)}>
                    ✏️ Minta Revisi
                  </Button>
                  <Button variant="danger" className="w-full justify-start" onClick={() => handleUpdateStatus(ApplicationStatus.REJECTED)}>
                    ❌ Tolak Pendaftaran
                  </Button>
                </div>
             </Card>
          </div>
        </div>
      </div>
    );
  }

  // 3. Reports View
  if (activeMenu === 'reports') {
      return (
          <div className="max-w-4xl mx-auto animate-fadeIn">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Laporan & Statistik</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-gray-500 text-sm font-medium uppercase">Total Pendaftar</h3>
                    <p className="text-4xl font-bold text-gray-800 mt-2">{students.length}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-gray-500 text-sm font-medium uppercase">Diterima</h3>
                    <p className="text-4xl font-bold text-green-600 mt-2">{students.filter(s => s.status === ApplicationStatus.ACCEPTED).length}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-gray-500 text-sm font-medium uppercase">Perlu Revisi</h3>
                    <p className="text-4xl font-bold text-orange-500 mt-2">{students.filter(s => s.status === ApplicationStatus.REVISION).length}</p>
                </div>
              </div>
              <Card title="Export Data">
                  <p className="text-gray-600 mb-4">Unduh data rekapitulasi pendaftaran dalam format Spreadsheet.</p>
                  <Button variant="primary">Download Excel (.xlsx)</Button>
              </Card>
          </div>
      )
  }

  // 4. Default / Dashboard View / Data List
  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
            {activeMenu === 'dashboard' ? 'Dashboard Overview' : 'Data Pendaftar'}
        </h1>
        {activeMenu === 'data' && (
            <div className="flex gap-2">
                 <Button variant="outline">Filter</Button>
                 <Button variant="primary">+ Tambah Manual</Button>
            </div>
        )}
      </div>

      <Card className="overflow-hidden p-0 border border-gray-200 shadow-sm">
        <div className="overflow-x-auto">
          {/* Requirement: Main Table with Zebra Striping (even:bg-gray-50) */}
          <table className="w-full text-left border-collapse">
            <thead className="bg-white border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Nama Siswa</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Tanggal Daftar</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Belum ada data pendaftar.</td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="even:bg-gray-50 hover:bg-green-50/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{student.fullName}</td>
                    <td className="px-6 py-4 text-gray-500 text-sm">{new Date(student.submissionDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={student.status} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center items-center gap-2">
                        {/* Requirement: Tombol Edit (Ikon Pensil Kuning) */}
                        <Button 
                            variant="icon-yellow"
                            onClick={() => {
                                setSelectedStudent(student);
                                setNote(student.adminNote || '');
                            }}
                            title="Edit / Verifikasi"
                        >
                            ✏️
                        </Button>
                        
                        {/* Requirement: Tombol Hapus (Ikon Sampah Merah) */}
                        <Button 
                            variant="icon-red"
                            onClick={() => handleDeleteStudent(student.id)}
                            title="Hapus Data"
                        >
                            🗑️
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

// --- Main App Component ---

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [page, setPage] = useState<'landing' | 'login' | 'register'>('landing');
  const [activeAdminMenu, setActiveAdminMenu] = useState('dashboard');

  useEffect(() => {
    const session = storageService.getCurrentSession();
    if (session) setUser(session);
  }, []);

  const handleLogout = () => {
    storageService.logoutUser();
    setUser(null);
    setPage('landing');
  };

  if (user) {
    return (
      <Layout 
        user={user} 
        onLogout={handleLogout}
        activeMenu={activeAdminMenu}
        onMenuClick={setActiveAdminMenu}
      >
        {user.role === UserRole.ADMIN ? (
          <AdminDashboard />
        ) : (
          <StudentDashboard user={user} />
        )}
      </Layout>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="p-4 flex justify-between items-center max-w-7xl mx-auto">
        <div className="font-bold text-xl text-islamic-green">PPDB MIS Al Mujahidah</div>
      </nav>
      <main className="px-4">
        {page === 'landing' && <LandingPage onNavigate={setPage} />}
        {page === 'login' && (
          <AuthPage 
            mode="login" 
            onSuccess={setUser} 
            onLinkClick={() => setPage('register')} 
          />
        )}
        {page === 'register' && (
          <AuthPage 
            mode="register" 
            onSuccess={setUser} 
            onLinkClick={() => setPage('login')} 
          />
        )}
      </main>
    </div>
  );
};

export default App;