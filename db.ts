/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Lapangan, Booking, Pembayaran, Promo, HubungiKamiPesan, SystemNotification } from '../types';

// Storage keys
const KEY_USERS = 'badminton_db_users';
const KEY_LAPANGAN = 'badminton_db_lapangan';
const KEY_BOOKING = 'badminton_db_booking';
const KEY_PEMBAYARAN = 'badminton_db_pembayaran';
const KEY_PROMO = 'badminton_db_promo';
const KEY_HUBLA_PESAN = 'badminton_db_hubla_pesan';
const KEY_NOTIFICATIONS = 'badminton_db_notifications';

// Initial Seeds
const SEED_USERS: User[] = [
  {
    id_user: 'U001',
    nama: 'Admin Smash Arena',
    email: 'admin@smasharena.com',
    password: 'admin123',
    role: 'admin',
    foto_profil: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
  },
  {
    id_user: 'U002',
    nama: 'Budi Santoso',
    email: 'budi@gmail.com',
    password: 'user123',
    role: 'pelanggan',
    foto_profil: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
  },
  {
    id_user: 'U003',
    nama: 'Siti Rahmawati',
    email: 'siti@gmail.com',
    password: 'user123',
    role: 'pelanggan',
    foto_profil: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80'
  }
];

const SEED_LAPANGAN: Lapangan[] = [
  {
    id_lapangan: 'L01',
    nama_lapangan: 'Lapangan A',
    jenis: 'Vinyl',
    harga: 40000,
    foto: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=600',
    deskripsi: 'Sangat cocok untuk pemula hingga menengah dengan grip permukaan vinyl standar BWF.',
    status: 'aktif'
  },
  {
    id_lapangan: 'L02',
    nama_lapangan: 'Lapangan B',
    jenis: 'Vinyl',
    harga: 40000,
    foto: 'https://images.unsplash.com/photo-1613918431208-6752c2cf70b4?auto=format&fit=crop&q=80&w=600',
    deskripsi: 'Lapangan vinyl bersertifikat nasional, empuk dan mengurangi kelelahan pada kaki.',
    status: 'aktif'
  },
  {
    id_lapangan: 'L03',
    nama_lapangan: 'Lapangan C',
    jenis: 'Karpet',
    harga: 50000,
    foto: 'https://images.unsplash.com/photo-1511068797325-6083f0f872b1?auto=format&fit=crop&q=80&w=600',
    deskripsi: 'Permukaan karpet badminton standar internasional profesional dengan penyerapan guncangan tinggi.',
    status: 'aktif'
  },
  {
    id_lapangan: 'L04',
    nama_lapangan: 'Lapangan D',
    jenis: 'Karpet',
    harga: 50000,
    foto: 'https://images.unsplash.com/photo-1554068865-212ef9e63728?auto=format&fit=crop&q=80&w=600',
    deskripsi: 'Karpet berserat anti-slip yang sangat mendukung manuver cepat dalam permainan ganda.',
    status: 'aktif'
  },
  {
    id_lapangan: 'L05',
    nama_lapangan: 'Lapangan E',
    jenis: 'Premium',
    harga: 60000,
    foto: 'https://images.unsplash.com/photo-1521537634581-12c8b871c1bb?auto=format&fit=crop&q=80&w=600',
    deskripsi: 'Lapangan premium kayu dengan alas karet peredam khusus BWF. Kurangi resiko cedera lutut.',
    status: 'aktif'
  },
  {
    id_lapangan: 'L06',
    nama_lapangan: 'Lapangan F',
    jenis: 'Premium',
    harga: 60000,
    foto: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=600',
    deskripsi: 'Lapangan kasta tertinggi Smash Arena dengan pencahayaan anti-silau (anti-glare lighting).',
    status: 'aktif'
  }
];

const SEED_PROMO: Promo[] = [
  {
    id_promo: 'P01',
    kode_promo: 'SMASHINDONESIA',
    nama_promo: 'Promo Smash Merdeka',
    diskon: 15,
    tanggal_mulai: '2026-06-01',
    tanggal_selesai: '2026-12-31'
  },
  {
    id_promo: 'P02',
    kode_promo: 'MAINSEHAT',
    nama_promo: 'Voucher Main Sehat Hemat',
    diskon: 10,
    tanggal_mulai: '2026-01-01',
    tanggal_selesai: '2026-12-31'
  },
  {
    id_promo: 'P03',
    kode_promo: 'MEMBERBARU',
    nama_promo: 'Diskon Pengguna Baru',
    diskon: 20,
    tanggal_mulai: '2026-05-01',
    tanggal_selesai: '2026-08-31'
  }
];

