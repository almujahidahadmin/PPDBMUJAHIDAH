import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'icon-yellow' | 'icon-red';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, variant = 'primary', className = '', isLoading, disabled, ...props 
}) => {
  const baseStyles = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2";
  
  const variants = {
    // Requirements: "Tombol 'Kirim Pendaftaran' berwarna Hijau Tua dengan teks Kuning."
    primary: "bg-islamic-dark text-gold-main hover:brightness-110 shadow-md", 
    secondary: "bg-gold-main text-islamic-dark hover:bg-gold-dark",
    outline: "border border-islamic-green text-islamic-green hover:bg-green-50",
    danger: "bg-red-600 text-white hover:bg-red-700",
    ghost: "text-gray-600 hover:bg-gray-100",
    // Special action buttons for Admin Table
    'icon-yellow': "p-2 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 rounded-md",
    'icon-red': "p-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-md"
  };

  const finalClassName = variant.startsWith('icon') 
    ? `${variants[variant]} ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`
    : `${baseStyles} ${variants[variant]} ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`;

  return (
    <button 
      className={finalClassName}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};

// Requirements: "Input form di sisi pendaftar ... dengan border Hijau tipis."
export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string }> = ({ label, className = '', ...props }) => (
  <div className="mb-4">
    {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
    <input 
      className={`w-full px-3 py-2 border border-islamic-green/40 rounded-md focus:outline-none focus:ring-2 focus:ring-islamic-green/20 focus:border-islamic-green bg-white transition-colors placeholder-gray-400 ${className}`}
      {...props}
    />
  </div>
);

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string, options: {label: string, value: string}[] }> = ({ label, options, className = '', ...props }) => (
  <div className="mb-4">
    {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
    <select 
      className={`w-full px-3 py-2 border border-islamic-green/40 rounded-md focus:outline-none focus:ring-2 focus:ring-islamic-green/20 focus:border-islamic-green bg-white transition-colors ${className}`}
      {...props}
    >
      {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
  </div>
);

export const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }> = ({ label, className = '', ...props }) => (
  <div className="mb-4">
    {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
    <textarea 
      className={`w-full px-3 py-2 border border-islamic-green/40 rounded-md focus:outline-none focus:ring-2 focus:ring-islamic-green/20 focus:border-islamic-green bg-white transition-colors ${className}`}
      {...props}
    />
  </div>
);

export const Card: React.FC<{ children: React.ReactNode; className?: string; title?: string }> = ({ children, className = '', title }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}>
    {title && (
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <h3 className="text-lg font-semibold text-islamic-dark">{title}</h3>
      </div>
    )}
    <div className="p-6">
      {children}
    </div>
  </div>
);

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  let styles = "bg-gray-100 text-gray-800";
  
  switch(status) {
    case 'Menunggu Verifikasi':
      styles = "bg-yellow-100 text-yellow-800 border border-yellow-200";
      break;
    case 'Diterima':
      styles = "bg-green-100 text-green-800 border border-green-200";
      break;
    case 'Perlu Revisi':
      styles = "bg-orange-100 text-orange-800 border border-orange-200";
      break;
    case 'Ditolak':
      styles = "bg-red-100 text-red-800 border border-red-200";
      break;
    default:
      styles = "bg-blue-50 text-blue-700 border border-blue-200";
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles}`}>
      {status}
    </span>
  );
};