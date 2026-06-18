/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  User as UserIcon,
  LogOut,
  Moon,
  Sun,
  Clock,
  ShieldCheck,
  UserRound,
  CheckCircle,
  X,
  Plus,
  Compass,
  AlertCircle
} from 'lucide-react';

import { User, Lapangan, Booking, Pembayaran, Promo, HubungiKamiPesan, SystemNotification } from './types';
import { RealtimeDB } from './utils/db';
import { Notifications, Toast } from './components/Notifications';
import { TamuBeranda } from './components/TamuBeranda';
import { PelangganDashboard } from './components/PelangganDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { Footer } from './components/Footer';

export default function App() {
  // --- Persistent Storage State ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [lapanganList, setLapanganList] = useState<Lapangan[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Pembayaran[]>([]);
  const [promos, setPromos] = useState<Promo[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<HubungiKamiPesan[]>([]);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);

  // --- Theme State ---
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('badminton_theme') === 'dark';
  });

  // --- Realtime Clock State ---
  const [liveWIBTime, setLiveWIBTime] = useState<string>('');

  // --- Auth Dialog Modals ---
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // --- Login Form State ---
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // --- Register Form State ---
  const [regNama, setRegNama] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');

  // --- Toast state ---
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);

  // Load and refresh state sets
  const refreshDatabaseStates = () => {
    RealtimeDB.init();
    setLapanganList(RealtimeDB.getLapangan());
    setBookings(RealtimeDB.getBookings());
    setPayments(RealtimeDB.getPembayaran());
    setPromos(RealtimeDB.getPromos());
    setUsers(RealtimeDB.getUsers());
    setMessages(RealtimeDB.getHubungiPesan());
    setNotifications(RealtimeDB.getNotifications());
  };

  useEffect(() => {
    refreshDatabaseStates();

    // Clock Interval
    const timer = setInterval(() => {
      const now = new Date();
      // Format as WIB Time (UTC +7)
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Jakarta',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      };
      setLiveWIBTime(now.toLocaleTimeString('id-ID', options) + ' WIB');
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Theme Sync Trigger
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('badminton_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('badminton_theme', 'light');
    }
  }, [darkMode]);

  const showToast = (message: string, type: string = 'info') => {
    setToast({ message, type });
  };

  // --- User Logging action flows ---
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      showToast('Harap isi alamat email dan password!', 'error');
      return;
    }

    const matchedUser = users.find(
      (u) => u.email.toLowerCase() === loginEmail.toLowerCase() && u.password === loginPassword
    );

    if (!matchedUser) {
      showToast('Kombinasi Email atau Password salah!', 'error');
      return;
    }

    setCurrentUser(matchedUser);
    setShowLoginModal(false);
    setLoginEmail('');
    setLoginPassword('');
    showToast(`Selamat datang kembali, ${matchedUser.nama}!`, 'success');

    // Notification trigger
    RealtimeDB.addNotification(
      'Sesi Login Berhasil',
      `Anda baru saja login ke dashboard Smash Arena sebagai ${matchedUser.role}.`,
      'success'
    );
    refreshDatabaseStates();
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regNama || !regEmail || !regPassword) {
      showToast('Lengkapi semua isian registrasi akun!', 'error');
      return;
    }

    if (regPassword !== regConfirm) {
      showToast('Konfirmasi password tidak cocok!', 'error');
      return;
    }

    // Check pre-existing email
    if (users.some((u) => u.email.toLowerCase() === regEmail.toLowerCase())) {
      showToast('Alamat email ini sudah terdaftar!', 'error');
      return;
    }

    // Generate user
    const newUser: User = {
      id_user: 'U' + Math.floor(100 + Math.random() * 900),
      nama: regNama,
      email: regEmail,
      password: regPassword,
      role: 'pelanggan',
      foto_profil: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
    };

    const updatedUsers = [...users, newUser];
    RealtimeDB.saveUsers(updatedUsers);

    showToast('Registrasi Akun sukses! Silakan login menggunakan akun Anda.', 'success');
    setRegNama('');
    setRegEmail('');
    setRegPassword('');
    setRegConfirm('');
    setShowRegisterModal(false);
    // Open login screen
    setShowLoginModal(true);
    refreshDatabaseStates();
  };

  const handleLogout = () => {
    if (window.confirm('Apakah Anda yakin ingin keluar dari sistem?')) {
      setCurrentUser(null);
      showToast('Sesi Anda berhasil diakhiri.', 'info');
    }
  };

  // Quick Account Login Shortcuts for testing purposes
  const handleQuickLogin = (role: 'admin' | 'pelanggan') => {
    if (role === 'admin') {
      setLoginEmail('admin@smasharena.com');
      setLoginPassword('admin123');
    } else {
      setLoginEmail('budi@gmail.com');
      setLoginPassword('user123');
    }
    showToast('Kredensial demo terisi otomatis. Klik Masuk!', 'info');
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${
      darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'
    }`}>
      {/* HEADER NAVIGATION BAR */}
      <header className={`sticky top-0 z-50 border-b shadow-xs transition-colors duration-200 ${
        darkMode ? 'bg-gray-950/90 backdrop-blur-md border-gray-800' : 'bg-white/95 backdrop-blur-md border-emerald-100'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* GOR brand label */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => {}}>
            <div className="h-9 w-9 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-extrabold shadow-sm">
              S
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xs md:text-sm tracking-tight leading-none text-emerald-500">
                SMASH ARENA
              </span>
              <span className={`text-[10px] uppercase font-bold tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Badminton Booking Center
              </span>
            </div>
          </div>

          {/* Quick Realtime clocks & triggers info */}
          <div className="flex items-center gap-3 md:gap-5">
            <span className="hidden md:flex items-center gap-1.5 text-[10px] font-extrabold text-gray-400 font-mono bg-gray-500/5 px-2.5 py-1 rounded-full dark:bg-white/5 border border-dashed border-gray-200 dark:border-gray-800">
              <Clock className="w-3.5 h-3.5 text-emerald-500" />
              {liveWIBTime || '00:00:00 WIB'}
            </span>

            {/* Notifications manager */}
            <Notifications
              notifications={notifications}
              onRefresh={refreshDatabaseStates}
              darkMode={darkMode}
            />

            {/* Dark & light theme switcher */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-full cursor-pointer transition-colors ${
                darkMode ? 'hover:bg-gray-800 text-amber-400' : 'hover:bg-gray-100 text-gray-500'
              }`}
              title="Toggle Dark Mode"
            >
              {darkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>

            {/* Logged user actions or Sign triggers */}
            {currentUser ? (
              <div className="flex items-center gap-2.5 border-l border-gray-200 dark:border-gray-800 pl-3">
                <div className="flex flex-col text-right hidden sm:block">
                  <span className={`text-[11px] font-extrabold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {currentUser.nama}
                  </span>
                  <span className="text-[9px] uppercase font-bold text-emerald-500 leading-none">
                    {currentUser.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className={`p-2 rounded-full cursor-pointer hover:bg-red-500/10 text-red-500 transition-colors`}
                  title="Logout"
                >
                  <LogOut className="w-4.5 h-4.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-4 py-2 bg-emerald-500 text-white font-extrabold text-xs rounded-xl hover:bg-emerald-600 cursor-pointer shadow-sm active:scale-95 transition-all flex items-center gap-1.5"
              >
                <UserIcon className="w-3.5 h-3.5" />
                Masuk Akun
              </button>
            )}
          </div>
        </div>
      </header>

      {/* PRIMARY VIEWS DIRECTS */}
      <main className="flex-grow flex flex-col">
        {!currentUser && (
          <TamuBeranda
            lapanganList={lapanganList}
            bookings={bookings}
            promos={promos}
            onNavigateToLogin={() => setShowLoginModal(true)}
            onNavigateToRegister={() => setShowRegisterModal(true)}
            showToast={showToast}
            darkMode={darkMode}
          />
        )}

        {currentUser && currentUser.role === 'pelanggan' && (
          <PelangganDashboard
            currentUser={currentUser}
            onUpdateUser={setCurrentUser}
            lapanganList={lapanganList}
            bookings={bookings}
            payments={payments}
            promos={promos}
            onRefresh={refreshDatabaseStates}
            showToast={showToast}
            darkMode={darkMode}
          />
        )}

        {currentUser && currentUser.role === 'admin' && (
          <AdminDashboard
            lapanganList={lapanganList}
            bookings={bookings}
            payments={payments}
            promos={promos}
            users={users}
            messages={messages}
            onRefresh={refreshDatabaseStates}
            showToast={showToast}
            darkMode={darkMode}
          />
        )}
      </main>

      {/* FOOTER */}
      <Footer darkMode={darkMode} />

      {/* --- FLOATING TOAST FEEDBACK --- */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* --- DIALOG MODAL 1: Login --- */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`p-6 sm:p-8 rounded-2xl w-full max-w-sm border shadow-2xl relative animate-fade-in ${
            darkMode ? 'bg-gray-950 border-gray-800 text-white' : 'bg-white border-gray-100 text-gray-800'
          }`}>
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black tracking-tight flex items-center gap-1.5 mb-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              Sign In GOR System
            </h3>
            <p className="text-[11px] text-gray-400 mb-4 leading-relaxed">
              Silakan login untuk mengecek status pemesanan atau melakukan sewa lapangan.
            </p>

            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500">Email Utama</label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="Contoh: budi@gmail.com"
                  className={`p-3 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden ${
                    darkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'
                  }`}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500">Password Akun</label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Masukkan password Anda"
                  className={`p-3 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden ${
                    darkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-gray-50 border-gray-200 text-gray-850'
                  }`}
                />
              </div>

              {/* Demo Account quick shortcut buttons inside modals */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/15 flex flex-col gap-2 mt-1">
                <span className="text-[9px] font-black uppercase text-amber-600 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" /> Bypass Demo Quick Login:
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('admin')}
                    className="flex-1 py-1 px-2 text-[9px] font-extrabold bg-amber-600 hover:bg-amber-700 text-white rounded cursor-pointer text-center"
                  >
                    Demo Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('pelanggan')}
                    className="flex-1 py-1 px-2 text-[9px] font-extrabold bg-amber-600 hover:bg-amber-700 text-white rounded cursor-pointer text-center"
                  >
                    Demo Budi
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 bg-emerald-500 text-white font-bold text-xs rounded-xl hover:bg-emerald-600 transition-all cursor-pointer shadow-sm"
              >
                Masuk Dashboard Resmi
              </button>
            </form>

            <p className="text-[11px] text-gray-500 text-center mt-5">
              Belum memiliki akun terdaftar?{' '}
              <button
                onClick={() => {
                  setShowLoginModal(false);
                  setShowRegisterModal(true);
                }}
                className="text-emerald-500 font-bold hover:underline cursor-pointer"
              >
                Daftar Gratis Sini
              </button>
            </p>
          </div>
        </div>
      )}

      {/* --- DIALOG MODAL 2: Register --- */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`p-6 sm:p-8 rounded-2xl w-full max-w-sm border shadow-2xl relative animate-fade-in ${
            darkMode ? 'bg-gray-950 border-gray-800 text-white' : 'bg-white border-gray-100 text-gray-800'
          }`}>
            <button
              onClick={() => setShowRegisterModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black tracking-tight flex items-center gap-1.5 mb-2">
              <UserRound className="w-5 h-5 text-emerald-500" />
              Daftar Member Baru GOR
            </h3>
            <p className="text-[11px] text-gray-400 mb-4 leading-relaxed">
              Bergabung bersama ratusan member aktif lainnya untuk mendapatkan promo khusus.
            </p>

            <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500">Nama Lengkap Anda</label>
                <input
                  type="text"
                  required
                  value={regNama}
                  onChange={(e) => setRegNama(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className={`p-3 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden ${
                    darkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'
                  }`}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500">Alamat Email</label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="Contoh: budi@gmail.com"
                  className={`p-3 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden ${
                    darkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-500">Password</label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Min 6 char"
                    className={`p-3 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden ${
                      darkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-gray-50 border-gray-200 text-gray-850'
                    }`}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-500">Ulangi Pass</label>
                  <input
                    type="password"
                    required
                    value={regConfirm}
                    onChange={(e) => setRegConfirm(e.target.value)}
                    placeholder="Konfirmasi"
                    className={`p-3 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden ${
                      darkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-gray-50 border-gray-200 text-gray-850'
                    }`}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 bg-emerald-500 text-white font-bold text-xs rounded-xl hover:bg-emerald-600 transition-all cursor-pointer shadow-sm"
              >
                Daftar Member Sekarang
              </button>
            </form>

            <p className="text-[11px] text-gray-500 text-center mt-5">
              Sudah mempunyai akun?{' '}
              <button
                onClick={() => {
                  setShowRegisterModal(false);
                  setShowLoginModal(true);
                }}
                className="text-emerald-500 font-bold hover:underline cursor-pointer"
              >
                Login Saja Sini
              </button>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
