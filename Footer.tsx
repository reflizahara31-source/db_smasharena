/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MapPin, Phone, Mail, Clock, ShieldCheck, Heart } from 'lucide-react';

interface FooterProps {
  darkMode: boolean;
}

export function Footer({ darkMode }: FooterProps) {
  return (
    <footer className={`border-t transition-colors duration-200 mt-auto ${
      darkMode ? 'bg-gray-950 border-gray-800 text-gray-400' : 'bg-white border-emerald-100 text-gray-600'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Dynamic Multi-column display */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Column 1: Brand details */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded bg-emerald-500 flex items-center justify-center text-white font-extrabold text-xs">
                S
              </div>
              <span className="font-extrabold text-xs tracking-tight text-emerald-500 uppercase">
                Smash Arena
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-gray-400">
              Sistem Informasi Manajemen dan Reservasi Lapangan Bulutangkis modern masa kini. Penyewaan mudah, 
              instan, dan terpercaya 24 Jam.
            </p>
          </div>

          {/* Column 2: Alamat/Location */}
          <div className="flex flex-col gap-2.5">
            <h4 className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Alamat GOR
            </h4>
            <div className="flex gap-2 items-start text-[11px]">
              <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <address className="not-italic leading-relaxed text-gray-400">
                Jl. Sudirman Raya GOR No. 12, Senayan, Kebayoran Baru, Jakarta Selatan, 12190
              </address>
            </div>
          </div>

          {/* Column 3: Kontak Desk */}
          <div className="flex flex-col gap-2.5">
            <h4 className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Layanan Kontak
            </h4>
            <div className="flex flex-col gap-2 text-[11px] text-gray-400">
              <div className="flex gap-2 items-center">
                <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>WhatsApp: +62 812-9876-5432</span>
              </div>
              <div className="flex gap-2 items-center">
                <Mail className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Admin: contact@smasharena.com</span>
              </div>
            </div>
          </div>

          {/* Column 4: Operational hours */}
          <div className="flex flex-col gap-2.5">
            <h4 className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Jam Operasional
            </h4>
            <div className="flex gap-2 items-start text-[11px] text-gray-400">
              <Clock className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Setiap Hari Kerja & Weekend</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Sesi Mulai: 08:00 - 22:00 WIB</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="border-t border-gray-100 dark:border-gray-850 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-gray-400">
          <p>© 2026 Smash Arena Badminton GOR. All Rights Reserved.</p>
          <div className="flex items-center gap-1">
            <span>Made with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            <span>for Professional Badminton Players</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