// Rich set of bookings and payments to make statistics look incredible
const SEED_BOOKINGS: Booking[] = [
  {
    id_booking: 'B001',
    id_user: 'U002',
    id_lapangan: 'L01',
    tanggal: '2026-06-07',
    jam_mulai: '08:00',
    durasi: 2,
    total_harga: 80000,
    status: 'Selesai',
    created_at: '2026-06-06T15:20:00Z'
  },
  {
    id_booking: 'B002',
    id_user: 'U003',
    id_lapangan: 'L03',
    tanggal: '2026-06-07',
    jam_mulai: '10:00',
    durasi: 2,
    total_harga: 100000,
    status: 'Selesai',
    created_at: '2026-06-06T18:45:00Z'
  },
  {
    id_booking: 'B003',
    id_user: 'U002',
    id_lapangan: 'L05',
    tanggal: '2026-06-08',
    jam_mulai: '13:00',
    durasi: 1,
    total_harga: 51000, // Diskon 15% dari 60000
    promo_digunakan: 'SMASHINDONESIA',
    status: 'Disetujui',
    created_at: '2026-06-07T09:12:00Z'
  },
  {
    id_booking: 'B004',
    id_user: 'U003',
    id_lapangan: 'L02',
    tanggal: '2026-06-08',
    jam_mulai: '16:00',
    durasi: 2,
    total_harga: 80000,
    status: 'Menunggu Konfirmasi',
    created_at: '2026-06-07T12:00:00Z'
  },
  {
    id_booking: 'B005',
    id_user: 'U002',
    id_lapangan: 'L06',
    tanggal: '2026-06-09',
    jam_mulai: '19:00',
    durasi: 2,
    total_harga: 120000,
    status: 'Menunggu Pembayaran',
    created_at: '2026-06-08T07:30:00Z'
  },
  {
    id_booking: 'B006',
    id_user: 'U003',
    id_lapangan: 'L04',
    tanggal: '2026-06-09',
    jam_mulai: '09:00',
    durasi: 1,
    total_harga: 45000, // Diskon 10% dari 50000
    promo_digunakan: 'MAINSEHAT',
    status: 'Dibatalkan',
    created_at: '2026-06-07T14:15:00Z'
  },
  // Historic for rich monthly reports
  {
    id_booking: 'B101',
    id_user: 'U002',
    id_lapangan: 'L05',
    tanggal: '2026-05-15',
    jam_mulai: '18:00',
    durasi: 3,
    total_harga: 180000,
    status: 'Selesai',
    created_at: '2026-05-14T11:00:00Z'
  },
  {
    id_booking: 'B102',
    id_user: 'U003',
    id_lapangan: 'L03',
    tanggal: '2026-05-20',
    jam_mulai: '19:00',
    durasi: 2,
    total_harga: 100000,
    status: 'Selesai',
    created_at: '2026-05-18T14:22:00Z'
  },
  {
    id_booking: 'B103',
    id_user: 'U002',
    id_lapangan: 'L01',
    tanggal: '2026-04-10',
    jam_mulai: '20:00',
    durasi: 2,
    total_harga: 80000,
    status: 'Selesai',
    created_at: '2026-04-09T17:10:00Z'
  }
];

const SEED_PEMBAYARAN: Pembayaran[] = [
  {
    id_pembayaran: 'PY001',
    id_booking: 'B001',
    metode: 'QRIS',
    bukti_bayar: 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?auto=format&fit=crop&q=80&w=200',
    status: 'Diterima',
    tanggal_pembayaran: '2026-06-06'
  },
  {
    id_pembayaran: 'PY002',
    id_booking: 'B002',
    metode: 'Transfer Bank',
    bank_name: 'BCA (Rek: 8291029312 a/n Smash Arena)',
    bukti_bayar: 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?auto=format&fit=crop&q=80&w=200',
    status: 'Diterima',
    tanggal_pembayaran: '2026-06-06'
  },
  {
    id_pembayaran: 'PY003',
    id_booking: 'B003',
    metode: 'E-Wallet',
    bukti_bayar: 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?auto=format&fit=crop&q=80&w=200',
    status: 'Diterima',
    tanggal_pembayaran: '2026-06-07'
  },
  {
    id_pembayaran: 'PY004',
    id_booking: 'B004',
    metode: 'Transfer Bank',
    bank_name: 'Mandiri (Rek: 1320019283721 a/n Smash Arena)',
    bukti_bayar: 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?auto=format&fit=crop&q=80&w=200',
    status: 'Menunggu Verifikasi',
    tanggal_pembayaran: '2026-06-07'
  },
  {
    id_pembayaran: 'PY101',
    id_booking: 'B101',
    metode: 'Transfer Bank',
    bukti_bayar: 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?auto=format&fit=crop&q=80&w=200',
    status: 'Diterima',
    tanggal_pembayaran: '2026-05-14'
  },
  {
    id_pembayaran: 'PY102',
    id_booking: 'B102',
    metode: 'QRIS',
    bukti_bayar: 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?auto=format&fit=crop&q=80&w=200',
    status: 'Diterima',
    tanggal_pembayaran: '2026-05-18'
  },
  {
    id_pembayaran: 'PY103',
    id_booking: 'B103',
    metode: 'E-Wallet',
    bukti_bayar: 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?auto=format&fit=crop&q=80&w=200',
    status: 'Diterima',
    tanggal_pembayaran: '2026-04-09'
  }
];

