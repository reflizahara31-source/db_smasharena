/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  CalendarDays,
  Clock,
  History,
  User as UserIcon,
  ShoppingBag,
  CreditCard,
  QrCode,
  Tag,
  Upload,
  UserRoundCheck,
  CheckCircle,
  XCircle,
  Eye,
  FileSpreadsheet,
  AlertCircle,
  KeyRound,
  Trash2,
  CalendarCheck
} from 'lucide-react';
import { User, Lapangan, Booking, Pembayaran, Promo } from '../types';
import { RealtimeDB } from '../utils/db';

interface PelangganDashboardProps {
  currentUser: User;
  onUpdateUser: (updated: User) => void;
  lapanganList: Lapangan[];
  bookings: Booking[];
  payments: Pembayaran[];
  promos: Promo[];
  onRefresh: () => void;
  showToast: (msg: string, type: string) => void;
  darkMode: boolean;
}

export function PelangganDashboard({
  currentUser,
  onUpdateUser,
  lapanganList,
  bookings,
  payments,
  promos,
  onRefresh,
  showToast,
  darkMode
}: PelangganDashboardProps) {
  const [activeTab, setActiveTab] = useState<'beranda' | 'booking' | 'riwayat' | 'profil'>('beranda');

  // Booking Wizard States
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [bSelectedLapangan, setBSelectedLapangan] = useState<Lapangan | null>(lapanganList[0] || null);
  const [bDate, setBDate] = useState(new Date().toISOString().split('T')[0]);
  const [bTime, setBTime] = useState('08:00');
  const [bDuration, setBDuration] = useState<number>(1);
  const [bPromoCode, setBPromoCode] = useState('');
  const [bAppliedPromo, setBAppliedPromo] = useState<Promo | null>(null);

  // Payment upload states
  const [pMetode, setPMetode] = useState<'Transfer Bank' | 'QRIS' | 'E-Wallet'>('Transfer Bank');
  const [pBank, setPBank] = useState('BCA');
  const [pBuktiSimulated, setPBuktiSimulated] = useState<string>(''); // Base64 or URL
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  // Profile management states
  const [profNama, setProfNama] = useState(currentUser.nama);
  const [profEmail, setProfEmail] = useState(currentUser.email);
  const [profFoto, setProfFoto] = useState(currentUser.foto_profil || '');
  const [passLama, setPassLama] = useState('');
  const [passBaru, setPassBaru] = useState('');

  // Selected Booking details modal/panel
  const [viewBookingId, setViewBookingId] = useState<string | null>(null);
  const [viewPaymentProofBookingId, setViewPaymentProofBookingId] = useState<string | null>(null);

  // Quick-Search inside history
  const [historySearch, setHistorySearch] = useState('');
  const [historyFilter, setHistoryFilter] = useState('Semua');

  // User especific datasets
  const myBookings = bookings
    .filter((b) => b.id_user === currentUser.id_user)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const activeMyBookingsCount = myBookings.filter(
    (b) => b.status === 'Disetujui' || b.status === 'Menunggu Konfirmasi' || b.status === 'Menunggu Pembayaran'
  ).length;

  const finishedMyBookingsCount = myBookings.filter((b) => b.status === 'Selesai').length;

  const totalMySpent = myBookings
    .filter((b) => b.status === 'Selesai' || b.status === 'Disetujui')
    .reduce((sum, curr) => sum + curr.total_harga, 0);

  // Calculate booking wizard values
  const basePrice = bSelectedLapangan ? bSelectedLapangan.harga * bDuration : 0;
  const discountAmount = bAppliedPromo ? Math.round((basePrice * bAppliedPromo.diskon) / 100) : 0;
  const finalPrice = basePrice - discountAmount;

  // Validate Promo Code
  const handleApplyPromo = () => {
    if (!bPromoCode) {
      showToast('Masukkan kode promo terlebih dahulu!', 'warning');
      return;
    }
    const normalized = bPromoCode.trim().toUpperCase();
    const match = promos.find((p) => p.kode_promo === normalized);

    if (!match) {
      showToast('Kode promo tidak valid atau sudah kedaluwarsa!', 'error');
      setBAppliedPromo(null);
      return;
    }

    // Check validity dates
    const today = new Date().toISOString().split('T')[0];
    if (today < match.tanggal_mulai || today > match.tanggal_selesai) {
      showToast('Masa berlaku kode promo ini sudah berakhir!', 'error');
      setBAppliedPromo(null);
      return;
    }

    setBAppliedPromo(match);
    showToast(`Promo ${match.nama_promo} (Potongan ${match.diskon}%) berhasil terpasang!`, 'success');
  };

  const handleSimulatePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPBuktiSimulated(reader.result as string);
        showToast('Bukti transfer terunggah ke form!', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSimulateAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfFoto(reader.result as string);
        showToast('Foto profil terunggah!', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Booking transaction
  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bSelectedLapangan) return;

    if (!pBuktiSimulated && pMetode !== 'Transfer Bank') {
      // Allow placeholder for Transfer Bank or QRIS for testing, but let's give a friendly mockup
      const mockReceipts = [
        'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?auto=format&fit=crop&q=80&w=200'
      ];
      setPBuktiSimulated(mockReceipts[0]);
    }

    setIsSubmittingBooking(true);

    setTimeout(() => {
      const bookingId = 'B' + Math.floor(1000 + Math.random() * 9000);
      const paymentId = 'PY' + Math.floor(1000 + Math.random() * 9000);

      const newBooking: Booking = {
        id_booking: bookingId,
        id_user: currentUser.id_user,
        id_lapangan: bSelectedLapangan.id_lapangan,
        tanggal: bDate,
        jam_mulai: bTime,
        durasi: bDuration,
        total_harga: finalPrice,
        promo_digunakan: bAppliedPromo?.kode_promo,
        status: 'Menunggu Konfirmasi', // immediately goes to waiting confirmation since proof is attached
        created_at: new Date().toISOString()
      };

      const newPayment: Pembayaran = {
        id_pembayaran: paymentId,
        id_booking: bookingId,
        metode: pMetode,
        bank_name: pMetode === 'Transfer Bank' ? `${pBank} - Rek: Smash Arena` : undefined,
        bukti_bayar: pBuktiSimulated || 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?auto=format&fit=crop&q=80&w=200',
        status: 'Menunggu Verifikasi',
        tanggal_pembayaran: new Date().toISOString().split('T')[0]
      };

      // Push both to simulated database
      RealtimeDB.addBooking(newBooking, newPayment);

      // Create realtime notification for both (admin also picks it up inside notifications DB)
      RealtimeDB.addNotification(
        'Menunggu Konfirmasi Pembayaran',
        `Pemesanan ${bookingId} sedang diproses. Admin sedang meninjau bukti transfer Anda.`,
        'success'
      );

      showToast(`Pemesanan ${bookingId} berhasil diajukan! Harap tunggu konfirmasi admin.`, 'success');
      
      // Cleanup States
      setWizardStep(1);
      setBPromoCode('');
      setBAppliedPromo(null);
      setPBuktiSimulated('');
      setIsSubmittingBooking(false);
      onRefresh();
      setActiveTab('riwayat');
    }, 1200);
  };

  // Update Profile Data
  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profNama || !profEmail) {
      showToast('Harap lengkapi Nama dan Email!', 'error');
      return;
    }

    const updatedUser: User = {
      ...currentUser,
      nama: profNama,
      email: profEmail,
      foto_profil: profFoto
    };

    // Save to our DB
    const list = RealtimeDB.getUsers();
    const idx = list.findIndex((u) => u.id_user === currentUser.id_user);
    if (idx !== -1) {
      list[idx] = updatedUser;
      RealtimeDB.saveUsers(list);
    }

    onUpdateUser(updatedUser);
    showToast('Profil Anda berhasil diperbarui!', 'success');
    onRefresh();
  };

  // Change Password
  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passLama || !passBaru) {
      showToast('Harap isi password lama dan baru!', 'error');
      return;
    }

    // Read full user object to verify password
    const list = RealtimeDB.getUsers();
    const idx = list.findIndex((u) => u.id_user === currentUser.id_user);
    if (idx !== -1) {
      const registeredPass = list[idx].password;
      if (passLama !== registeredPass) {
        showToast('Password lama Anda salah! Gagal memperbarui.', 'error');
        return;
      }

      list[idx].password = passBaru;
      RealtimeDB.saveUsers(list);
      showToast('Password berhasil diperbarui!', 'success');
      setPassLama('');
      setPassBaru('');
    }
  };

  // Operational Hours Selection List (checking for conflicts on client before proceeding)
  const operasionalSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
    '14:00', '15:00', '16:00', '17:05', '18:00', '19:00',
    '20:00', '21:00'
  ];

  const checkSlotOccupied = (lapanganId: string, date: string, time: string, duration: number) => {
    const activeBookings = bookings.filter((b) => b.id_lapangan === lapanganId && b.tanggal === date && b.status !== 'Dibatalkan');
    const targetStart = parseInt(time.split(':')[0]);
    const targetEnd = targetStart + duration;

    return activeBookings.some((b) => {
      const bookStart = parseInt(b.jam_mulai.split(':')[0]);
      const bookEnd = bookStart + b.durasi;
      // Overlap formula
      return Math.max(targetStart, bookStart) < Math.min(targetEnd, bookEnd);
    });
  };

  const handleStep1Proceed = () => {
    if (!bSelectedLapangan) {
      showToast('Pilih lapangan terlebih dahulu!', 'warning');
      return;
    }

    // Check conflict
    const isOccupied = checkSlotOccupied(bSelectedLapangan.id_lapangan, bDate, bTime, bDuration);
    if (isOccupied) {
      showToast('Waktu booking berbenturan dengan pemesanan lain. Silakan periksa jam yang lain!', 'error');
      return;
    }

    setWizardStep(2);
  };

  const handleCancelBookingAction = (bookingId: string) => {
    const list = RealtimeDB.getBookings();
    const idx = list.findIndex((b) => b.id_booking === bookingId);
    if (idx !== -1) {
      list[idx].status = 'Dibatalkan';
      RealtimeDB.saveBookings(list);

      // Cancel payment as well
      const pays = RealtimeDB.getPembayaran();
      const pIdx = pays.findIndex((p) => p.id_booking === bookingId);
      if (pIdx !== -1) {
        pays[pIdx].status = 'Ditolak';
        RealtimeDB.savePembayaran(pays);
      }

      RealtimeDB.addNotification(
        'Pemesanan Dibatalkan',
        `Booking ${bookingId} Anda berhasil dibatalkan oleh pengguna.`,
        'warning'
      );
      showToast(`Pemesanan ${bookingId} berhasil dibatalkan.`, 'info');
      onRefresh();
    }
  };

  // Filter history list
  const filteredHistory = myBookings.filter((b) => {
    const matchesSearch =
      b.id_booking.toLowerCase().includes(historySearch.toLowerCase()) ||
      b.tanggal.includes(historySearch) ||
      (lapanganList.find((l) => l.id_lapangan === b.id_lapangan)?.nama_lapangan || '')
        .toLowerCase()
        .includes(historySearch.toLowerCase());

    if (historyFilter === 'Semua') return matchesSearch;
    return b.status === historyFilter && matchesSearch;
  });

  return (
    <div className="flex-1 w-full flex flex-col">
      {/* Mini role-specific sub-navbar */}
      <div className={`sticky top-0 z-30 shadow-xs border-b transition-colors duration-200 ${
        darkMode ? 'bg-gray-100/10 backdrop-blur-md border-gray-800' : 'bg-white/95 border-gray-100'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <UserRoundCheck className="w-5 h-5 text-emerald-500" />
            <span className={`text-xs font-bold leading-none shrink-0 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              Member Area: {currentUser.nama}
            </span>
          </div>

          <div className="flex space-x-2 md:space-x-4 overflow-x-auto py-1 scrollbar-hide">
            {[
              { id: 'beranda', label: 'Dashboard Akun', icon: CalendarCheck },
              { id: 'booking', label: 'Booking Lapangan', icon: CalendarDays },
              { id: 'riwayat', label: 'Riwayat & Pembayaran', icon: History },
              { id: 'profil', label: 'Pengaturan Profil', icon: UserIcon }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all duration-205 cursor-pointer whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : darkMode
                      ? 'hover:bg-gray-850 text-gray-300'
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Primary Tabs display logic */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* TAB 1: Beranda (Mini info panels, streaky stats) */}
        {activeTab === 'beranda' && (
          <div className="animate-fade-in flex flex-col gap-6">
            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className={`p-4 rounded-xl border flex items-center justify-between ${
                darkMode ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-100 shadow-xs'
              }`}>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Booking Aktif/Proses</span>
                  <span className={`text-xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {activeMyBookingsCount}
                  </span>
                </div>
                <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg shrink-0">
                  <CalendarDays className="w-5 h-5" />
                </div>
              </div>

              <div className={`p-4 rounded-xl border flex items-center justify-between ${
                darkMode ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-100 shadow-xs'
              }`}>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Permainan Selesai</span>
                  <span className={`text-xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {finishedMyBookingsCount}
                  </span>
                </div>
                <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg shrink-0">
                  <CheckCircle className="w-5 h-5" />
                </div>
              </div>

              <div className={`p-4 rounded-xl border flex items-center justify-between ${
                darkMode ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-100 shadow-xs'
              }`}>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Total Pembelanjaan</span>
                  <span className={`text-xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Rp {totalMySpent.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Quick action hero & mini table */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
              {/* Profile card shortcuts */}
              <div className={`lg:col-span-2 p-5 rounded-2xl border flex flex-col gap-4 text-center items-center ${
                darkMode ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-100 shadow-xs'
              }`}>
                <div className="relative h-20 w-20 rounded-full overflow-hidden border-2 border-emerald-500">
                  <img
                    src={currentUser.foto_profil || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                    alt={currentUser.nama}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className={`font-black text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{currentUser.nama}</h3>
                  <p className="text-xs text-gray-400 font-medium">{currentUser.email}</p>
                </div>
                <div className="w-full border-t border-gray-100 dark:border-gray-850 pt-2 flex flex-col gap-2">
                  <button
                    onClick={() => setActiveTab('booking')}
                    className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Booking Lapangan Sekarang
                  </button>
                  <button
                    onClick={() => setActiveTab('profil')}
                    className={`w-full py-2 font-bold text-xs rounded-xl border transition-all cursor-pointer ${
                      darkMode ? 'border-gray-800 text-gray-300 hover:bg-gray-800' : 'border-gray-100 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Edit Profil Saya
                  </button>
                </div>
              </div>

              {/* Active booking grid logs */}
              <div className={`lg:col-span-3 p-5 rounded-2xl border flex flex-col gap-4 ${
                darkMode ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-100 shadow-xs'
              }`}>
                <h3 className={`font-bold text-sm border-b pb-2 border-gray-100 dark:border-gray-850 flex items-center justify-between ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  <span>Status Pemesanan Terbaru</span>
                  <button
                    onClick={() => setActiveTab('riwayat')}
                    className="text-xs text-emerald-500 hover:text-emerald-450 font-semibold"
                  >
                    Lihat Semua
                  </button>
                </h3>

                {myBookings.length === 0 ? (
                  <div className="p-8 text-center text-xs text-gray-400">
                    Belum ada riwayat transaksi. Mulai permainan pertama Anda hari ini!
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {myBookings.slice(0, 3).map((b) => {
                      const lap = lapanganList.find((l) => l.id_lapangan === b.id_lapangan);
                      return (
                        <div
                          key={b.id_booking}
                          className={`p-3 rounded-xl border flex justify-between items-center ${
                            darkMode ? 'bg-gray-900/50 border-gray-850' : 'bg-gray-50 border-gray-100'
                          }`}
                        >
                          <div className="flex flex-col gap-1">
                            <span className={`text-xs font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                              {lap?.nama_lapangan || b.id_lapangan} ({lap?.jenis})
                            </span>
                            <span className="text-[10px] text-gray-400 font-medium">
                              {new Date(b.tanggal).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short'
                              })} | Jam: {b.jam_mulai} ({b.durasi} Jam)
                            </span>
                          </div>

                          <div className="flex flex-col items-end gap-1.5 font-semibold text-xs">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wide font-extrabold ${
                              b.status === 'Disetujui'
                                ? 'bg-emerald-500 text-white'
                                : b.status === 'Menunggu Konfirmasi'
                                ? 'bg-amber-500 text-white'
                                : b.status === 'Menunggu Pembayaran'
                                ? 'bg-indigo-500 text-white'
                                : b.status === 'Selesai'
                                ? 'bg-gray-400 text-white dark:bg-gray-800'
                                : 'bg-red-500 text-white'
                            }`}>
                              {b.status}
                            </span>
                            <span className={darkMode ? 'text-gray-300' : 'text-gray-800'}>
                              Rp {b.total_harga.toLocaleString('id-ID')}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Booking Wizard (Step by step scheduler) */}
        {activeTab === 'booking' && (
          <div className="animate-fade-in max-w-3xl mx-auto w-full">
            <div className={`p-6 md:p-8 rounded-2xl border ${
              darkMode ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-100 shadow-sm'
            }`}>
              {/* Wizard Nav Trackers */}
              <div className="flex items-center justify-between border-b pb-4 border-gray-100 dark:border-gray-850 mb-6">
                <h2 className={`text-base md:text-lg font-black flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-950'}`}>
                  <CalendarDays className="w-5 h-5 text-emerald-500" />
                  Formulir Booking Lapangan Online
                </h2>
                <div className="text-xs font-mono bg-emerald-500/10 text-emerald-500 px-2.5 py-0.5 rounded-full">
                  Step {wizardStep} of 3
                </div>
              </div>

              {/* Progress Bar indicator */}
              <div className="flex items-center gap-2 mb-6 text-[10px] font-extrabold uppercase text-gray-400">
                <span className={wizardStep >= 1 ? 'text-emerald-500' : ''}>1. Detail Tanggal & Jam</span>
                <span className="h-0.5 flex-1 bg-gray-200 dark:bg-gray-800" />
                <span className={wizardStep >= 2 ? 'text-emerald-500' : ''}>2. checkout promo</span>
                <span className="h-0.5 flex-1 bg-gray-200 dark:bg-gray-800" />
                <span className={wizardStep >= 3 ? 'text-emerald-500' : ''}>3. Pembayaran</span>
              </div>

              {/* STEP 1: Select Field, Date, Sched, Conflict resolution */}
              {wizardStep === 1 && (
                <div className="flex flex-col gap-4 animate-fade-in">
                  <div className="flex flex-col gap-1">
                    <label className={`text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Pilih Lapangan</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {lapanganList.filter(l => l.status === 'aktif').map((lap) => (
                        <button
                          key={lap.id_lapangan}
                          type="button"
                          onClick={() => setBSelectedLapangan(lap)}
                          className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                            bSelectedLapangan?.id_lapangan === lap.id_lapangan
                              ? 'border-emerald-500 bg-emerald-500/10'
                              : darkMode
                              ? 'bg-gray-900 border-gray-850 hover:bg-gray-800'
                              : 'bg-white border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <span className={`text-[11px] font-extrabold ${
                            bSelectedLapangan?.id_lapangan === lap.id_lapangan
                              ? 'text-emerald-500'
                              : darkMode
                              ? 'text-white'
                              : 'text-gray-700'
                          }`}>
                            {lap.nama_lapangan}
                          </span>
                          <span className="text-[10px] text-gray-400 leading-none">
                            {lap.jenis} - Rp {lap.harga.toLocaleString('id-ID')}/j
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                    <div className="flex flex-col gap-1">
                      <label className={`text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Pilih Tanggal Main</label>
                      <input
                        type="date"
                        value={bDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setBDate(e.target.value)}
                        className={`p-3 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden ${
                          darkMode ? 'bg-gray-900 border-gray-850 text-white' : 'bg-white border-gray-200 text-gray-800'
                        }`}
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className={`text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Jam Mulai</label>
                      <select
                        value={bTime}
                        onChange={(e) => setBTime(e.target.value)}
                        className={`p-3 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden ${
                          darkMode ? 'bg-gray-900 border-gray-850 text-white' : 'bg-white border-gray-200 text-gray-800'
                        }`}
                      >
                        {operasionalSlots.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1 sm:col-span-2">
                      <label className={`text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Durasi Sewa (Jam)</label>
                      <input
                        type="number"
                        min="1"
                        max="6"
                        value={bDuration}
                        onChange={(e) => setBDuration(Math.max(1, parseInt(e.target.value) || 1))}
                        className={`p-3 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden ${
                          darkMode ? 'bg-gray-900 border-gray-850 text-white' : 'bg-white border-gray-200 text-gray-800'
                        }`}
                      />
                      <span className="text-[10px] text-gray-400">Operasional penutupan gedung jam 22:00 WIB.</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleStep1Proceed}
                    className="w-full mt-4 py-3 bg-emerald-500 text-white font-bold text-xs rounded-xl hover:bg-emerald-600 cursor-pointer active:scale-95 transition-all"
                  >
                    Verifikasi Ketersediaan Slot & Lanjutkan
                  </button>
                </div>
              )}

              {/* STEP 2: Voucher promo review */}
              {wizardStep === 2 && (
                <div className="flex flex-col gap-4 animate-fade-in">
                  <div className={`p-4 rounded-xl border flex flex-col gap-2 ${
                    darkMode ? 'bg-gray-900 border-gray-850' : 'bg-gray-50 border-gray-100'
                  }`}>
                    <h4 className={`text-xs font-black ${darkMode ? 'text-white' : 'text-gray-800'}`}>Review Rincian Rencana Sesi</h4>
                    <div className="grid grid-cols-2 gap-y-1.5 gap-x-4 text-xs mt-1.5 text-gray-500 dark:text-gray-400">
                      <span>Pilihan GOR:</span>
                      <span className="font-bold text-right text-gray-700 dark:text-gray-200">{bSelectedLapangan?.nama_lapangan} ({bSelectedLapangan?.jenis})</span>
                      <span>Tanggal Reservasi:</span>
                      <span className="font-bold text-right text-gray-700 dark:text-gray-200">{bDate}</span>
                      <span>Jam Pemakaian:</span>
                      <span className="font-bold text-right text-gray-700 dark:text-gray-200">{bTime} ({bDuration} Jam)</span>
                      <span>Tarif Dasar:</span>
                      <span className="font-bold text-right text-gray-750 dark:text-gray-200">Rp {basePrice.toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  {/* Promo Input */}
                  <div className="flex flex-col gap-1 mt-2">
                    <label className={`text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Punya Kode Promo / Voucher?</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={bPromoCode}
                        onChange={(e) => setBPromoCode(e.target.value)}
                        placeholder="Contoh: SMASHINDONESIA"
                        className={`flex-1 p-3 rounded-xl text-xs uppercase font-mono tracking-wider focus:ring-1 focus:ring-emerald-500 focus:outline-hidden ${
                          darkMode ? 'bg-gray-900 border-gray-850 text-white' : 'bg-white border-gray-200 text-gray-800'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={handleApplyPromo}
                        className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                      >
                        Pasang
                      </button>
                    </div>
                  </div>

                  {/* Summary math */}
                  <div className="border-t border-gray-150 dark:border-gray-850 pt-3 flex flex-col gap-1.5">
                    {bAppliedPromo && (
                      <div className="flex justify-between text-xs text-indigo-500 font-bold">
                        <span>Diskon ({bAppliedPromo.kode_promo} - {bAppliedPromo.diskon}%):</span>
                        <span>- Rp {discountAmount.toLocaleString('id-ID')}</span>
                      </div>
                    )}
                    <div className={`flex justify-between font-black text-sm pt-1.5 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                      <span>Total Invoice:</span>
                      <span>Rp {finalPrice.toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      type="button"
                      onClick={() => setWizardStep(1)}
                      className={`flex-1 py-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        darkMode ? 'border-gray-800 text-gray-300 hover:bg-gray-800' : 'border-gray-155 text-gray-650 hover:bg-gray-50'
                      }`}
                    >
                      Kembali Atur Jam
                    </button>
                    <button
                      type="button"
                      onClick={() => setWizardStep(3)}
                      className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl cursor-pointer"
                    >
                      Selesai & Setel Pembayaran
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Payment channel choice & file simulated attachment */}
              {wizardStep === 3 && (
                <form onSubmit={handleSubmitBooking} className="flex flex-col gap-4 animate-fade-in">
                  <div className="flex flex-col gap-1">
                    <label className={`text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Metode Pembayaran</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'Transfer Bank', label: 'Bank Transfer' },
                        { id: 'QRIS', label: 'QRIS Scan' },
                        { id: 'E-Wallet', label: 'E-Wallet' }
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setPMetode(item.id as any)}
                          className={`p-3 rounded-xl border text-center font-bold text-xs cursor-pointer transition-all ${
                            pMetode === item.id
                              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500'
                              : darkMode
                              ? 'bg-gray-900 border-gray-850 text-gray-300 hover:bg-gray-800'
                              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sub channel displays */}
                  {pMetode === 'Transfer Bank' && (
                    <div className={`p-4 rounded-xl border flex flex-col gap-2 ${
                      darkMode ? 'bg-gray-900 border-gray-850' : 'bg-gray-50 border-gray-100'
                    }`}>
                      <div className="flex items-center justify-between text-xs font-bold text-gray-500 dark:text-gray-400">
                        <span>Pilih Rekening Tujuan:</span>
                        <select
                          value={pBank}
                          onChange={(e) => setPBank(e.target.value)}
                          className={`px-2 py-1 rounded text-xs focus:outline-hidden ${
                            darkMode ? 'bg-gray-950 text-white border-gray-800' : 'bg-white text-gray-700 border-gray-200'
                          }`}
                        >
                          <option value="BCA">BCA (Smash Arena)</option>
                          <option value="Mandiri">Mandiri (Smash Arena)</option>
                          <option value="BNI">BNI (Smash Arena)</option>
                        </select>
                      </div>
                      <div className="border-t border-gray-250 dark:border-gray-800 pt-2 text-xs">
                        {pBank === 'BCA' && (
                          <p className="leading-relaxed">REK BCA: <b className="text-emerald-500 font-mono">8291029312</b> <br /> a/n <span className={darkMode ? 'text-white' : 'text-gray-800'}>CV Smash Arena Indonesia</span></p>
                        )}
                        {pBank === 'Mandiri' && (
                          <p className="leading-relaxed">REK MANDIRI: <b className="text-emerald-500 font-mono">1320019283721</b> <br /> a/n <span className={darkMode ? 'text-white' : 'text-gray-800'}>CV Smash Arena Indonesia</span></p>
                        )}
                        {pBank === 'BNI' && (
                          <p className="leading-relaxed">REK BNI: <b className="text-emerald-500 font-mono">0382919234</b> <br /> a/n <span className={darkMode ? 'text-white' : 'text-gray-800'}>CV Smash Arena Indonesia</span></p>
                        )}
                      </div>
                    </div>
                  )}

                  {pMetode === 'QRIS' && (
                    <div className={`p-4 rounded-xl border flex flex-col items-center gap-3 ${
                      darkMode ? 'bg-gray-900 border-gray-850' : 'bg-gray-50 border-gray-100'
                    }`}>
                      <QrCode className="w-24 h-24 text-gray-800 dark:text-white" />
                      <span className="text-[10px] text-gray-400 font-medium text-center">
                        Scan QRIS di atas menggunakan dompet digital Anda (Gopay/OVO/Dana/LinkAja/M-Banking).
                      </span>
                    </div>
                  )}

                  {pMetode === 'E-Wallet' && (
                    <div className={`p-4 rounded-xl border flex flex-col gap-2 text-xs ${
                      darkMode ? 'bg-gray-900 border-gray-850' : 'bg-gray-50 border-gray-100'
                    }`}>
                      <p>Transfer E-Wallet ke Nomor Admin Kami:</p>
                      <ul className="list-disc pl-5 font-mono text-emerald-500 flex flex-col gap-1">
                        <li>DANA/GOPAY: 0812-9876-5432</li>
                        <li>OVO/SHOPEEPAY: 0812-9876-5432</li>
                      </ul>
                    </div>
                  )}

                  {/* Receipt Proof simulated attachment */}
                  <div className="flex flex-col gap-1.5">
                    <label className={`text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Unggah Bukti Pembayaran (Simulasi File)
                    </label>
                    <div className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl p-4 text-center hover:bg-gray-50 dark:hover:bg-gray-950 flex flex-col items-center gap-2 relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleSimulatePhotoUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <Upload className="w-5 h-5 text-emerald-500 animate-bounce" />
                      <span className="text-xs font-semibold text-gray-500">Klik atau seret file gambar bukti kesini</span>
                      <span className="text-[10px] text-gray-400">Format JPEG, PNG (Maks 2MB)</span>
                    </div>
                    {pBuktiSimulated && (
                      <span className="text-[10px] font-bold text-emerald-500 block">✓ File Terlampir Sukses!</span>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setWizardStep(2)}
                      className={`flex-1 py-3 text-xs font-bold rounded-xl border cursor-pointer transition-all ${
                        darkMode ? 'border-gray-800 text-gray-300 hover:bg-gray-800' : 'border-gray-155 text-gray-650 hover:bg-gray-50'
                      }`}
                    >
                      Kembali Review
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingBooking}
                      className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl cursor-pointer"
                    >
                      {isSubmittingBooking ? 'Mengirim Data...' : 'Kirim Pemesanan Sekarang'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: Riwayat Booking (DataTable Search, actions) */}
        {activeTab === 'riwayat' && (
          <div className="animate-fade-in flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 border-gray-100 dark:border-gray-850">
              <h2 className={`text-base md:text-lg font-black flex items-center gap-2 shrink-0 ${darkMode ? 'text-white' : 'text-gray-950'}`}>
                <History className="w-5 h-5 text-emerald-500" />
                Daftar Riwayat Booking & Invoice
              </h2>

              {/* Grid selectors */}
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Cari ID Booking..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className={`p-2 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden flex-1 ${
                    darkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-850'
                  }`}
                />
                <select
                  value={historyFilter}
                  onChange={(e) => setHistoryFilter(e.target.value)}
                  className={`p-2 rounded-lg text-xs focus:outline-hidden ${
                    darkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-850'
                  }`}
                >
                  <option value="Semua">Semua Status</option>
                  <option value="Menunggu Pembayaran">Menunggu Pembayaran</option>
                  <option value="Menunggu Konfirmasi">Menunggu Konfirmasi</option>
                  <option value="Disetujui">Disetujui</option>
                  <option value="Selesai">Selesai</option>
                  <option value="Dibatalkan">Dibatalkan</option>
                </select>
              </div>
            </div>

            {/* history table output */}
            <div className={`border rounded-2xl overflow-hidden ${
              darkMode ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-100 shadow-xs'
            }`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className={`border-b ${darkMode ? 'bg-gray-900 border-gray-800 text-gray-300' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>
                      <th className="p-3 font-semibold">No Booking</th>
                      <th className="p-3 font-semibold">Lapangan/Jenis</th>
                      <th className="p-3 font-semibold">Tanggal Sewa</th>
                      <th className="p-3 font-semibold">Waktu & Durasi</th>
                      <th className="p-3 font-semibold">Total Invoice</th>
                      <th className="p-3 font-semibold">Status</th>
                      <th className="p-3 font-semibold text-center">Aksi Pelanggan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-850">
                    {filteredHistory.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-gray-400">
                          Tidak ditemukan data pemesanan.
                        </td>
                      </tr>
                    ) : (
                      filteredHistory.map((b) => {
                        const lap = lapanganList.find((l) => l.id_lapangan === b.id_lapangan);
                        return (
                          <tr key={b.id_booking} className={darkMode ? 'hover:bg-gray-900/30' : 'hover:bg-gray-50/50'}>
                            <td className="p-3 font-mono font-bold text-emerald-500">{b.id_booking}</td>
                            <td className="p-3">
                              <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{lap?.nama_lapangan || b.id_lapangan}</span>
                              <span className="text-[10px] text-gray-400 block">{lap?.jenis}</span>
                            </td>
                            <td className="p-3">
                              {new Date(b.tanggal).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </td>
                            <td className="p-3">
                              <span>{b.jam_mulai}</span>
                              <span className="text-[10px] text-gray-400 block">{b.durasi} Jam</span>
                            </td>
                            <td className={`p-3 font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                              Rp {b.total_harga.toLocaleString('id-ID')}
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wide font-extrabold ${
                                b.status === 'Disetujui'
                                  ? 'bg-emerald-500 text-white'
                                  : b.status === 'Menunggu Konfirmasi'
                                  ? 'bg-amber-500 text-white'
                                  : b.status === 'Menunggu Pembayaran'
                                  ? 'bg-indigo-500 text-white'
                                  : b.status === 'Selesai'
                                  ? 'bg-gray-400 text-white dark:bg-gray-800'
                                  : 'bg-red-500 text-white'
                              }`}>
                                {b.status}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => setViewBookingId(b.id_booking)}
                                  className={`p-1.5 rounded-lg border cursor-pointer transition-all ${
                                    darkMode ? 'border-gray-800 hover:bg-gray-800 text-gray-300' : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                                  }`}
                                  title="Lihat Detail Sesi"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>

                                {b.status === 'Menunggu Pembayaran' && (
                                  <button
                                    onClick={() => {
                                      // Pre-fill fields for payment step
                                      setBSelectedLapangan(lap || null);
                                      setBDate(b.tanggal);
                                      setBTime(b.jam_mulai);
                                      setBDuration(b.durasi);
                                      setWizardStep(3);
                                      setActiveTab('booking');
                                    }}
                                    className="px-2 py-1 rounded bg-indigo-500 hover:bg-indigo-600 text-white text-[10px] font-bold"
                                    title="Upload bukti pembayaran"
                                  >
                                    Bayar
                                  </button>
                                )}

                                {(b.status === 'Menunggu Pembayaran' || b.status === 'Menunggu Konfirmasi') && (
                                  <button
                                    onClick={() => {
                                      if (confirm('Apakah Anda yakin ingin membatalkan booking ini?')) {
                                        handleCancelBookingAction(b.id_booking);
                                      }
                                    }}
                                    className="p-1.5 rounded-lg border border-red-200 dark:border-red-950/40 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/10 cursor-pointer"
                                    title="Batalkan Booking"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Inner details pop-up modal panel */}
            {viewBookingId && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                <div className={`p-6 rounded-2xl w-full max-w-sm border shadow-2xl relative ${
                  darkMode ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-100'
                }`}>
                  <h3 className={`font-black text-sm border-b pb-2 mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    RINCIAN DATA TRANSAKSI
                  </h3>
                  {(() => {
                    const booking = bookings.find((b) => b.id_booking === viewBookingId);
                    const lap = lapanganList.find((l) => l?.id_lapangan === booking?.id_lapangan);
                    return booking ? (
                      <div className="flex flex-col gap-3.5 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex justify-between">
                          <span>Kode Booking:</span>
                          <span className="font-mono text-emerald-500 font-bold">{booking.id_booking}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Lapangan:</span>
                          <span className="text-gray-950 dark:text-gray-200 font-semibold">{lap?.nama_lapangan}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Material Arena:</span>
                          <span className="text-gray-950 dark:text-gray-200 font-semibold">{lap?.jenis}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tanggal Main:</span>
                          <span className="text-gray-950 dark:text-gray-200 font-semibold">{booking.tanggal}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Waktu:</span>
                          <span className="text-gray-950 dark:text-gray-200 font-semibold">{booking.jam_mulai} ({booking.durasi} Jam)</span>
                        </div>
                        {booking.promo_digunakan && (
                          <div className="flex justify-between text-indigo-500 font-medium">
                            <span>Voucher Digunakan:</span>
                            <span>{booking.promo_digunakan}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-black border-t pt-3.5 mt-1 border-gray-100 dark:border-gray-850 text-sm">
                          <span>Total Pembayaran:</span>
                          <span className={darkMode ? 'text-emerald-400' : 'text-emerald-600'}>Rp {booking.total_harga.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] mt-2">
                          <span>Status Transaksi:</span>
                          <span className={`px-2.5 py-0.5 rounded text-white ${
                            booking.status === 'Disetujui' ? 'bg-emerald-500' : 'bg-red-500'
                          }`}>{booking.status}</span>
                        </div>
                      </div>
                    ) : null;
                  })()}
                  <button
                    onClick={() => setViewBookingId(null)}
                    className="w-full mt-5 py-2.5 bg-gray-500 hover:bg-gray-650 text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Tutup Rincian
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: Profil panel (User details, change profile picture, edit account details) */}
        {activeTab === 'profil' && (
          <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Account Details and avatar */}
            <div className={`p-6 md:p-8 rounded-2xl border ${
              darkMode ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-100 shadow-sm'
            }`}>
              <h3 className={`text-base md:text-lg font-black border-b pb-3 mb-5 border-gray-100 dark:border-gray-850 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Perbarui Informasi Profil Pelanggan
              </h3>

              <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4">
                {/* Simulated file photo upload avatar */}
                <div className="flex items-center gap-4 py-2 border-b border-gray-100 dark:border-gray-850 mb-1">
                  <div className="relative h-16 w-16 rounded-full overflow-hidden border-2 border-emerald-500 shrink-0">
                    <img
                      src={profFoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className={`text-[10px] font-extrabold uppercase tracking-wide ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Foto Profil</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleSimulateAvatarUpload}
                      className="text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={`text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Nama Lengkap</label>
                  <input
                    type="text"
                    value={profNama}
                    onChange={(e) => setProfNama(e.target.value)}
                    className={`p-3 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden ${
                      darkMode ? 'bg-gray-900 border-gray-850 text-white' : 'bg-white border-gray-200 text-gray-800'
                    }`}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={`text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Alamat Email</label>
                  <input
                    type="email"
                    value={profEmail}
                    onChange={(e) => setProfEmail(e.target.value)}
                    className={`p-3 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden ${
                      darkMode ? 'bg-gray-900 border-gray-850 text-white' : 'bg-white border-gray-200 text-gray-800'
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-500 text-white font-bold text-xs rounded-xl hover:bg-emerald-600 cursor-pointer active:scale-95 transition-all"
                >
                  Simpan Perubahan Profil
                </button>
              </form>
            </div>

            {/* Change Password Block */}
            <div className={`p-6 md:p-8 rounded-2xl border ${
              darkMode ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-100 shadow-sm'
            }`}>
              <h3 className={`text-base md:text-lg font-black border-b pb-3 mb-5 border-gray-100 dark:border-gray-850 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Keamanan Akun: Ganti Password
              </h3>

              <form onSubmit={handleUpdatePassword} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className={`text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Password Lama</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                    <input
                      type="password"
                      value={passLama}
                      onChange={(e) => setPassLama(e.target.value)}
                      placeholder="Masukkan password saat ini"
                      className={`w-full p-3 pl-10 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden ${
                        darkMode ? 'bg-gray-900 border-gray-850 text-white' : 'bg-white border-gray-200 text-gray-800'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={`text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Password Baru</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                    <input
                      type="password"
                      value={passBaru}
                      onChange={(e) => setPassBaru(e.target.value)}
                      placeholder="Minimum 6 karakter"
                      className={`w-full p-3 pl-10 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden ${
                        darkMode ? 'bg-gray-900 border-gray-850 text-white' : 'bg-white border-gray-200 text-gray-800'
                      }`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 cursor-pointer active:scale-95 transition-all"
                >
                  Perbarui Password Akun
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
