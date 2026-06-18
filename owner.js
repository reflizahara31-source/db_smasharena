// --- OWNER EXECUTIVE DASHBOARD VIEW RENDERER ---
import { DB } from '../db.js';

export const OwnerView = {
  render(state, handleLogout, toggleGorStatus, handleBroadcastAnnouncement, resetBusinessData) {
    const mainContainer = document.getElementById('view-owner');
    if (!mainContainer) return;

    // Fill main container skeleton
    mainContainer.innerHTML = `
      <!-- Owner Executive Banner Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-150 dark:border-gray-800 pb-5">
        <div>
          <h2 class="text-xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <span class="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Executive Lounge (Mode Pemilik GOR)
          </h2>
          <p class="text-xs text-gray-400 mt-1.5">Pantau ringkasan statistik bisnis, buku kas/ledgers pembayaran disetujui, dan kendali operasional GOR.</p>
        </div>
        <button id="owner-header-logout-btn" class="px-4 py-2.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-500 hover:bg-red-605 hover:text-white text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs active:scale-95 shrink-0 self-start sm:self-auto">
          <i data-lucide="log-out" class="w-3.5 h-3.5 pointer-events-none"></i> Keluar Modus Pemilik
        </button>
      </div>

      <!-- Owner Executive Statistics dashboard grid -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="p-4 bg-white dark:bg-gray-950 border border-emerald-100 dark:border-emerald-950/40 rounded-2xl flex items-center gap-3 shadow-xs">
          <div class="h-10 w-10 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center"><i data-lucide="award" class="w-5 h-5"></i></div>
          <div class="min-w-0">
            <span class="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Omset Kotor (Gross)</span>
            <span id="owner-stat-gross" class="text-sm font-black text-gray-900 dark:text-white block mt-0.5">Rp 0</span>
          </div>
        </div>
        <div class="p-4 bg-white dark:bg-gray-950 border border-red-100 dark:border-red-950/40 rounded-2xl flex items-center gap-3 shadow-xs">
          <div class="h-10 w-10 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center"><i data-lucide="ticket" class="w-5 h-5"></i></div>
          <div class="min-w-0">
            <span class="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Beban Diskon</span>
            <span id="owner-stat-discount" class="text-sm font-black text-amber-600 block mt-0.5">Rp 0</span>
          </div>
        </div>
        <div class="p-4 bg-white dark:bg-gray-950 border border-teal-100 dark:border-teal-950/40 rounded-2xl flex items-center gap-3 shadow-md shadow-emerald-500/5">
          <div class="h-10 w-10 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20"><i data-lucide="wallet" class="w-5 h-5"></i></div>
          <div class="min-w-0">
            <span class="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Omset Bersih (Net)</span>
            <span id="owner-stat-net" class="text-sm font-black text-emerald-600 dark:text-emerald-400 block mt-0.5">Rp 0</span>
          </div>
        </div>
        <div class="p-4 bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl flex items-center gap-3 shadow-xs">
          <div class="h-10 w-10 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center"><i data-lucide="clock" class="w-5 h-5"></i></div>
          <div class="min-w-0">
            <span class="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Total Jam Sesi</span>
            <span id="owner-stat-bookings" class="text-sm font-black text-gray-900 dark:text-white block mt-0.5">0 Sesi</span>
          </div>
        </div>
      </div>

      <!-- Main Ledger & Charts block layout -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- Column A & B: Financial Ledgers Cash Book (2 spans width) -->
        <div class="lg:col-span-2 bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-xs space-y-6">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-black text-gray-900 dark:text-white">Buku Kas Transaksi Pembayaran Lunas</h3>
            <span class="text-[10px] uppercase font-bold text-gray-400 bg-gray-50 dark:bg-gray-900 px-3 py-1 rounded-full">Buku Besar Resmi</span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="border-b border-gray-100 dark:border-gray-800 text-gray-405 font-bold uppercase tracking-wider">
                  <th class="py-2.5 px-2">Tanggal</th>
                  <th class="py-2.5 px-2">ID</th>
                  <th class="py-2.5 px-2">Pemain</th>
                  <th class="py-2.5 px-2">Lapangan GOR</th>
                  <th class="py-2.5 px-2">Tarif Pokok</th>
                  <th class="py-2.5 px-2">Kupon</th>
                  <th class="py-2.5 px-2 text-right">Lunas Selesai</th>
                </tr>
              </thead>
              <tbody id="owner-ledger-rows" class="divide-y divide-gray-150 dark:divide-gray-800 text-gray-800 dark:text-gray-200 font-sans">
                <!-- Calculated ledgers row -->
              </tbody>
            </table>
          </div>
        </div>

        <!-- Column C: Operational Controls & Live Settings (1 span width) -->
        <div class="space-y-6">
          <!-- GOR Central Control Center -->
          <div class="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-xs space-y-4">
            <h3 class="text-base font-black text-gray-900 dark:text-white flex items-center gap-1.5 leading-none">
              <i data-lucide="sliders" class="w-4.5 h-4.5 text-emerald-500"></i> Kendali Utama GOR
            </h3>
            <p class="text-[11px] text-gray-400 leading-relaxed font-medium">Melakukan pemeliharaan darurat atau menutup sementara gerbang pendaftaran online.</p>
            
            <div class="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl flex items-center justify-between border border-gray-150 dark:border-gray-850">
              <div class="space-y-0.5">
                <span class="text-[10px] text-gray-400 font-bold uppercase leading-none block">Status GOR</span>
                <span id="owner-gor-status-txt" class="text-xs font-black text-emerald-600 dark:text-emerald-400">✅ GOR Dibuka Untuk Reservasi</span>
              </div>
              <button id="owner-status-toggle-btn" class="px-3.5 py-1.5 bg-red-650 hover:bg-red-700 text-white font-extrabold text-[10px] rounded-lg cursor-pointer transition-all active:scale-95 shadow-sm">
                Tutup GOR
              </button>
            </div>

            <!-- Owner Broadcast message system -->
            <div class="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-850">
              <div class="flex items-center justify-between">
                <span class="text-xs font-black text-gray-900 dark:text-white">Broadcast Announcement Megaphone</span>
                <span class="text-[9px] uppercase font-bold text-emerald-500 border border-emerald-500/20 bg-emerald-500/5 px-1.5 rounded">Real-time Banner</span>
              </div>
              <p class="text-[10px] text-gray-400 font-medium">Update teks spanduk kuning yang berjalan di bagian atas Beranda.</p>
              
              <div class="space-y-2">
                <textarea id="owner-announcement-input" placeholder="Tulis pengumuman pemilik GOR disini..." class="w-full text-xs p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-805 rounded-xl resize-none h-20 text-gray-850 dark:text-white font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"></textarea>
                <button id="owner-announcement-broadcast-btn" class="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer">
                  Siarkan Pengumuman Sekarang
                </button>
              </div>
            </div>



            <!-- CRITICAL RESET SYSTEM (Fully Functional) -->
            <div class="pt-4 border-t border-red-100 dark:border-red-950/20 space-y-2">
              <span class="text-xs font-bold text-red-500 uppercase tracking-wide block leading-none">Zona Bahaya (Admin/Master)</span>
              <p class="text-[10px] text-gray-400 font-medium">Operasional ini akan mereset database dari awal; menghapus seluruh daftar booking & user baru.</p>
              <button id="owner-database-restart-btn" class="w-full py-2.5 bg-red-500/10 hover:bg-red-600 hover:text-white text-red-500 text-xs font-black rounded-xl border border-red-200 dark:border-red-900/30 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 uppercase">
                <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i> Restart Sistem GOR (Reset)
              </button>
            </div>
          </div>
        </div>

      </div>

      <!-- Bento-style Statistics charts VIP ranking and Voucher metrics -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- 1. Occupancy Court rates popularity -->
        <div class="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-xs space-y-4">
          <h3 class="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider block">Tingkat Okupansi Kontribusi Lapangan</h3>
          <p class="text-[10px] text-gray-400">Total jam main yang disewa dan persentase sumbangan terhadap omset kas bersih GOR.</p>
          <div id="owner-court-stats" class="space-y-3.5">
            <!-- Progress bars filled dynamically -->
          </div>
        </div>

        <!-- 2. VIP Customers list leaderboard -->
        <div class="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-xs space-y-4">
          <h3 class="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider block">Peringkat Member Loyal (Spenders Utama)</h3>
          <p class="text-[10px] text-gray-400">Peringkat 5 pelanggan utama yang paling banyak melakukan pelunasan transaksi sesi.</p>
          <div id="owner-vip-customers" class="space-y-2">
            <!-- VIP rows -->
          </div>
        </div>

        <!-- 3. Promotion/Vouchers metric efficiency -->
        <div class="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-xs space-y-4">
          <h3 class="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider block">Efektivitas Voucher & Subsidi Kupon</h3>
          <p class="text-[10px] text-gray-400">Jumlah penggunaan kode kupon dan total nominal pemotongan subsidi yang diserap GOR.</p>
          <div id="owner-promo-use-stats" class="grid grid-cols-1 gap-3 overflow-y-auto max-h-[290px] pr-1">
            <!-- Promo performance widgets -->
          </div>
        </div>
      </div>
    `;

    // Bind log-outs
    document.getElementById('owner-header-logout-btn')?.addEventListener('click', handleLogout);

    // Bind toggle buttons
    document.getElementById('owner-status-toggle-btn')?.addEventListener('click', toggleGorStatus);

    // Bind announcement broadcast click
    document.getElementById('owner-announcement-broadcast-btn')?.addEventListener('click', handleBroadcastAnnouncement);

    // Bind database reset / restart clickable action
    document.getElementById('owner-database-restart-btn')?.addEventListener('click', resetBusinessData);



    // Call dynamic rendering states
    OwnerView.calculateStatsAndRender(state);

    if (window.lucide) {
      lucide.createIcons();
    }
  },

  calculateStatsAndRender(state) {
    const approvedBookings = state.bookings.filter(b => b.status === 'Disetujui');
    
    let gross = 0;
    let discount = 0;
    let net = 0;
    let totalSesi = 0;
    
    approvedBookings.forEach(b => {
      gross += b.subtotal;
      discount += b.diskon;
      net += b.grandtotal;
      totalSesi += (b.sesi ? b.sesi.length : 1);
    });

    // Update header stats cards
    const gElem = document.getElementById('owner-stat-gross');
    const dElem = document.getElementById('owner-stat-discount');
    const nElem = document.getElementById('owner-stat-net');
    const bElem = document.getElementById('owner-stat-bookings');

    if (gElem) gElem.innerText = 'Rp ' + gross.toLocaleString('id-ID');
    if (dElem) dElem.innerText = 'Rp ' + discount.toLocaleString('id-ID');
    if (nElem) nElem.innerText = 'Rp ' + net.toLocaleString('id-ID');
    if (bElem) bElem.innerText = totalSesi + ' Sesi';

    // Update Operational GOR Status layout text
    const currentStatus = localStorage.getItem('sa_gor_status') || 'buka';
    const statusText = document.getElementById('owner-gor-status-txt');
    const statusBtn = document.getElementById('owner-status-toggle-btn');
    if (statusText && statusBtn) {
      if (currentStatus === 'closed') {
        statusText.innerText = '⚠️ GOR Tutup Sementara';
        statusText.className = 'text-xs font-black text-red-500';
        statusBtn.innerText = 'Buka GOR';
        statusBtn.className = 'px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] rounded-lg cursor-pointer transition-all active:scale-95 shadow-sm';
      } else {
        statusText.innerText = '✅ GOR Dibuka Untuk Reservasi';
        statusText.className = 'text-xs font-black text-emerald-600 dark:text-emerald-400';
        statusBtn.innerText = 'Tutup GOR';
        statusBtn.className = 'px-3 py-1.5 bg-red-650 hover:bg-red-700 text-white font-extrabold text-[10px] rounded-lg cursor-pointer transition-all active:scale-95 shadow-sm';
      }
    }

    // Set input values
    const textAnnInput = document.getElementById('owner-announcement-input');
    if (textAnnInput) {
      textAnnInput.value = localStorage.getItem('sa_announcement') || 'Selamat Datang di GOR Smash Arena! Nikmati kualitas bermain bintang lima dengan pelayanan terbaik.';
    }

    // Render Ledger Cash flows
    const ledgerParent = document.getElementById('owner-ledger-rows');
    if (ledgerParent) {
      if (approvedBookings.length === 0) {
        ledgerParent.innerHTML = `<tr><td colspan="7" class="py-8 text-center text-gray-400 font-sans font-semibold">Belum ada transaksi sewa yang lunas/disetujui.</td></tr>`;
      } else {
        ledgerParent.innerHTML = approvedBookings.map(b => {
          const user = state.users.find(u => u.id === b.userId);
          const userNama = user ? user.nama : (b.pengirim || 'Member GOR');
          const court = state.courts.find(c => c.id === b.courtId);
          const courtNama = court ? court.nama : 'Lapangan';
          
          return `
            <tr class="border-b border-gray-100 dark:border-gray-850">
              <td class="py-3 px-2 font-mono text-[11px] text-gray-500">${b.tgl}</td>
              <td class="py-3 px-2 font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400 select-all">${b.id}</td>
              <td class="py-3 px-2 font-bold text-gray-900 dark:text-gray-100">${userNama}</td>
              <td class="py-3 px-2 text-[11px] text-gray-450 dark:text-gray-400 font-semibold">${courtNama}</td>
              <td class="py-3 px-2 font-mono">Rp ${b.subtotal.toLocaleString('id-ID')}</td>
              <td class="py-3 px-2 font-mono text-amber-600">Rp ${b.diskon.toLocaleString('id-ID')}</td>
              <td class="py-3 px-2 font-mono text-right font-extrabold text-emerald-600 dark:text-emerald-400">Rp ${b.grandtotal.toLocaleString('id-ID')}</td>
            </tr>
          `;
        }).reverse().join('');
      }
    }

    // Render Progress graphs
    const courtStatsParent = document.getElementById('owner-court-stats');
    if (courtStatsParent) {
      const courtIncomes = state.courts.map(c => {
        const courtBookings = approvedBookings.filter(b => b.courtId === c.id);
        const courtGross = courtBookings.reduce((sum, b) => sum + b.subtotal, 0);
        const courtDiscount = courtBookings.reduce((sum, b) => sum + b.diskon, 0);
        const courtNet = courtBookings.reduce((sum, b) => sum + b.grandtotal, 0);
        const sessionsCount = courtBookings.reduce((sum, b) => sum + (b.sesi ? b.sesi.length : 1), 0);
        return {
          id: c.id,
          nama: c.nama,
          gross: courtGross,
          net: courtNet,
          sessions: sessionsCount
        };
      });

      const maxIncome = Math.max(...courtIncomes.map(ci => ci.net), 1);

      courtStatsParent.innerHTML = courtIncomes.map(ci => {
        const percentage = Math.round((ci.net / maxIncome) * 100);
        const contribution = net > 0 ? Math.round((ci.net / net) * 100) : 0;
        return `
          <div class="space-y-1.5 font-sans">
            <div class="flex justify-between items-center text-xs">
              <div class="flex items-center gap-1.5">
                <span class="inline-block py-0.5 px-1.5 bg-gray-100 dark:bg-gray-800 rounded font-mono font-bold text-[9px] text-gray-500 uppercase">${ci.id}</span>
                <span class="font-bold text-gray-800 dark:text-gray-200">${ci.nama}</span>
              </div>
              <div class="text-right">
                <span class="font-mono text-gray-400 text-[10px] mr-2 font-semibold">${ci.sessions} Jam Sesi</span>
                <span class="font-extrabold text-emerald-600 dark:text-emerald-400">Rp ${ci.net.toLocaleString('id-ID')} <span class="text-gray-455 dark:text-gray-500 font-normal">(${contribution}%)</span></span>
              </div>
            </div>
            <div class="w-full bg-gray-100 dark:bg-gray-900 h-2.5 rounded-full overflow-hidden">
              <div class="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-300" style="width: ${percentage}%"></div>
            </div>
          </div>
        `;
      }).join('');
    }

    // Render Top Spendings members VIP leaderboard
    const vipParent = document.getElementById('owner-vip-customers');
    if (vipParent) {
      const customerStats = state.users
        .filter(u => u.role === 'pelanggan')
        .map(u => {
          const userBookings = approvedBookings.filter(b => b.userId === u.id);
          const totalSpent = userBookings.reduce((sum, b) => sum + b.grandtotal, 0);
          return {
            id: u.id,
            nama: u.nama,
            email: u.email,
            bookingsCount: userBookings.length,
            spent: totalSpent
          };
        })
        .sort((a, b) => b.spent - a.spent);
        
      const topVips = customerStats.slice(0, 5);
      
      if (topVips.length === 0 || topVips[0].spent === 0) {
        vipParent.innerHTML = `<div class="py-5 text-center text-xs text-gray-450 font-sans font-semibold">Belum ada peringkat member loyal.</div>`;
      } else {
        const colors = [
          'bg-amber-500 text-white',
          'bg-emerald-500 text-white',
          'bg-teal-500 text-white',
          'bg-indigo-500 text-white',
          'bg-pink-500 text-white'
        ];
        
        vipParent.innerHTML = topVips.map((v, idx) => {
          const initials = v.nama.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
          return `
            <div class="flex items-center justify-between p-2 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors font-sans">
              <div class="flex items-center gap-3">
                <div class="h-9 w-9 rounded-full ${colors[idx % colors.length]} text-xs font-black flex items-center justify-center shrink-0 shadow-sm leading-none font-sans">
                  ${initials}
                </div>
                <div class="min-w-0">
                  <span class="font-black text-xs text-gray-900 dark:text-white block leading-none truncate">${v.nama}</span>
                  <span class="text-[9px] text-gray-450 font-mono block mt-1 leading-none">${v.bookingsCount}x Sesi Sewa</span>
                </div>
              </div>
              <div class="text-right">
                <span class="font-extrabold text-xs text-emerald-600 dark:text-emerald-400 block">${v.spent.toLocaleString('id-ID')}</span>
                <span class="text-[9px] text-emerald-500 font-bold uppercase block mt-0.5 tracking-wider">VIP Rank ${idx + 1}</span>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    // Render Coupon metrics efficacy
    const promoParent = document.getElementById('owner-promo-use-stats');
    if (promoParent) {
      const promoStats = state.promos.map(p => {
        const uses = approvedBookings.filter(b => {
          if (b.promoCode === p.kode) return true;
          if (b.diskon > 0) {
            const bookingPercentage = Math.round((b.diskon / b.subtotal) * 100);
            if (bookingPercentage === p.persen) return true;
          }
          return false;
        });
        
        const totalDiscountValue = uses.reduce((sum, b) => sum + b.diskon, 0);
        
        return {
          kode: p.kode,
          persen: p.persen,
          desc: p.desc,
          count: uses.length,
          value: totalDiscountValue
        };
      }).sort((a, b) => b.count - a.count);

      promoParent.innerHTML = promoStats.map(ps => {
        return `
          <div class="p-3 bg-gray-50 dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl flex flex-col gap-1.5 font-sans">
            <div class="flex items-center justify-between pointer-events-none">
              <span class="px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-450 border border-amber-500/15 rounded text-[10px] font-black tracking-wider uppercase">${ps.kode}</span>
              <span class="font-mono text-[9px] text-gray-400">${ps.count}x Digunakan</span>
            </div>
            <p class="text-[10px] text-gray-400 leading-snug truncate pointer-events-none" title="${ps.desc}">${ps.desc}</p>
            <div class="flex items-center justify-between pt-1 border-t border-gray-200 dark:border-gray-850 text-[10px] pointer-events-none">
              <span class="text-gray-400 font-medium">Beban Subsidi GOR:</span>
              <span class="font-extrabold text-red-500 dark:text-red-400">Rp ${ps.value.toLocaleString('id-ID')}</span>
            </div>
          </div>
        `;
      }).join('');
    }

    if (window.lucide) lucide.createIcons();
  }
};
