/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'admin' | 'pelanggan' | 'tamu';

export interface User {
  id_user: string;
  nama: string;
  email: string;
  password?: string;
  role: 'admin' | 'pelanggan';
  foto_profil?: string;
}

export interface Lapangan {
  id_lapangan: string;
  nama_lapangan: string;
  jenis: 'Vinyl' | 'Karpet' | 'Premium';
  harga: number;
  foto: string;
  deskripsi: string;
  status: 'aktif' | 'nonaktif';
}

export interface Booking {
  id_booking: string;
  id_user: string;
  id_lapangan: string;
  tanggal: string; // YYYY-MM-DD
  jam_mulai: string; // HH:00
  durasi: number; // in hours
  total_harga: number;
  promo_digunakan?: string;
  status: 'Menunggu Pembayaran' | 'Menunggu Konfirmasi' | 'Disetujui' | 'Selesai' | 'Dibatalkan';
  created_at: string;
}

export interface Pembayaran {
  id_pembayaran: string;
  id_booking: string;
  metode: 'Transfer Bank' | 'QRIS' | 'E-Wallet';
  bank_name?: string;
  bukti_bayar: string; // Simulated file/image (Base64 or URL placeholder)
  status: 'Menunggu Verifikasi' | 'Diterima' | 'Ditolak';
  tanggal_pembayaran: string;
}

export interface Promo {
  id_promo: string;
  kode_promo: string; // e.g. SMASHINFO, JUARAADUD
  nama_promo: string;
  diskon: number; // percentage, e.g. 10 for 10%
  tanggal_mulai: string;
  tanggal_selesai: string;
}

export interface HubungiKamiPesan {
  id: string;
  nama: string;
  email: string;
  pesan: string;
  tanggal: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
}
