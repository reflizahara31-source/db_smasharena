/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  CalendarDays,
  MapPin,
  Phone,
  Mail,
  Send,
  Info,
  Layers,
  Sparkles,
  Search,
  ParkingCircle,
  Clock,
  Wifi,
  Tv,
  Utensils,
  Eye,
  Shield,
  Heart,
  BadgePercent,
  Check
} from 'lucide-react';
import { Lapangan, Booking, Promo } from '../types';
import { RealtimeDB } from '../utils/db';

interface TamuBerandaProps {
  lapanganList: Lapangan[];
  bookings: Booking[];
  promos: Promo[];
  onNavigateToLogin: () => void;
  onNavigateToRegister: () => void;
  showToast: (msg: string, type: string) => void;
  darkMode: boolean;
}

export function TamuBeranda({
  lapanganList,
  bookings,
  promos,
  onNavigateToLogin,
  onNavigateToRegister,
  showToast,
  darkMode
}: TamuBerandaProps) {
  const [activeTab, setActiveTab] = useState<'beranda' | 'cek_jadwal' | 'tentang' | 'hubungi'>('beranda');

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);

  // Schedule checker state
  const [selectedLapanganId, setSelectedLapanganId] = useState(lapanganList[0]?.id_lapangan || '');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Operational Hours
  const operasionalSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
    '20:00', '21:00'
  ];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) {
      showToast('Harap isi semua kolom formulir!', 'error');
      return;
    }

    setIsSubmittingContact(true);
    setTimeout(() => {
      const messages = RealtimeDB.getHubungiPesan();
      messages.push({
        id: 'M' + Math.floor(Math.random() * 100000),
        nama: contactName,
        email: contactEmail,
        pesan: contactMessage,
        tanggal: new Date().toISOString()
      });
      RealtimeDB.saveHubungiPesan(messages);

      // Save notification for admin
      RealtimeDB.addNotification(
        'Pesan Hubungi Kami baru',
        `Pesan baru dari ${contactName} (${contactEmail}) telah diterima.`,
        'info'
      );

      showToast('Pesan Anda berhasil dikirim! Admin kami akan menghubungi Anda segera.', 'success');
      setContactName('');
      setContactEmail('');
      setContactMessage('');
      setIsSubmittingContact(false);
    }, 800);
  };

  // Facility detail maps matching the requested elements
  const fasilitas = [
    { name: 'Area Parkir', desc: 'Parkir luas & aman untuk mobil & motor', icon: ParkingCircle },
    { name: 'Mushola', desc: 'Ruang ibadah bersih, lengkap dengan mukena', icon: Heart },
    { name: 'Toilet/Shower', desc: 'Toilet pria & wanita terpisah, air bersih hangat', icon: Check },
    { name: 'Kantin', desc: 'Menyediakan makanan, minuman penambah stamina', icon: Utensils },
    { name: 'WiFi Gratis', desc: 'Koneksi internet serat tinggi 100 Mbps', icon: Wifi },
    { name: 'Ruang Tunggu', desc: 'Lounge sofa nyaman ber AC dengan Smart TV', icon: Tv },
    { name: 'CCTV 24 Jam', desc: 'Pengawasan keamanan di seluruh area lapangan', icon: Eye },
    { name: 'Loker Penyimpanan', desc: 'Loker aman gratis untuk barang berharga Anda', icon: Shield }
  ];

  // Helper to check slot status
  const getSlotStatus = (lapanganId: string, date: string, time: string) => {
    // Check if lapangan is inactive
    const lap = lapanganList.find(l => l.id_lapangan === lapanganId);
    if (!lap || lap.status === 'nonaktif') return 'tidak_tersedia';

    // Find if there is any booking at this slot
    // We assume 1 hour duration slots
    // A booking matches if date is same, and the slot is within [jam_mulai, jam_mulai + durasi)
    const activeBookings = bookings.filter(b => b.status !== 'Dibatalkan' && b.status !== 'Menunggu Pembayaran');
    const isBooked = activeBookings.some(b => {
      if (b.id_lapangan !== lapanganId || b.tanggal !== date) return false;
      const startHour = parseInt(b.jam_mulai.split(':')[0]);
      const currentHour = parseInt(time.split(':')[0]);
      return currentHour >= startHour && currentHour < startHour + b.durasi;
    });

    if (isBooked) return 'sudah_dibooking';

    // Check if slot is in the past for today's date
    const todayStr = new Date().toISOString().split('T')[0];
    if (date === todayStr) {
      const currentHour = new Date().getHours();
      const slotHour = parseInt(time.split(':')[0]);
      if (slotHour <= currentHour) return 'tidak_tersedia';
    } else if (date < todayStr) {
      return 'tidak_tersedia';
    }

    return 'tersedia';
  };

  return (
    <div className="flex-1 w-full flex flex-col">
      {/* Sub-Navigation for Guest Options */}
      <div className={`sticky top-0 z-30 shadow-xs border-b transition-colors duration-200 ${
        darkMode ? 'bg-gray-900/95 border-gray-800' : 'bg-white/95 border-gray-100'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <div className="flex space-x-2 md:space-x-4 overflow-x-auto py-1 scrollbar-hide">
            {[
              { id: 'beranda', label: 'Beranda' },
              { id: 'cek_jadwal', label: 'Cek Jadwal Lapangan' },
              { id: 'tentang', label: 'Tentang Kami' },
              { id: 'hubungi', label: 'Hubungi Kami' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : darkMode
                    ? 'hover:bg-gray-800 text-gray-300'
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={onNavigateToLogin}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border hover:shadow-xs transition-all ${
                darkMode
                  ? 'border-gray-800 text-emerald-400 bg-gray-950 hover:bg-gray-800'
                  : 'border-emerald-200 text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={onNavigateToRegister}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer bg-emerald-500 text-white hover:bg-emerald-600 hover:shadow-sm transition-all"
            >
              Daftar Akun
            </button>
          </div>
        </div>
      </div>

      {/* --- Main Content Tab Switch --- */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col justify-start">
        {activeTab === 'beranda' && (
          <div className="animate-fade-in flex flex-col gap-10">
            {/* Hero Brand Section */}
            <div className={`p-8 md:p-12 rounded-3xl relative overflow-hidden border shadow-sm transition-all ${
              darkMode
                ? 'bg-gradient-to-br from-emerald-950/20 via-gray-950 to-gray-900 border-gray-800'
                : 'bg-gradient-to-br from-emerald-500/10 via-white to-gray-50 border-emerald-50'
            }`} id="hero_section">
              <div className="absolute right-0 top-0 w-1/3 h-full opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-400 via-emerald-100 to-transparent"></div>
              <div className="max-w-2xl relative z-10 flex flex-col gap-4">
                <span className="text-[11px] font-extrabold uppercase bg-emerald-400/15 text-emerald-500 px-3 py-1 rounded-full self-start tracking-wider">
                  Smash Arena Badminton Center
                </span>
                <h1 className={`text-3xl md:text-5xl font-extrabold tracking-tight leading-tight ${
                  darkMode ? 'text-white' : 'text-gray-950'
                }`}>
                  Main Lepas, Smash Keras <br/>
                  <span className="text-emerald-500">Booking Tanpa Batas!</span>
                </h1>
                <p className={`text-sm md:text-base leading-relaxed ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Nikmati pengalaman berolahraga bulu tangkis yang prestisius di Smash Arena. Lapangan kelas satu 
                  berkualitas internasional, fasilitas komprehensif, dan sistem pemesanan online real-time 
                  yang cepat & mudah.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 py-2 items-center">
                  <button
                    onClick={() => setActiveTab('cek_jadwal')}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <CalendarDays className="w-4 h-4" />
                    Cek Slot Jadwal Sekarang
                  </button>
                  <button
                    onClick={onNavigateToRegister}
                    className={`w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      darkMode
                        ? 'border-gray-800 text-gray-300 hover:bg-gray-800'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Bergabung Jadi Member
                  </button>
                </div>
              </div>
            </div>

            {/* Promo Banner Banner Carousel if available */}
            {promos.length > 0 && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <BadgePercent className="w-5 h-5 text-emerald-500" />
                  <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Promo Menarik Minggu Ini
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {promos.map(p => (
                    <div
                      key={p.id_promo}
                      className={`p-4 rounded-xl border flex flex-col justify-between relative overflow-hidden transition-all duration-200 ${
                        darkMode
                          ? 'bg-gray-900 border-gray-800 hover:border-emerald-500/50'
                          : 'bg-emerald-500/5 border-emerald-100 hover:border-emerald-500'
                      }`}
                    >
                      <div className="absolute right-0 bottom-0 text-[100px] font-black tracking-tighter text-emerald-500/5 select-none transform rotate-12 pointer-events-none">
                        {p.diskon}%
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-emerald-500 text-white rounded">
                            Voucher
                          </span>
                          <span className={`text-xs font-bold ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                            Diskon {p.diskon}%
                          </span>
                        </div>
                        <h4 className={`font-bold text-sm mt-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                          {p.nama_promo}
                        </h4>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                          Berlaku hingga: {new Date(p.tanggal_selesai).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className={`mt-3 p-2 rounded-lg border border-dashed flex items-center justify-between ${
                        darkMode ? 'bg-gray-950 border-gray-800' : 'bg-white border-emerald-200'
                      }`}>
                        <code className="text-xs font-mono font-bold text-emerald-500 tracking-wider">
                          {p.kode_promo}
                        </code>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(p.kode_promo);
                            showToast(`Kode promo ${p.kode_promo} berhasil disalin!`, 'success');
                          }}
                          className="text-[10px] font-semibold text-gray-400 hover:text-emerald-500 border-l border-gray-200 dark:border-gray-800 pl-2 cursor-pointer"
                        >
                          Salin
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* List and Photos of Courts */}
            <div id="section_lapangan" className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b pb-2 border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-emerald-500" />
                  <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    List Lapangan Pilihan
                  </h2>
                </div>
                <span className="text-xs text-gray-400 font-mono">
                  Menampilkan {lapanganList.length} Lapangan Aktif
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {lapanganList.map(item => (
                  <div
                    key={item.id_lapangan}
                    className={`rounded-2xl border overflow-hidden flex flex-col h-full shadow-xs hover:shadow-md transition-all duration-300 ${
                      darkMode ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-200'
                    }`}
                    id={`court_card_${item.id_lapangan}`}
                  >
                    {/* Cover Photo */}
                    <div className="relative aspect-video overflow-hidden group">
                      <img
                        src={item.foto}
                        alt={item.nama_lapangan}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-3 left-3 flex gap-1.5">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold text-white bg-black/60 backdrop-blur-xs flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-emerald-400" />
                          {item.id_lapangan}
                        </span>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold text-white shadow-sm ${
                          item.jenis === 'Premium'
                            ? 'bg-amber-600'
                            : item.jenis === 'Karpet'
                            ? 'bg-emerald-600'
                            : 'bg-indigo-600'
                        }`}>
                          {item.jenis}
                        </span>
                      </div>
                      <div className="absolute bottom-3 right-3">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold text-emerald-400 bg-gray-950/80 backdrop-blur-xs">
                          Rp {item.harga.toLocaleString('id-ID')}/jam
                        </span>
                      </div>
                    </div>

                    {/* Court Info */}
                    <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                      <div className="flex flex-col gap-1.5">
                        <h3 className={`font-bold text-base ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {item.nama_lapangan}
                        </h3>
                        <p className={`text-xs leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {item.deskripsi}
                        </p>
                      </div>

                      {/* CTA Panel */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-850">
                        <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span>Status: {item.status === 'aktif' ? 'Tersedia' : 'Tutup'}</span>
                        </div>
                        <button
                          onClick={onNavigateToLogin}
                          className="px-4 py-2 rounded-xl text-[11px] font-bold bg-emerald-500 text-white hover:bg-emerald-600 cursor-pointer active:scale-95 transition-all text-center"
                        >
                          Booking Sekarang
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Premium Facilities Showcase */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b pb-2 border-gray-100 dark:border-gray-800">
                <Sparkles className="w-5 h-5 text-emerald-500" />
                <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Fasilitas Premium Kami
                </h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {fasilitas.map((item, id) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={id}
                      className={`p-4 rounded-xl border flex flex-col items-start gap-2.5 transition-all duration-200 ${
                        darkMode
                          ? 'bg-gray-900/50 border-gray-800 hover:bg-gray-800/50'
                          : 'bg-white border-gray-100 hover:shadow-xs hover:border-emerald-200'
                      }`}
                    >
                      <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className={`font-bold text-xs ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                          {item.name}
                        </h4>
                        <p className="text-[10px] text-gray-400 mt-1 lines-clamp-2">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* --- Tab Check Schedule ('cek_jadwal') --- */}
        {activeTab === 'cek_jadwal' && (
          <div className="animate-fade-in flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4 border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-emerald-500" />
                <div>
                  <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Cek Keterisian Lapangan Badminton
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Melihat jadwal operasional harian yang terisi dan tersedia.
                  </p>
                </div>
              </div>

              {/* Day Quick Pick */}
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-emerald-500 ${
                    darkMode ? 'bg-gray-900 text-white border-gray-800' : 'bg-white text-gray-700 border-gray-200'
                  }`}
                />
              </div>
            </div>

            {/* Guide to status colors constraint list */}
            <div className="flex flex-wrap gap-4 items-center self-start text-xs font-semibold p-3.5 rounded-xl border border-dashed border-gray-200 dark:border-gray-850">
              <span className="text-gray-400">Petunjuk Warna:</span>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-emerald-500" />
                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Hijau = Tersedia</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-red-500" />
                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Merah = Sudah Dibooking</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-gray-400 dark:bg-gray-700" />
                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Abu-abu = Tidak Tersedia / Tutup</span>
              </div>
            </div>

            {/* Main Interactive Check Scheduler Block */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
              {/* Field Filter Selection */}
              <div className="flex flex-col gap-3">
                <span className={`text-xs font-extrabold uppercase tracking-wide px-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Silakan Pilih Lapangan
                </span>
                <div className="flex flex-col gap-2">
                  {lapanganList.map((lap) => (
                    <button
                      key={lap.id_lapangan}
                      onClick={() => setSelectedLapanganId(lap.id_lapangan)}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        selectedLapanganId === lap.id_lapangan
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500 font-bold'
                          : darkMode
                          ? 'bg-gray-900 border-gray-800 text-gray-300 hover:bg-gray-800'
                          : 'bg-white border-gray-100 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="text-xs">{lap.nama_lapangan}</span>
                        <span className="text-[10px] text-gray-400 font-medium">{lap.jenis} - Rp {lap.harga.toLocaleString('id-ID')}/jam</span>
                      </div>
                      <span className={`h-2 w-2 rounded-full ${lap.status === 'aktif' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Slots Map Grid */}
              <div className={`lg:col-span-3 p-5 rounded-2xl border ${
                darkMode ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-100 shadow-xs'
              }`}>
                <div className="flex items-center justify-between border-b pb-3 mb-4 border-gray-100 dark:border-gray-850">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-500" />
                    <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      Skenario Slot Waktu Operasional ({new Date(selectedDate).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })})
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {operasionalSlots.map((time) => {
                    const nextHourStr = String(parseInt(time.split(':')[0]) + 1).padStart(2, '0') + ':00';
                    const slotStatus = getSlotStatus(selectedLapanganId, selectedDate, time);

                    let statusBg = 'bg-emerald-500 hover:bg-emerald-600 text-white';
                    let statusLabel = 'Tersedia';

                    if (slotStatus === 'sudah_dibooking') {
                      statusBg = 'bg-red-500/80 text-white cursor-not-allowed';
                      statusLabel = 'Terbooking';
                    } else if (slotStatus === 'tidak_tersedia') {
                      statusBg = 'bg-gray-300 dark:bg-gray-850 text-gray-500 dark:text-gray-500 cursor-not-allowed';
                      statusLabel = 'Tutup/Lewat';
                    }

                    return (
                      <div
                        key={time}
                        className={`p-3.5 rounded-xl border flex flex-col justify-between gap-2.5 transition-all ${statusBg} ${
                          darkMode ? 'border-transparent' : 'border-gray-100'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold">{time} - {nextHourStr}</span>
                        </div>
                        <div className="flex items-center justify-between items-end">
                          <span className="text-[10px] uppercase tracking-wider font-extrabold opacity-90">{statusLabel}</span>
                          {slotStatus === 'tersedia' && (
                            <button
                              onClick={onNavigateToLogin}
                              className="text-[9px] font-extrabold uppercase bg-black/25 hover:bg-black/45 px-2 py-1 rounded text-white tracking-wide cursor-pointer"
                            >
                              Pesan
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Login Prompt CTA Footer */}
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs p-4 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/25">
                  <span className="flex items-center gap-2 font-semibold">
                    <Info className="w-4.5 h-4.5 shrink-0" />
                    Ingin langsung memesan jadwal ini secara resmi? Silakan masuk atau register terlebih dahulu.
                  </span>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={onNavigateToLogin}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold cursor-pointer"
                    >
                      Login Pemesan
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- Tab Tentang Kami --- */}
        {activeTab === 'tentang' && (
          <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch pt-2">
            <div className="flex flex-col gap-6 justify-center">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full self-start">
                Profil Smash Arena
              </span>
              <h2 className={`text-2xl md:text-3xl font-extrabold leading-tight ${darkMode ? 'text-white' : 'text-gray-950'}`}>
                Gedung Olahraga Bulutangkis <br />
                Terlengkap di Pusat Kota
              </h2>
              <p className={`text-xs md:text-sm leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Didirikan sejak tahun 2018, **Smash Arena** telah menjadi rumah bagi puluhan komunitas dan 
                ratusan pencinta bulutangkis aktif setiap harinya. Kami memfokuskan pelayanan pada 
                kualitas lapangan yang empuk, bersih, pencahayaan bebas silau, tata kelola fasilitas prima, 
                dan kemudahan akses pemesanan.
              </p>
              <p className={`text-xs md:text-sm leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Melalui platform digital inovatif ini, kami berharap para pemain hobi maupun atlet amatir 
                dapat memantau ketersediaan lapangan secara transparan, akurat, bebas calo, dan dapat mendaftar 
                hanya dalam hitungan detik.
              </p>

              {/* Operational specifications */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-100'}`}>
                  <h4 className="font-bold text-xs text-emerald-500">Buka Setiap Hari</h4>
                  <p className={`text-[11px] mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Pukul 08:00 s/d 22:00 WIB</p>
                </div>
                <div className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-100'}`}>
                  <h4 className="font-bold text-xs text-emerald-500">Grip Lantai BWF</h4>
                  <p className={`text-[11px] mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Vinyl, Parquet Wood, & Karpet Standar Dunia</p>
                </div>
              </div>
            </div>

            {/* Address map and info wrapper */}
            <div className={`rounded-3xl border overflow-hidden flex flex-col justify-between ${
              darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100 shadow-xs'
            }`}>
              <div className="aspect-video w-full relative bg-gray-200">
                <iframe
                  title="Smash Arena Location"
                  className="w-full h-full border-0 filter opacity-80 dark:invert"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15865.312154388317!2d106.82715!3d-6.20876!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f3e8b4e72337%3A0x6e9fcd8acae8!2sJakarta!5e0!3m2!1sen!2sid!4v1655000000000!5m2!1sen!2sid"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              <div className="p-6 flex flex-col gap-4">
                <h3 className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  Sekretariat & Hubungi Admin GOR
                </h3>
                <div className="flex flex-col gap-3.5 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex gap-2.5 items-start">
                    <MapPin className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                    <span>Jl. Sudirman Raya GOR No. 12, Senayan, Kebayoran Baru, Jakarta Selatan, 12190</span>
                  </div>
                  <div className="flex gap-2.5 items-center">
                    <Phone className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                    <span>WhatsApp Booking Service: +62 812-9876-5432</span>
                  </div>
                  <div className="flex gap-2.5 items-center">
                    <Mail className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                    <span>Official Email: contact@smasharena.com</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- Tab Hubungi Kami --- */}
        {activeTab === 'hubungi' && (
          <div className="animate-fade-in max-w-xl mx-auto w-full pt-2">
            <div className={`p-6 md:p-8 rounded-2xl border ${
              darkMode ? 'bg-gray-990 border-gray-800 bg-gray-950' : 'bg-white border-gray-100 shadow-sm'
            }`}>
              <div className="flex flex-col gap-2 pb-4 border-b border-gray-100 dark:border-gray-850 mb-5">
                <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Formulir Kontak Layanan
                </h2>
                <p className="text-xs text-gray-400">
                  Ajukan keluhan, saran kerja sama, atau kritik untuk pelayanan kami.
                </p>
              </div>

              <form onSubmit={handleContactSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className={`text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Contoh: Andi Wijaya"
                    className={`p-3 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden ${
                      darkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-800'
                    }`}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={`text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Alamat Email Aktif
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="Contoh: andi@gmail.com"
                    className={`p-3 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden ${
                      darkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-800'
                    }`}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={`text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Isi Pesan / Keluhan / Pertanyaan
                  </label>
                  <textarea
                    rows={4}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Ketikkan pesan detail Anda di sini..."
                    className={`p-3 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden ${
                      darkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-800'
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingContact}
                  className="w-full mt-2 py-3 bg-emerald-500 text-white font-bold text-xs rounded-xl hover:bg-emerald-600 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send className={`w-4 h-4 ${isSubmittingContact ? 'animate-ping' : ''}`} />
                  {isSubmittingContact ? 'Mengirim Pesan...' : 'Kirim Pesan Resmi'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
