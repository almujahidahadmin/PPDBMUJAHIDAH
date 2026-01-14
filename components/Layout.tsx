import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Button } from './UI';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
  // For Admin Sidebar
  activeMenu?: string;
  onMenuClick?: (menu: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, activeMenu, onMenuClick }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // --- Admin Layout (Sidebar) ---
  if (user && user.role === UserRole.ADMIN) {
    return (
      <div className="min-h-screen bg-white flex flex-col md:flex-row">
        {/* Sidebar: Hijau Tua dengan Ikon Kuning */}
        <aside className="w-full md:w-64 bg-islamic-dark text-white flex-shrink-0 flex flex-col">
           <div className="p-6 flex items-center gap-3 border-b border-green-800">
             <div className="w-8 h-8 bg-gold-main rounded-md flex items-center justify-center text-islamic-dark font-bold">M</div>
             <div>
               <h1 className="font-bold text-gold-main">Admin Panel</h1>
               <p className="text-xs text-green-300">MIS Al Mujahidah</p>
             </div>
           </div>
           
           <nav className="flex-1 p-4 space-y-2">
             {[
               { id: 'dashboard', label: 'Dashboard', icon: '📊' },
               { id: 'data', label: 'Data Pendaftar', icon: '📝' },
               { id: 'settings', label: 'Pengaturan DB', icon: '⚙️' },
               { id: 'reports', label: 'Laporan', icon: '📈' },
             ].map((item) => (
               <button
                 key={item.id}
                 onClick={() => onMenuClick && onMenuClick(item.id)}
                 className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                   activeMenu === item.id 
                     ? 'bg-green-800 text-gold-main font-semibold border-r-4 border-gold-main' 
                     : 'text-green-100 hover:bg-green-800 hover:text-white'
                 }`}
               >
                 <span>{item.icon}</span>
                 {item.label}
               </button>
             ))}
           </nav>

           <div className="p-4 border-t border-green-800">
             <div className="mb-4 px-4">
               <p className="text-sm font-medium text-white">{user.fullName}</p>
               <p className="text-xs text-green-400">Administrator</p>
             </div>
             <button 
               onClick={onLogout}
               className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-red-300 hover:bg-red-900/30 hover:text-red-200 transition-colors"
             >
               <span>🚪</span> Keluar
             </button>
           </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6 md:p-8">
           {children}
        </main>
      </div>
    );
  }

  // --- Student/Public Layout (Navbar) ---
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navbar: Logo Kiri, Logout Kanan */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-islamic-green rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-sm">
                M
              </div>
              <div className="flex flex-col">
                 <span className="font-bold text-gray-900 leading-tight">PPDB Online</span>
                 <span className="text-xs text-islamic-green font-medium">MIS Al Mujahidah</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <div className="hidden md:flex flex-col items-end mr-2">
                    <span className="text-sm font-medium text-gray-900">{user.fullName}</span>
                    <span className="text-xs text-gray-500 uppercase">Pendaftar</span>
                  </div>
                  <Button variant="outline" onClick={onLogout} className="!py-1 !px-3 text-sm">
                    Keluar
                  </Button>
                </>
              ) : (
                <div className="text-sm text-gray-500">Selamat Datang</div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content: White Background as requested */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} MIS Al Mujahidah. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};