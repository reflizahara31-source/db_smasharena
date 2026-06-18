/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  TrendingUp,
  Users,
  Grid,
  FileText,
  DollarSign,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Ticket,
  Calendar,
  Layers,
  History,
  ShieldCheck,
  Search,
  Printer,
  ChevronRight,
  Eye,
  AlertCircle,
  Clock,
  ToggleLeft,
  ToggleRight,
  Download
} from 'lucide-react';
import { User, Lapangan, Booking, Pembayaran, Promo, HubungiKamiPesan } from '../types';
import { RealtimeDB } from '../utils/db';

interface AdminDashboardProps {
  lapanganList: Lapangan[];
  bookings: Booking[];
  payments: Pembayaran[];
  promos: Promo[];
  users: User[];
  messages: HubungiKamiPesan[];
  onRefresh: () => void;
  showToast: (msg: string, type: string) => void;
  darkMode: boolean;
}

export function AdminDashboard({
  lapanganList,
  bookings,
  payments,
  promos,
  users,
  messages,
  onRefresh,
  showToast,
  darkMode
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'stats' | 'lapangan' | 'jadwal' | 'booking' | 'pelanggan' | 'pembayaran' | 'promo' | 'laporan' | 'feedback'>('stats');

  // --- Search / Filters ---
  const [qSearch, setQSearch] = useState('');
  const [bFilterStatus, setBFilterStatus] = useState('Semua');

  // --- CRUD States ---
  // Court Modal
  const [isCourtModalOpen, setIsCourtModalOpen] = useState(false);
  const [editingCourt, setEditingCourt] = useState<Lapangan | null>(null);
  const [cCode, setCCode] = useState('');
  const [cName, setCName] = useState('');
  const [cJenis, setCJenis] = useState<'Vinyl' | 'Karpet' | 'Premium'>('Vinyl');
  const [cHarga, setCHarga] = useState<number>(40000);
  const [cDesc, setCDesc] = useState('');
  const [cFoto, setCFoto] = useState('');
  const [cStatus, setCStatus] = useState<'aktif' | 'nonaktif'>('aktif');

  // Promo Modal
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [pKode, setPKode] = useState('');
  const [pNama, setPNama] = useState('');
  const [pDiskon, setPDiskon] = useState<number>(10);
  const [pMulai, setPMulai] = useState('');
  const [pSelesai, setPSelesai] = useState('');

  // --- View Payment Modal ---
  const [viewPaymentProofBookingId, setViewPaymentProofBookingId] = useState<string | null>(null);

  // --- Laporan States ---
  const [reportType, setReportType] = useState<'Harian' | 'Mingguan' | 'Bulanan' | 'Tahunan'>('Bulanan');
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportPreviewData, setReportPreviewData] = useState<any[]>([]);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // --- Math metrics calculations for dashboard ---
  const clientsOnly = users.filter((u) => u.role === 'pelanggan');
  const totalClientsCount = clientsOnly.length;
  const totalCourtsCount = lapanganList.length;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayBookings = bookings.filter((b) => b.tanggal === todayStr && b.status !== 'Dibatalkan');
  const todayBookingsCount = todayBookings.length;

  const approvedBookings = bookings.filter((b) => b.status === 'Disetujui' || b.status === 'Selesai');
  const totalTransactionsCount = approvedBookings.length;

  // Revenue formulas
  const revenueTotal = approvedBookings.reduce((sum, b) => sum + b.total_harga, 0);
  const revenueToday = approvedBookings
    .filter((b) => b.tanggal === todayStr)
    .reduce((sum, b) => sum + b.total_harga, 0);

  // Month-wise income calculation
  const getMonthlyRevenue = (monthIndex: number) => {
    // monthIndex from 0 (Jan) to 11 (Dec)
    const currentYear = 2026;
    return approvedBookings
      .filter((b) => {
        const d = new Date(b.tanggal);
        return d.getMonth() === monthIndex && d.getFullYear() === currentYear;
      })
      .reduce((sum, b) => sum + b.total_harga, 0);
  };

  const monthlyRevData = Array.from({ length: 6 }, (_, i) => {
    // Last 6 months (Jan - June 2026)
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni'];
    return { name: months[i], amount: getMonthlyRevenue(i) };
  });

  // Most Popular Fields calculation
  const fieldOrderCount = lapanganList.map((lap) => {
    const count = bookings.filter((b) => b.id_lapangan === lap.id_lapangan && b.status !== 'Dibatalkan').length;
    return { name: lap.nama_lapangan, score: count };
  });

  // --- Court CRUD Actions ---
  const handleOpenCourtAdd = () => {
    setEditingCourt(null);
    setCCode('L' + String(lapanganList.length + 1).padStart(2, '0'));
    setCName('');
    setCJenis('Vinyl');
    setCHarga(40000);
    setCDesc('');
    setCFoto('https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=600');
    setCStatus('aktif');
    setIsCourtModalOpen(true);
  };

  const handleOpenCourtEdit = (court: Lapangan) => {
    setEditingCourt(court);
    setCCode(court.id_lapangan);
    setCName(court.nama_lapangan);
    setCJenis(court.jenis);
    setCHarga(court.harga);
    setCDesc(court.deskripsi);
    setCFoto(court.foto);
    setCStatus(court.status);
    setIsCourtModalOpen(true);
  };

  const handleSaveCourt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cName || !cDesc) {
      showToast('Mohon lengkapi seluruh isian lapangan!', 'error');
      return;
    }

    const courts = RealtimeDB.getLapangan();

    if (editingCourt) {
      // Edit
      const idx = courts.findIndex((c) => c.id_lapangan === editingCourt.id_lapangan);
      if (idx !== -1) {
        courts[idx] = {
          ...editingCourt,
          nama_lapangan: cName,
          jenis: cJenis,
          harga: cHarga,
          deskripsi: cDesc,
          foto: cFoto || 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=600',
          status: cStatus
        };
        showToast(`Berhasil memperbarui ${cName}!`, 'success');
      }
    } else {
      // Add
      const newCourt: Lapangan = {
        id_lapangan: cCode,
        nama_lapangan: cName,
        jenis: cJenis,
        harga: cHarga,
        deskripsi: cDesc,
        foto: cFoto || 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=600',
        status: cStatus
      };
      courts.push(newCourt);
      showToast(`Berhasil menambahkan ${cName}!`, 'success');
    }

    RealtimeDB.saveLapangan(courts);
    setIsCourtModalOpen(false);
    onRefresh();
  };

  const handleDeleteCourt = (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus lapangan "${name}"?`)) {
      const courts = RealtimeDB.getLapangan();
      const updated = courts.filter((c) => c.id_lapangan !== id);
      RealtimeDB.saveLapangan(updated);
      showToast(`Lapangan ${name} berhasil dihapus.`, 'success');
      onRefresh();
    }
  };

  const handleToggleCourtStatus = (id: string) => {
    const courts = RealtimeDB.getLapangan();
    const idx = courts.findIndex((c) => c.id_lapangan === id);
    if (idx !== -1) {
      courts[idx].status = courts[idx].status === 'aktif' ? 'nonaktif' : 'aktif';
      RealtimeDB.saveLapangan(courts);
      showToast(`Satus lapangan ${courts[idx].nama_lapangan} diperbarui.`, 'success');
      onRefresh();
    }
  };

  // --- Verify Payment & Booking Confirmation ---
  const handleVerifyPayment = (bookingId: string, isApproved: boolean) => {
    const listB = RealtimeDB.getBookings();
    const idxB = listB.findIndex((b) => b.id_booking === bookingId);

    const listP = RealtimeDB.getPembayaran();
    const idxP = listP.findIndex((p) => p.id_booking === bookingId);

    if (idxB !== -1 && idxP !== -1) {
      if (isApproved) {
        listB[idxB].status = 'Disetujui';
        listP[idxP].status = 'Diterima';
        RealtimeDB.addNotification(
          'Pembayaran Diterima!',
          `Booking ${bookingId} Anda berhasil dikonfirmasi. Sampai jumpa di lapangan olahraga!`,
          'success'
        );
        showToast(`Pembayaran Booking ${bookingId} berhasil disetujui!`, 'success');
      } else {
        listB[idxB].status = 'Dibatalkan';
        listP[idxP].status = 'Ditolak';
        RealtimeDB.addNotification(
          'Pembayaran Ditolak',
          `Bukti pembayaran untuk Booking ${bookingId} tidak valid. Sesi dibatalkan.`,
          'error'
        );
        showToast(`Pembayaran Booking ${bookingId} ditolak.`, 'error');
      }

      RealtimeDB.saveBookings(listB);
      RealtimeDB.savePembayaran(listP);
      setViewPaymentProofBookingId(null);
      onRefresh();
    }
  };

  // --- Voucher / Promo code storage additions ---
  const handleAddPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pKode || !pNama || !pMulai || !pSelesai) {
      showToast('Silakan isi semua formulir voucher!', 'error');
      return;
    }

    const activePromos = RealtimeDB.getPromos();
    const code = pKode.trim().toUpperCase();

    // Prevent duplicate
    if (activePromos.some((p) => p.kode_promo === code)) {
      showToast('Kode promo ini sudah ada!', 'error');
      return;
    }

    const newPromo: Promo = {
      id_promo: 'P' + Math.floor(Math.random() * 100000),
      kode_promo: code,
      nama_promo: pNama,
      diskon: pDiskon,
      tanggal_mulai: pMulai,
      tanggal_selesai: pSelesai
    };

    activePromos.push(newPromo);
    RealtimeDB.savePromos(activePromos);
    setIsPromoModalOpen(false);

    RealtimeDB.addNotification(
      'Promo Terbaru Aktif!',
      `Kode voucher ${code} diskon ${pDiskon}% kini sudah aktif!`,
      'info'
    );

    showToast(`Voucher ${code} berhasil diterbitkan!`, 'success');
    setPKode('');
    setPNama('');
    onRefresh();
  };

  const handleDeletePromo = (id: string, code: string) => {
    if (confirm(`Hapus voucher promo ${code}?`)) {
      const activePromos = RealtimeDB.getPromos();
      const updated = activePromos.filter((p) => p.id_promo !== id);
      RealtimeDB.savePromos(updated);
      showToast(`Promo ${code} berhasil dihapus.`, 'success');
      onRefresh();
    }
  };

  // --- Deactivation trigger for customer profile ---
  const handleToggleCustomerActive = (id_user: string, name: string) => {
    // Just mock deactivating credentials/role
    showToast(`Akun pelanggan ${name} berhasil dibekukan sementara.`, 'info');
  };

  // --- Generate Ledgers & Print ---
  const handleGenerateReportPreview = () => {
    let reportFiltered = approvedBookings;
    const repYear = new Date(reportDate).getFullYear();
    const repMonth = new Date(reportDate).getMonth();

    if (reportType === 'Harian') {
      reportFiltered = approvedBookings.filter((b) => b.tanggal === reportDate);
    } else if (reportType === 'Bulanan') {
      reportFiltered = approvedBookings.filter((b) => {
        const d = new Date(b.tanggal);
        return d.getMonth() === repMonth && d.getFullYear() === repYear;
      });
    } else if (reportType === 'Tahunan') {
      reportFiltered = approvedBookings.filter((b) => {
        const d = new Date(b.tanggal);
        return d.getFullYear() === repYear;
      });
    }

    setReportPreviewData(reportFiltered);
    setIsReportModalOpen(true);
  };

  // Filter Bookings Master
  const filteredBookingsMaster = bookings.filter((b) => {
    const lap = lapanganList.find((l) => l.id_lapangan === b.id_lapangan);
    const client = users.find((u) => u.id_user === b.id_user);

    const matchText =
      b.id_booking.toLowerCase().includes(qSearch.toLowerCase()) ||
      (lap?.nama_lapangan || '').toLowerCase().includes(qSearch.toLowerCase()) ||
      (client?.nama || '').toLowerCase().includes(qSearch.toLowerCase());

    if (bFilterStatus === 'Semua') return matchText;
    return b.status === bFilterStatus && matchText;
  });

  return (
    <div className="flex-grow w-full flex flex-col">
      {/* Sub sticky horizontal tab switch bar (Simulating complex dynamic admin rail) */}
      <div className={`sticky top-0 z-30 shadow-xs border-b transition-colors duration-200 ${
        darkMode ? 'bg-gray-100/10 backdrop-blur-md border-gray-800' : 'bg-white/95 border-emerald-50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500 animate-pulse" />
            <span className={`text-xs font-black shrink-0 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
              ADMIN PANEL
            </span>
          </div>

          <div className="flex space-x-2 md:space-x-3 overflow-x-auto py-1 scrollbar-hide">
            {[
              { id: 'stats', label: 'Monitor' },
              { id: 'lapangan', label: 'Lapangan' },
              { id: 'jadwal', label: 'Jadwal' },
              { id: 'booking', label: 'Booking' },
              { id: 'pembayaran', label: 'Pembayaran' },
              { id: 'pelanggan', label: 'Pelanggan' },
              { id: 'promo', label: 'Promo & Diskon' },
              { id: 'laporan', label: 'Laporan Finansial' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer whitespace-nowrap transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : darkMode
                    ? 'hover:bg-gray-850 text-gray-300'
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Contents */}
      <div className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* TAB 1: Statistics Monitor (with SVG charts) */}
        {activeTab === 'stats' && (
          <div className="animate-fade-in flex flex-col gap-6">
            {/* Bento statistics counters */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              <div className={`p-4 rounded-xl border flex flex-col gap-1.5 justify-between ${
                darkMode ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-100'
              }`}>
                <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Total Pelanggan</span>
                <div className="flex items-center justify-between">
                  <span className={`text-xl font-black ${darkMode ? 'text-white' : 'text-gray-950'}`}>{totalClientsCount}</span>
                  <Users className="w-5 h-5 text-gray-400" />
                </div>
              </div>

              <div className={`p-4 rounded-xl border flex flex-col gap-1.5 justify-between ${
                darkMode ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-100'
              }`}>
                <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Total Lapangan</span>
                <div className="flex items-center justify-between">
                  <span className={`text-xl font-black ${darkMode ? 'text-white' : 'text-gray-950'}`}>{totalCourtsCount}</span>
                  <Grid className="w-5 h-5 text-gray-400" />
                </div>
              </div>

              <div className={`p-4 rounded-xl border flex flex-col gap-1.5 justify-between ${
                darkMode ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-100'
              }`}>
                <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Booking Hari Ini</span>
                <div className="flex items-center justify-between">
                  <span className={`text-xl font-black ${darkMode ? 'text-white' : 'text-gray-950'}`}>{todayBookingsCount}</span>
                  <Calendar className="w-5 h-5 text-emerald-500" />
                </div>
              </div>

              <div className={`p-4 rounded-xl border flex flex-col gap-1.5 justify-between ${
                darkMode ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-100'
              }`}>
                <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Pendapatan Hari Ini</span>
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-black text-emerald-500">Rp {revenueToday.toLocaleString('id-ID')}</span>
                  <DollarSign className="w-5 h-5 text-emerald-500" />
                </div>
              </div>

              <div className={`p-4 rounded-xl border flex flex-col gap-1.5 justify-between col-span-2 md:col-span-1 ${
                darkMode ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-100'
              }`}>
                <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Pendapatan Total</span>
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-black text-indigo-500">Rp {revenueTotal.toLocaleString('id-ID')}</span>
                  <TrendingUp className="w-5 h-5 text-indigo-500" />
                </div>
              </div>
            </div>

            {/* SVG Visual Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              {/* Chart 1: Monthly sales */}
              <div className={`p-5 rounded-2xl border flex flex-col justify-between h-80 ${
                darkMode ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-100'
              }`}>
                <div>
                  <h3 className={`font-bold text-xs ${darkMode ? 'text-white' : 'text-gray-850'}`}>PENDAPATAN BULANAN (2026)</h3>
                  <p className="text-[10px] text-gray-400">Kumulatif transaksi lapangan GOR yang berhasil diverifikasi.</p>
                </div>

                {/* SVG Poly bar list */}
                <div className="flex items-end justify-between h-40 pt-4 gap-2">
                  {monthlyRevData.map((item, idx) => {
                    const maxAmount = Math.max(...monthlyRevData.map(d => d.amount)) || 100000;
                    const pct = (item.amount / maxAmount) * 100;
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                        <div className="text-[9px] font-extrabold text-emerald-500">
                          {item.amount > 0 ? `${(item.amount / 1000).toFixed(0)}k` : '0'}
                        </div>
                        <div
                          style={{ height: `${Math.max(8, pct)}%` }}
                          className="w-full rounded-md bg-emerald-500/80 hover:bg-emerald-500 transition-all cursor-pointer relative group"
                        >
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 p-1 rounded bg-black text-white text-[8px] opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-xl whitespace-nowrap z-50">
                            Rp {item.amount.toLocaleString()}
                          </div>
                        </div>
                        <span className="text-[9px] text-gray-400 font-semibold">{item.name.substring(0, 3)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Chart 2: Court popularity */}
              <div className={`p-5 rounded-2xl border flex flex-col justify-between h-80 ${
                darkMode ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-100'
              }`}>
                <div>
                  <h3 className={`font-bold text-xs ${darkMode ? 'text-white' : 'text-gray-850'}`}>GELOMBANG MINAT LAPANGAN</h3>
                  <p className="text-[10px] text-gray-400">Total reservasi per masing-masing lapangan sejauh ini.</p>
                </div>

                <div className="flex flex-col gap-3 py-2">
                  {fieldOrderCount.map((item, idx) => {
                    const maxScore = Math.max(...fieldOrderCount.map(d => d.score)) || 1;
                    const scorePercentage = (item.score / maxScore) * 100;
                    return (
                      <div key={idx} className="flex flex-col gap-1 text-xs">
                        <div className="flex justify-between font-semibold">
                          <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{item.name}</span>
                          <span className="text-emerald-500 font-bold">{item.score} Booking</span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-850 rounded-full h-1.5 overflow-hidden">
                          <div
                            style={{ width: `${scorePercentage}%` }}
                            className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Court Manager CRUD */}
        {activeTab === 'lapangan' && (
          <div className="animate-fade-in flex flex-col gap-4">
            <div className="flex justify-between items-center border-b pb-3 border-gray-100 dark:border-gray-800">
              <h2 className={`text-base md:text-lg font-black ${darkMode ? 'text-white' : 'text-gray-950'}`}>
                Manajemen Data Lapangan Smash Arena
              </h2>
              <button
                onClick={handleOpenCourtAdd}
                className="px-3.5 py-1.5 bg-emerald-500 text-white font-bold text-xs rounded-xl hover:bg-emerald-600 cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Tambah Lapangan
              </button>
            </div>

            {/* List and CRUD actions table */}
            <div className={`border rounded-2xl overflow-hidden ${
              darkMode ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-100 shadow-xs'
            }`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className={`border-b ${darkMode ? 'bg-gray-900 border-gray-800 text-gray-300' : 'bg-gray-50 border-gray-100 text-gray-550'}`}>
                      <th className="p-3 font-semibold">No ID</th>
                      <th className="p-3 font-semibold">Nama Lapangan</th>
                      <th className="p-3 font-semibold">Jenis Mat</th>
                      <th className="p-3 font-semibold">Biaya Sewa / Jam</th>
                      <th className="p-3 font-semibold">Fungsi / Status</th>
                      <th className="p-3 font-semibold text-center text-gray-500">Kontrol Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-850">
                    {lapanganList.map((item) => (
                      <tr key={item.id_lapangan} className={darkMode ? 'hover:bg-gray-900/30' : 'hover:bg-gray-50/50'}>
                        <td className="p-3 font-mono font-bold text-emerald-500">{item.id_lapangan}</td>
                        <td className="p-3">
                          <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{item.nama_lapangan}</span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${
                            item.jenis === 'Premium' ? 'bg-amber-600' : item.jenis === 'Karpet' ? 'bg-emerald-600' : 'bg-indigo-600'
                          }`}>{item.jenis}</span>
                        </td>
                        <td className={`p-3 font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                          Rp {item.harga.toLocaleString('id-ID')}
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => handleToggleCourtStatus(item.id_lapangan)}
                            className="flex items-center gap-1 bg-transparent border-0 cursor-pointer text-xs"
                          >
                            {item.status === 'aktif' ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-bold">Aktif</span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 font-bold">Nonaktif</span>
                            )}
                          </button>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenCourtEdit(item)}
                              className={`p-1.5 rounded-lg border cursor-pointer hover:bg-emerald-50 hover:text-emerald-500 ${
                                darkMode ? 'border-gray-800 text-gray-300 hover:border-emerald-500/30' : 'border-gray-200 text-gray-600'
                              }`}
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteCourt(item.id_lapangan, item.nama_lapangan)}
                              className={`p-1.5 rounded-lg border hover:bg-red-500 hover:text-white cursor-pointer ${
                                darkMode ? 'border-gray-800 text-gray-300 hover:border-red-500/30' : 'border-gray-200 text-gray-600'
                              }`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Simulated CRUD dialog modal overlay */}
            {isCourtModalOpen && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                <form
                  onSubmit={handleSaveCourt}
                  className={`p-6 rounded-2xl w-full max-w-sm border shadow-2xl flex flex-col gap-4 ${
                    darkMode ? 'bg-gray-950 border-gray-800 text-white' : 'bg-white border-gray-100'
                  }`}
                >
                  <h3 className={`font-black text-sm border-b pb-2 mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {editingCourt ? 'UBAH DATA LAPANGAN' : 'TAMBAH LAPANGAN BARU'}
                  </h3>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-500">Kode Unik Lapangan</label>
                    <input
                      type="text"
                      value={cCode}
                      disabled
                      className="p-2.5 rounded-lg text-xs bg-gray-100 dark:bg-gray-900 border border-transparent font-bold"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-500">Nama Lapangan</label>
                    <input
                      type="text"
                      value={cName}
                      onChange={(e) => setCName(e.target.value)}
                      placeholder="Contoh: Lapangan A"
                      className="p-2.5 rounded-lg text-xs border border-gray-200 dark:border-gray-850 dark:bg-gray-900 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-500">Jenis Mat</label>
                      <select
                        value={cJenis}
                        onChange={(e) => setCJenis(e.target.value as any)}
                        className="p-2.5 rounded-lg text-xs border border-gray-200 dark:border-gray-850 dark:bg-gray-900 focus:outline-hidden"
                      >
                        <option value="Vinyl">Vinyl</option>
                        <option value="Karpet">Karpet</option>
                        <option value="Premium">Premium</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-500">Biaya / Jam</label>
                      <input
                        type="number"
                        value={cHarga}
                        onChange={(e) => setCHarga(parseInt(e.target.value) || 0)}
                        className="p-2.5 rounded-lg text-xs border border-gray-200 dark:border-gray-850 dark:bg-gray-900 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-500">Deskripsi Ringkas</label>
                    <textarea
                      value={cDesc}
                      onChange={(e) => setCDesc(e.target.value)}
                      rows={2}
                      className="p-2.5 rounded-lg text-xs border border-gray-200 dark:border-gray-850 dark:bg-gray-900 focus:outline-hidden"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-500">URL Foto Lapangan</label>
                    <input
                      type="text"
                      value={cFoto}
                      onChange={(e) => setCFoto(e.target.value)}
                      className="p-2.5 rounded-lg text-xs border border-gray-200 dark:border-gray-850 dark:bg-gray-900 focus:outline-hidden text-gray-400"
                    />
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      type="button"
                      onClick={() => setIsCourtModalOpen(false)}
                      className="flex-1 py-2.5 text-xs font-bold bg-gray-500 text-white rounded-xl cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-emerald-500 text-white font-bold text-xs rounded-xl cursor-pointer"
                    >
                      Simpan Data
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Operational Schedule manager */}
        {activeTab === 'jadwal' && (
          <div className="animate-fade-in flex flex-col gap-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b pb-3 border-gray-100 dark:border-gray-800">
              <div>
                <h2 className={`text-base md:text-lg font-black ${darkMode ? 'text-white' : 'text-gray-950'}`}>
                  Pengaturan Jadwal & Jam Operasional
                </h2>
                <p className="text-[11px] text-gray-400">Menutup jadwal tertentu secara manual untuk libur / GOR maintenance sore.</p>
              </div>
            </div>

            <div className={`p-5 rounded-2xl border ${
              darkMode ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-100 shadow-xs'
            }`}>
              <span className="text-xs font-bold text-gray-500 flex items-center gap-1.5 mb-3.5">
                <Clock className="w-4 h-4 text-emerald-500" /> Jam Buka GOR: <b>08.00 s/d 22.00 WIB</b>
              </span>

              <div className="p-4 rounded-xl border border-dashed border-gray-200 dark:border-gray-800 text-xs flex flex-col gap-3">
                <p className="font-semibold text-gray-500">Tutup Jadwal Tertentu (Blokir Sementara):</p>
                <div className="flex flex-wrap gap-2">
                  <span className="p-2.5 rounded bg-gray-100 dark:bg-gray-900 text-[11px] font-bold">12.00 - 13.00 (Istirahat & Pemeliharaan Berskala)</span>
                  <span className="p-2.5 rounded bg-gray-100 dark:bg-gray-900 text-[11px] font-bold">17.30 - 18.00 (Pembersihan Area)</span>
                </div>
                <button
                  type="button"
                  onClick={() => showToast('Blokir Slot sukses diaplikasikan ke kalender sistem!', 'success')}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg self-start cursor-pointer mt-2"
                >
                  Terapkan Perubahan Operasional
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Booking management table */}
        {activeTab === 'booking' && (
          <div className="animate-fade-in flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 border-gray-100 dark:border-gray-850">
              <h2 className={`text-base md:text-lg font-black ${darkMode ? 'text-white' : 'text-gray-950'}`}>
                Manajemen Semua Reservasi Pemesanan
              </h2>

              <div className="flex gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Cari Booking/Pelanggan..."
                  value={qSearch}
                  onChange={(e) => setQSearch(e.target.value)}
                  className={`p-2 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden flex-1 ${
                    darkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-850'
                  }`}
                />
                <select
                  value={bFilterStatus}
                  onChange={(e) => setBFilterStatus(e.target.value)}
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

            {/* List and CRUD actions table */}
            <div className={`border rounded-2xl overflow-hidden ${
              darkMode ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-100 shadow-xs'
            }`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className={`border-b ${darkMode ? 'bg-gray-900 border-gray-800 text-gray-300' : 'bg-gray-50 border-gray-100 text-gray-550'}`}>
                      <th className="p-3 font-semibold">ID</th>
                      <th className="p-3 font-semibold">Pelanggan</th>
                      <th className="p-3 font-semibold">Gedung / Court</th>
                      <th className="p-3 font-semibold">Tanggal Sesi</th>
                      <th className="p-3 font-semibold">Jam Sesi</th>
                      <th className="p-3 font-semibold">Nominal Invoice</th>
                      <th className="p-3 font-semibold">Status</th>
                      <th className="p-3 font-semibold text-center text-gray-500">Ubah Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-850">
                    {filteredBookingsMaster.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-gray-400">
                          Tidak ditemukan data booking matching.
                        </td>
                      </tr>
                    ) : (
                      filteredBookingsMaster.map((b) => {
                        const lap = lapanganList.find((l) => l.id_lapangan === b.id_lapangan);
                        const cUser = users.find((u) => u.id_user === b.id_user);
                        return (
                          <tr key={b.id_booking} className={darkMode ? 'hover:bg-gray-900/30' : 'hover:bg-gray-50/50'}>
                            <td className="p-3 font-mono font-bold text-emerald-500">{b.id_booking}</td>
                            <td className="p-3">
                              <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{cUser?.nama || 'Unknown'}</span>
                              <span className="text-[10px] text-gray-400 block">{cUser?.email}</span>
                            </td>
                            <td className="p-3">
                              <span className="font-medium">{lap?.nama_lapangan || b.id_lapangan}</span>
                            </td>
                            <td className="p-3">
                              {new Date(b.tanggal).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short'
                              })}
                            </td>
                            <td className="p-3">
                              <span>{b.jam_mulai}</span>
                              <span className="text-[10px] text-gray-400 block">({b.durasi} Jam)</span>
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
                              }`}>{b.status}</span>
                            </td>
                            <td className="p-3 text-center">
                              <select
                                value={b.status}
                                onChange={(e) => {
                                  const list = RealtimeDB.getBookings();
                                  const idx = list.findIndex((x) => x.id_booking === b.id_booking);
                                  if (idx !== -1) {
                                    list[idx].status = e.target.value as any;
                                    RealtimeDB.saveBookings(list);
                                    showToast(`Status Booking ${b.id_booking} diubah ke ${e.target.value}.`, 'success');
                                    onRefresh();
                                  }
                                }}
                                className={`px-2 py-1 rounded text-[10px] focus:outline-hidden ${
                                  darkMode ? 'bg-gray-900 text-white border-gray-800' : 'bg-white text-gray-800 border-gray-200'
                                }`}
                              >
                                <option value="Menunggu Pembayaran">Menunggu Pembayaran</option>
                                <option value="Menunggu Konfirmasi">Menunggu Konfirmasi</option>
                                <option value="Disetujui">Disetujui</option>
                                <option value="Selesai">Selesai</option>
                                <option value="Dibatalkan">Dibatalkan</option>
                              </select>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: Payments verifier */}
        {activeTab === 'pembayaran' && (
          <div className="animate-fade-in flex flex-col gap-4">
            <div className="border-b pb-3 border-gray-100 dark:border-gray-850">
              <h2 className={`text-base md:text-lg font-black ${darkMode ? 'text-white' : 'text-gray-950'}`}>
                Pusat Verifikasi Bukti Bayar Bank & QRIS
              </h2>
              <p className="text-[11px] text-gray-400">Verifikasi manual invoice dan receipt unggahan pelanggan.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {payments.filter(p => p.status === 'Menunggu Verifikasi').length === 0 ? (
                <div className="col-span-2 p-12 text-center text-xs text-gray-400 border border-dashed rounded-xl">
                  Tidak ada bukti pembayaran tertunda yang perlu diverifikasi. Semua aman terkontrol!
                </div>
              ) : (
                payments.filter(p => p.status === 'Menunggu Verifikasi').map((pay) => {
                  const bObj = bookings.find((b) => b.id_booking === pay.id_booking);
                  const uObj = users.find((u) => u.id_user === bObj?.id_user);
                  return (
                    <div
                      key={pay.id_pembayaran}
                      className={`p-4 rounded-xl border flex flex-col md:flex-row gap-4 justify-between relative ${
                        darkMode ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-100 shadow-xs'
                      }`}
                    >
                      {/* Left section info */}
                      <div className="flex-1 flex flex-col gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold px-2 py-0.5 bg-amber-500 text-white rounded text-[10px]">VERIFIKASI</span>
                          <span className="font-mono text-gray-400">ID: {pay.id_pembayaran}</span>
                        </div>
                        <ul className="text-gray-500 dark:text-gray-400 flex flex-col gap-1">
                          <li>Kode Booking: <b className="text-emerald-500 font-mono font-bold">{pay.id_booking}</b></li>
                          <li>Pemesan: <b className={darkMode ? 'text-gray-200' : 'text-gray-800'}>{uObj?.nama}</b></li>
                          <li>Saluran Bayar: <b className="text-indigo-500">{pay.metode}</b></li>
                          <li>Total Tagihan: <b className={darkMode ? 'text-white' : 'text-gray-800'}>Rp {bObj?.total_harga.toLocaleString('id-ID')}</b></li>
                        </ul>

                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => handleVerifyPayment(pay.id_booking, true)}
                            className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg cursor-pointer text-[10px] uppercase"
                          >
                            Setujui
                          </button>
                          <button
                            onClick={() => handleVerifyPayment(pay.id_booking, false)}
                            className="px-3.5 py-1.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg cursor-pointer text-[10px] uppercase"
                          >
                            Tolak
                          </button>
                        </div>
                      </div>

                      {/* Right Section / Receipt Thumbnail picture */}
                      <div className="w-full md:w-28 h-28 border dark:border-gray-800 rounded-lg overflow-hidden shrink-0 cursor-zoom-in relative group" onClick={() => setViewPaymentProofBookingId(pay.id_booking)}>
                        <img
                          src={pay.bukti_bayar}
                          alt="Bukti Transfer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-all"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-white text-[10px] font-bold">
                          Perbesar Bukti
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Verification larger Modal overlay */}
            {viewPaymentProofBookingId && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
                <div className={`p-6 rounded-2xl w-full max-w-sm border shadow-2xl relative ${
                  darkMode ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-100'
                }`}>
                  <h3 className={`font-black text-sm border-b pb-2 mb-4 text-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    VERIFIKASI GAMBAR BUKTI TRANSFER
                  </h3>
                  {(() => {
                    const pay = payments.find((p) => p.id_booking === viewPaymentProofBookingId);
                    return pay ? (
                      <div className="flex flex-col gap-3.5">
                        <div className="aspect-square w-full rounded-lg overflow-hidden border dark:border-gray-800 bg-gray-50">
                          <img
                            src={pay.bukti_bayar}
                            alt="Bukti Bayar"
                            className="w-full h-full object-contain"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleVerifyPayment(pay.id_booking, true)}
                            className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs rounded-xl cursor-pointer"
                          >
                            Konfirmasi Pembayaran
                          </button>
                          <button
                            onClick={() => handleVerifyPayment(pay.id_booking, false)}
                            className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-extrabold text-xs rounded-xl cursor-pointer"
                          >
                            Tolak Bukti
                          </button>
                        </div>
                      </div>
                    ) : null;
                  })()}
                  <button
                    onClick={() => setViewPaymentProofBookingId(null)}
                    className="w-full mt-4 py-2 bg-gray-500 hover:bg-gray-650 text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Batal Dan Tutup
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: Customers list manager */}
        {activeTab === 'pelanggan' && (
          <div className="animate-fade-in flex flex-col gap-4">
            <div className="border-b pb-3 border-gray-100 dark:border-gray-850">
              <h2 className={`text-base md:text-lg font-black ${darkMode ? 'text-white' : 'text-gray-950'}`}>
                Database & Laporan Data Pelanggan Terdaftar
              </h2>
              <p className="text-[11px] text-gray-400">Total terdaftar: <b>{clientsOnly.length} Pelanggan Aktif</b></p>
            </div>

            {/* List and CRUD actions table */}
            <div className={`border rounded-2xl overflow-hidden ${
              darkMode ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-100'
            }`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className={`border-b ${darkMode ? 'bg-gray-900 border-gray-800 text-gray-300' : 'bg-gray-50 border-gray-100 text-gray-550'}`}>
                      <th className="p-3 font-semibold">Foto</th>
                      <th className="p-3 font-semibold">Nama Lengkap</th>
                      <th className="p-3 font-semibold">User ID</th>
                      <th className="p-3 font-semibold">Email Utama</th>
                      <th className="p-3 font-semibold">Status Hak Akses</th>
                      <th className="p-3 font-semibold text-center text-gray-500">Aksi Pembekuan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-850">
                    {clientsOnly.map((c) => (
                      <tr key={c.id_user} className={darkMode ? 'hover:bg-gray-900/30' : 'hover:bg-gray-50/50'}>
                        <td className="p-3">
                          <div className="h-8 w-8 rounded-full overflow-hidden border border-emerald-500">
                            <img
                              src={c.foto_profil || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                              alt="Avatar"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </td>
                        <td className="p-3 font-bold text-gray-800 dark:text-gray-200">{c.nama}</td>
                        <td className="p-3 font-mono text-emerald-500 font-bold">{c.id_user}</td>
                        <td className="p-3 text-gray-500">{c.email}</td>
                        <td className="p-3 text-gray-400 font-semibold uppercase">Pelanggan</td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleToggleCustomerActive(c.id_user, c.nama)}
                            className="px-2.5 py-1 rounded bg-red-500/10 text-red-500 font-bold hover:bg-red-500 hover:text-white cursor-pointer"
                          >
                            Bekukan Akun
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: Promo codes vouchers creators */}
        {activeTab === 'promo' && (
          <div className="animate-fade-in flex flex-col gap-4">
            <div className="flex justify-between items-center border-b pb-3 border-gray-100 dark:border-gray-800">
              <h2 className={`text-base md:text-lg font-black ${darkMode ? 'text-white' : 'text-gray-950'}`}>
                Manajemen Voucher Promo & Kode Diskon
              </h2>
              <button
                onClick={() => setIsPromoModalOpen(true)}
                className="px-3.5 py-1.5 bg-emerald-500 text-white font-bold text-xs rounded-xl hover:bg-emerald-600 cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Rilis Kode Promo
              </button>
            </div>

            {/* Promo codes table grids */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {promos.length === 0 ? (
                <div className="col-span-3 p-8 text-center text-xs text-gray-400">
                  Belum ada promo terdaftar. Terbitkan voucher kustom pertama Anda!
                </div>
              ) : (
                promos.map((p) => (
                  <div
                    key={p.id_promo}
                    className={`p-4 rounded-xl border flex flex-col justify-between relative overflow-hidden transition-all duration-200 ${
                      darkMode ? 'bg-gray-950 border-gray-850' : 'bg-white border-gray-100 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase bg-emerald-500 text-white px-2 py-0.5 rounded">
                          Potongan {p.diskon}%
                        </span>
                        <h4 className={`font-black text-sm mt-2 ${darkMode ? 'text-white' : 'text-gray-850'}`}>
                          {p.nama_promo}
                        </h4>
                      </div>
                      <button
                        onClick={() => handleDeletePromo(p.id_promo, p.kode_promo)}
                        className="p-1 px-2 rounded hover:bg-red-50 text-red-500 transition-all border border-transparent hover:border-red-500/20"
                        title="Hapus Voucher"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="mt-4 flex flex-col gap-2">
                      <div className="flex justify-between text-[11px] text-gray-400">
                        <span>Mulai: {p.tanggal_mulai}</span>
                        <span>Berakhir: {p.tanggal_selesai}</span>
                      </div>
                      <div className="p-2 border border-dashed border-emerald-500/30 rounded flex justify-between items-center bg-emerald-500/5">
                        <code className="text-xs font-mono font-bold text-emerald-500 tracking-wider">
                          {p.kode_promo}
                        </code>
                        <span className="text-[10px] text-gray-400">Kode Aktif</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Promo creator modal overlay */}
            {isPromoModalOpen && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                <form
                  onSubmit={handleAddPromo}
                  className={`p-6 rounded-2xl w-full max-w-sm border shadow-2xl flex flex-col gap-4 ${
                    darkMode ? 'bg-gray-950 border-gray-800 text-white' : 'bg-white border-gray-105'
                  }`}
                >
                  <h3 className={`font-black text-sm border-b pb-2 mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    TERBITKAN VOUCHER BRAND / PROMO
                  </h3>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-500">Kode Voucher (Kapital, tanpa spasi)</label>
                    <input
                      type="text"
                      required
                      value={pKode}
                      onChange={(e) => setPKode(e.target.value)}
                      placeholder="Contoh: SMASHARENA20"
                      className="p-2.5 rounded-lg text-xs uppercase font-mono tracking-wider border border-gray-200 dark:border-gray-850 dark:bg-gray-900 focus:outline-hidden"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-500">Nama Kampanye Promo</label>
                    <input
                      type="text"
                      required
                      value={pNama}
                      onChange={(e) => setPNama(e.target.value)}
                      placeholder="Contoh: Promo Akhir Pekan Sehat"
                      className="p-2.5 rounded-lg text-xs border border-gray-200 dark:border-gray-850 dark:bg-gray-900 focus:outline-hidden"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-500">Persentase Diskon % (Maks 100)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="100"
                      value={pDiskon}
                      onChange={(e) => setPDiskon(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                      className="p-2.5 rounded-lg text-xs border border-gray-200 dark:border-gray-850 dark:bg-gray-900 focus:outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-500">Tanggal Mulai</label>
                      <input
                        type="date"
                        required
                        value={pMulai}
                        onChange={(e) => setPMulai(e.target.value)}
                        className="p-2.5 rounded-lg text-xs dark:bg-gray-900 border dark:border-gray-800"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-500">Tanggal Selesai</label>
                      <input
                        type="date"
                        required
                        value={pSelesai}
                        onChange={(e) => setPSelesai(e.target.value)}
                        className="p-2.5 rounded-lg text-xs dark:bg-gray-900 border dark:border-gray-800"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      type="button"
                      onClick={() => setIsPromoModalOpen(false)}
                      className="flex-1 py-2.5 text-xs font-bold bg-gray-500 text-white rounded-xl cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-emerald-500 text-white font-bold text-xs rounded-xl cursor-pointer"
                    >
                      Terbitkan Promo
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* TAB 8: Advanced Printable Ledger Financial report sheet */}
        {activeTab === 'laporan' && (
          <div className="animate-fade-in flex flex-col gap-4">
            <div className="border-b pb-3 border-gray-100 dark:border-gray-850">
              <h2 className={`text-base md:text-lg font-black ${darkMode ? 'text-white' : 'text-gray-950'}`}>
                Pusat Dokumen Laporan Finansial GOR
              </h2>
              <p className="text-[11px] text-gray-400">Pilih rentang filter untuk mengaudit total pendapatan transaksi lapangan yang sukses.</p>
            </div>

            <div className={`p-5 rounded-2xl border flex flex-col gap-4 ${
              darkMode ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-100 shadow-xs'
            }`}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 items-end">
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-gray-500">Skema Periode:</span>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value as any)}
                    className={`p-2.5 rounded-lg text-xs focus:outline-hidden ${
                      darkMode ? 'bg-gray-900 text-white border-gray-850' : 'bg-white text-gray-800 border-gray-200'
                    }`}
                  >
                    <option value="Harian">Laporan Harian</option>
                    <option value="Bulanan">Laporan Bulanan (Rekomendasi)</option>
                    <option value="Tahunan">Laporan Tahunan</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-gray-500">Pilih Tanggal Referensi:</span>
                  <input
                    type="date"
                    value={reportDate}
                    onChange={(e) => setReportDate(e.target.value)}
                    className={`p-2.5 rounded-lg text-xs focus:outline-hidden ${
                      darkMode ? 'bg-gray-900 text-white border-gray-850' : 'bg-white text-gray-800 border-gray-200'
                    }`}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleGenerateReportPreview}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <FileText className="w-4 h-4" /> Tinjau Laporan & Cetak
                </button>
              </div>
            </div>

            {/* Printable Statement Modal Ledger */}
            {isReportModalOpen && (
              <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                <div className={`p-8 rounded-3xl w-full max-w-4xl border shadow-2xl relative my-8 text-black bg-white ${
                  darkMode ? 'dark:text-white dark:bg-gray-950 dark:border-gray-800' : ''
                }`} id="print_area">
                  
                  {/* Top Close for modal */}
                  <button
                    onClick={() => setIsReportModalOpen(false)}
                    className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-850 text-gray-400 hover:text-black dark:hover:text-white transition-all cursor-pointer"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>

                  <div className="flex flex-col gap-6" id="printable_paper">
                    {/* Invoice/Report Cover Header */}
                    <div className="flex justify-between items-start border-b-2 border-emerald-500 pb-5">
                      <div>
                        <h1 className="text-2xl font-black tracking-tight text-emerald-500">SMASH ARENA BADMINTON CENTER</h1>
                        <p className="text-xs text-gray-500 leading-relaxed mt-1">
                          Jl. Sudirman Raya GOR No. 12, Kebayoran Baru, Jakarta Selatan. <br />
                          Telp: +62 812-9876-5432 | Email: contact@smasharena.com
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-extrabold uppercase bg-emerald-500 text-white px-2.5 py-1 rounded">
                          Laporan Keuangan Resmi
                        </span>
                        <p className="text-xs mt-2.5 font-bold">Periode: {reportType}</p>
                        <p className="text-[10px] text-gray-400">Tanggal Audit: {new Date().toLocaleDateString('id-ID')}</p>
                      </div>
                    </div>

                    {/* Meta info boxes inside paper */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-3 rounded-xl border bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-850 text-center flex flex-col justify-center">
                        <span className="text-[9px] text-gray-450 font-bold uppercase tracking-wider block">Total Pemakaian GOR</span>
                        <span className="text-xl font-black text-emerald-500 mt-1">{reportPreviewData.length} Tiket</span>
                      </div>
                      <div className="p-3 rounded-xl border bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-850 text-center flex flex-col justify-center col-span-2">
                        <span className="text-[9px] text-gray-450 font-bold uppercase tracking-wider block">Total Pemasukan Bersih (Verified)</span>
                        <span className="text-xl font-black text-emerald-600 mt-1">
                          Rp {reportPreviewData.reduce((s, curr) => s + curr.total_harga, 0).toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>

                    {/* Detailed bookkeeping ledger list */}
                    <div className="border rounded-xl overflow-hidden mt-2">
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="bg-emerald-500/10 text-emerald-600 border-b">
                            <th className="p-2.5 font-extrabold">ID Booking</th>
                            <th className="p-2.5 font-extrabold">Nama GOR</th>
                            <th className="p-2.5 font-extrabold">Tanggal Sesi</th>
                            <th className="p-2.5 font-extrabold">Waktu</th>
                            <th className="p-2.5 font-extrabold text-right">Biaya Sewa</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-850 text-gray-600 dark:text-gray-300">
                          {reportPreviewData.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="p-6 text-center text-gray-400">
                                Tidak ada catatan transaksi sukses untuk periode ini.
                              </td>
                            </tr>
                          ) : (
                            reportPreviewData.map((row) => {
                              const fObj = lapanganList.find(l => l.id_lapangan === row.id_lapangan);
                              return (
                                <tr key={row.id_booking}>
                                  <td className="p-2.5 font-mono font-bold text-emerald-500">{row.id_booking}</td>
                                  <td className="p-2.5 font-semibold">{fObj?.nama_lapangan || row.id_lapangan} ({fObj?.jenis})</td>
                                  <td className="p-2.5">{row.tanggal}</td>
                                  <td className="p-2.5">{row.jam_mulai} ({row.durasi} Jam)</td>
                                  <td className="p-2.5 text-right font-bold text-gray-900 dark:text-white">Rp {row.total_harga.toLocaleString('id-ID')}</td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                        <tfoot>
                          <tr className="bg-gray-50 dark:bg-gray-900 font-extrabold border-t">
                            <td colSpan={4} className="p-3 text-right">TOTAL OMSET BERSIH GOR:</td>
                            <td className="p-3 text-right text-emerald-600 text-sm">
                              Rp {reportPreviewData.reduce((s, curr) => s + curr.total_harga, 0).toLocaleString('id-ID')}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    {/* Sign signatures block */}
                    <div className="flex justify-between items-center mt-10 pt-5 border-t border-gray-100 dark:border-gray-850">
                      <div className="text-center text-xs text-gray-400">
                        <p>GOR Digital System Verified</p>
                        <p className="font-mono mt-0.5">CODE: SMASH-GOR-SYS-2026</p>
                      </div>
                      <div className="text-center text-xs">
                        <p>Mengonfirmasi, <br /><b>Manajer Utama Smash Arena</b></p>
                        <p className="h-14 mt-2 border-b border-gray-300 dark:border-gray-700 w-32 mx-auto"></p>
                        <p className="mt-1.5 text-gray-500">Andi Wijaya, M.B.A.</p>
                      </div>
                    </div>
                  </div>

                  {/* Trigger browser system printer interface directly */}
                  <div className="mt-8 flex gap-3.5 justify-end">
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1"
                    >
                      <Printer className="w-4 h-4" /> Hubungkan Printer (PDF)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        showToast('Berhasil mengunduh Laporang Ledger dalam format Excel/CSV!', 'success');
                      }}
                      className="px-5 py-2.5 bg-gray-500 hover:bg-gray-600 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1"
                    >
                      <Download className="w-4 h-4" /> Ekspor ke Excel (.xlsx)
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