const SEED_NOTIFS: SystemNotification[] = [
  {
    id: 'n1',
    title: 'Selamat Datang!',
    message: 'Selamat datang di Sistem Booking Lapangan Smash Arena.',
    type: 'success',
    timestamp: '2026-06-08T08:00:00Z',
    read: false
  },
  {
    id: 'n2',
    title: 'Booking menunggu pembayaran',
    message: 'Selesaikan pembayaran untuk Booking B005 di Lapangan F.',
    type: 'warning',
    timestamp: '2026-06-08T07:35:00Z',
    read: false
  }
];

// DB Helper Class to interact with LocalStorage
export class RealtimeDB {
  static init() {
    if (!localStorage.getItem(KEY_USERS)) {
      localStorage.setItem(KEY_USERS, JSON.stringify(SEED_USERS));
    }
    if (!localStorage.getItem(KEY_LAPANGAN)) {
      localStorage.setItem(KEY_LAPANGAN, JSON.stringify(SEED_LAPANGAN));
    }
    if (!localStorage.getItem(KEY_BOOKING)) {
      localStorage.setItem(KEY_BOOKING, JSON.stringify(SEED_BOOKINGS));
    }
    if (!localStorage.getItem(KEY_PEMBAYARAN)) {
      localStorage.setItem(KEY_PEMBAYARAN, JSON.stringify(SEED_PEMBAYARAN));
    }
    if (!localStorage.getItem(KEY_PROMO)) {
      localStorage.setItem(KEY_PROMO, JSON.stringify(SEED_PROMO));
    }
    if (!localStorage.getItem(KEY_NOTIFICATIONS)) {
      localStorage.setItem(KEY_NOTIFICATIONS, JSON.stringify(SEED_NOTIFS));
    }
    if (!localStorage.getItem(KEY_HUBLA_PESAN)) {
      localStorage.setItem(KEY_HUBLA_PESAN, JSON.stringify([]));
    }
  }

  // --- Users ---
  static getUsers(): User[] {
    this.init();
    return JSON.parse(localStorage.getItem(KEY_USERS) || '[]');
  }

  static saveUsers(users: User[]) {
    localStorage.setItem(KEY_USERS, JSON.stringify(users));
  }

  // --- Lapangan ---
  static getLapangan(): Lapangan[] {
    this.init();
    return JSON.parse(localStorage.getItem(KEY_LAPANGAN) || '[]');
  }

  static saveLapangan(lapangan: Lapangan[]) {
    localStorage.setItem(KEY_LAPANGAN, JSON.stringify(lapangan));
  }

  // --- Bookings ---
  static getBookings(): Booking[] {
    this.init();
    return JSON.parse(localStorage.getItem(KEY_BOOKING) || '[]');
  }

  static saveBookings(bookings: Booking[]) {
    localStorage.setItem(KEY_BOOKING, JSON.stringify(bookings));
  }

  // --- Pembayaran ---
  static getPembayaran(): Pembayaran[] {
    this.init();
    return JSON.parse(localStorage.getItem(KEY_PEMBAYARAN) || '[]');
  }

  static savePembayaran(pembayaran: Pembayaran[]) {
    localStorage.setItem(KEY_PEMBAYARAN, JSON.stringify(pembayaran));
  }

  // --- Promos ---
  static getPromos(): Promo[] {
    this.init();
    return JSON.parse(localStorage.getItem(KEY_PROMO) || '[]');
  }

  static savePromos(promos: Promo[]) {
    localStorage.setItem(KEY_PROMO, JSON.stringify(promos));
  }

  // --- Hubungi Kami Messages ---
  static getHubungiPesan(): HubungiKamiPesan[] {
    this.init();
    return JSON.parse(localStorage.getItem(KEY_HUBLA_PESAN) || '[]');
  }

  static saveHubungiPesan(pesan: HubungiKamiPesan[]) {
    localStorage.setItem(KEY_HUBLA_PESAN, JSON.stringify(pesan));
  }

  // --- Notifications ---
  static getNotifications(): SystemNotification[] {
    this.init();
    return JSON.parse(localStorage.getItem(KEY_NOTIFICATIONS) || '[]');
  }

  static saveNotifications(notifs: SystemNotification[]) {
    localStorage.setItem(KEY_NOTIFICATIONS, JSON.stringify(notifs));
  }

  // --- Additional Helpers for Operations ---
  static addBooking(booking: Booking, payment?: Pembayaran) {
    const bookings = this.getBookings();
    bookings.push(booking);
    this.saveBookings(bookings);

    if (payment) {
      const payments = this.getPembayaran();
      payments.push(payment);
      this.savePembayaran(payments);
    }

    this.addNotification(
      'Pemesanan Baru',
      `Booking ${booking.id_booking} berhasil dibuat untuk Lapangan ${booking.id_lapangan}.`,
      'info'
    );
  }

  static addNotification(title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
    const notifs = this.getNotifications();
    const newNotif: SystemNotification = {
      id: 'N' + Math.floor(Math.random() * 100000),
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false
    };
    notifs.unshift(newNotif);
    this.saveNotifications(notifs);
  }
}
