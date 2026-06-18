// --- ADMIN CONTROL PANEL VIEW RENDERER ---
import { DB } from '../db.js';

export const AdminView = {
  render(state, switchAdminTab, approveBooking, rejectBooking, viewPaymentProof, handleDeleteCourt, handleEditCourt, handleOpenAddCourt, handleDeletePromo, handleOpenAddPromo, handleDeleteMessage, handleDeleteUser) {
    const mainContainer = document.getElementById('view-admin');
    if (!mainContainer) return;

    mainContainer.innerHTML = `
      <!-- Admin Premium Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-150 dark:border-gray-800 pb-5">
        <div>
          <h2 class="text-xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <span class="inline-block h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse"></span>
            Control Panel (Mode Eksekutif Admin)
          </h2>
          <p class="text-xs text-gray-400 mt-1.5">Kelola reservasi lapangan badminton, update status billing, kustomisasi promo, dan monitor inbox pelanggan.</p>
        </div>
        <button id="admin-header-logout-btn" class="px-4 py-2.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-500 hover:bg-red-650 hover:text-white text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs active:scale-95 shrink-0 self-start sm:self-auto">
          <i data-lucide="log-out" class="w-3.5 h-3.5 pointer-events-none"></i> Keluar Admin
        </button>
      </div>

      <!-- Admin Statistics summary widget header -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div id="stat-card-revenue" title="Klik untuk lihat daftar sewa" class="p-4 bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl flex items-center gap-3 cursor-pointer hover:bg-emerald-500/5 hover:border-emerald-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 group shadow-xs">
          <div class="h-10 w-10 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform"><i data-lucide="line-chart" class="w-5 h-5"></i></div>
          <div class="min-w-0">
            <span class="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Total Pendapatan</span>
            <span id="stat-revenue" class="text-sm font-black text-gray-900 dark:text-white block mt-0.5">Rp 0</span>
          </div>
        </div>
        <div id="stat-card-bookings" title="Klik untuk lihat daftar sewa" class="p-4 bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl flex items-center gap-3 cursor-pointer hover:bg-emerald-500/5 hover:border-emerald-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 group shadow-xs">
          <div class="h-10 w-10 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform"><i data-lucide="bookmark-check" class="w-5 h-5"></i></div>
          <div class="min-w-0">
            <span class="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Total Sewa</span>
            <span id="stat-bookings" class="text-sm font-black text-gray-900 dark:text-white block mt-0.5">0 Transaksi</span>
          </div>
        </div>
        <div id="stat-card-users" title="Klik untuk lihat daftar pelanggan" class="p-4 bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl flex items-center gap-3 cursor-pointer hover:bg-emerald-500/5 hover:border-emerald-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 group shadow-xs">
          <div class="h-10 w-10 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform"><i data-lucide="users" class="w-5 h-5"></i></div>
          <div class="min-w-0">
            <span class="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Total Member</span>
            <span id="stat-users" class="text-sm font-black text-gray-900 dark:text-white block mt-0.5">0 Pengguna</span>
          </div>
        </div>
        <div id="stat-card-messages" title="Klik untuk lihat daftar keluhan" class="p-4 bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl flex items-center gap-3 cursor-pointer hover:bg-emerald-500/5 hover:border-emerald-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 group shadow-xs">
          <div class="h-10 w-10 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform"><i data-lucide="message-square" class="w-5 h-5"></i></div>
          <div class="min-w-0">
            <span class="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Keluhan/Masukan</span>
            <span id="stat-messages" class="text-sm font-black text-gray-900 dark:text-white block mt-0.5">0 Inbox</span>
          </div>
        </div>
      </div>

      <!-- Tab bar picker logic for admin views -->
      <div class="border-b border-gray-150 dark:border-gray-800 mb-6 h-auto">
        <div class="flex overflow-x-auto scrollbar-hide w-full -mb-px gap-1.5 md:gap-3">
          <button id="btn-adm-bookings" class="px-3 md:px-5 py-3 border-b-2 border-emerald-500 text-emerald-500 text-xs font-black tracking-tight shrink-0 transition-all cursor-pointer">
            Kelola Booking & Konfirmasi
          </button>
          <button id="btn-adm-courts" class="px-3 md:px-5 py-3 border-b-2 border-transparent text-gray-400 hover:text-gray-500 text-xs font-bold tracking-tight shrink-0 transition-all cursor-pointer">
            Daftar Lapangan GOR
          </button>
          <button id="btn-adm-promos" class="px-3 md:px-5 py-3 border-b-2 border-transparent text-gray-400 hover:text-gray-500 text-xs font-bold tracking-tight shrink-0 transition-all cursor-pointer">
            Kupon Promo & Diskon
          </button>
          <button id="btn-adm-messages" class="px-3 md:px-5 py-3 border-b-2 border-transparent text-gray-400 hover:text-gray-500 text-xs font-bold tracking-tight shrink-0 transition-all cursor-pointer">
            Daftar Pesan Masuk
          </button>
          <button id="btn-adm-users" class="px-3 md:px-5 py-3 border-b-2 border-transparent text-gray-400 hover:text-gray-500 text-xs font-bold tracking-tight shrink-0 transition-all cursor-pointer">
            Daftar Pelanggan GOR
          </button>
        </div>
      </div>

      <!-- Active Admin boards screen state managers -->
      <div class="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-xs transition-colors">
        
        <!-- TAB A: Bookings & Confirmation table -->
        <div id="adm-tab-bookings">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h3 class="text-base font-black text-gray-900 dark:text-white leading-none">Daftar Reservasi Semua Member GOR</h3>
            <span class="text-[10px] uppercase font-bold text-gray-400 bg-gray-100 dark:bg-gray-900 px-3 py-1 rounded-full">
              Tindakan Approval Instan
            </span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="border-b border-gray-100 dark:border-gray-800 text-gray-400 font-extrabold uppercase">
                  <th class="py-3 px-2">Pihak Pemesan</th>
                  <th class="py-3 px-2">ID Booking</th>
                  <th class="py-3 px-2">Lapangan</th>
                  <th class="py-3 px-2">Tanggal / Sesi</th>
                  <th class="py-3 px-2">Estimasi Tagihan</th>
                  <th class="py-3 px-2">Status</th>
                  <th class="py-3 px-2 text-right">Aksi Konfirmasi</th>
                </tr>
              </thead>
              <tbody id="admin-booking-rows" class="divide-y divide-gray-100 dark:divide-gray-800 text-gray-800 dark:text-gray-200 font-sans">
                <!-- Filled -->
              </tbody>
            </table>
          </div>
        </div>

        <!-- TAB B: Courts setting page -->
        <div id="adm-tab-courts" class="hidden space-y-6">
          <div class="flex justify-between items-center">
            <h3 class="text-base font-black text-gray-900 dark:text-white">Pengaturan Lapangan Aktif</h3>
            <button id="add-court-modal-trigger" class="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-[11px] rounded-lg cursor-pointer transition-all active:scale-95">
              Tambah Lapangan Baru
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="border-b border-gray-100 dark:border-gray-800 text-gray-400 font-extrabold uppercase">
                  <th class="py-3 px-2">ID</th>
                  <th class="py-3 px-2">Nama Lapangan</th>
                  <th class="py-3 px-2">Bahan Lantai</th>
                  <th class="py-3 px-2">Harga Per Sesi (WIB)</th>
                  <th class="py-3 px-2">Ketersediaan</th>
                  <th class="py-3 px-2 text-right">Opsi</th>
                </tr>
              </thead>
              <tbody id="admin-court-rows" class="divide-y divide-gray-100 dark:divide-gray-800 text-gray-800 dark:text-gray-200 font-sans">
                <!-- Filled -->
              </tbody>
            </table>
          </div>
        </div>

        <!-- TAB C: Promos editor page -->
        <div id="adm-tab-promos" class="hidden space-y-6">
          <div class="flex justify-between items-center">
            <h3 class="text-base font-black text-gray-900 dark:text-white">Pengaturan Kode Promo Kupon</h3>
            <button id="add-promo-modal-trigger" class="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-[11px] rounded-lg cursor-pointer transition-all active:scale-95">
              Buat Kupon Baru
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="border-b border-gray-100 dark:border-gray-800 text-gray-400 font-extrabold uppercase">
                  <th class="py-3 px-2">Kode Kupon</th>
                  <th class="py-3 px-2">Persentase Potongan (%)</th>
                  <th class="py-3 px-2">Deskripsi Kegunaan</th>
                  <th class="py-3 px-2">Status</th>
                  <th class="py-3 px-2 text-right">Opsi</th>
                </tr>
              </thead>
              <tbody id="admin-promo-rows" class="divide-y divide-gray-100 dark:divide-gray-800 text-gray-800 dark:text-gray-200">
                <!-- Filled -->
              </tbody>
            </table>
          </div>
        </div>

        <!-- TAB D: Messages list -->
        <div id="adm-tab-messages" class="hidden space-y-6">
          <h3 class="text-base font-black text-gray-900 dark:text-white">Pesan Masuk dari Form Hubungi Kami</h3>
          
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="border-b border-gray-100 dark:border-gray-800 text-gray-400 font-extrabold uppercase">
                  <th class="py-3 px-2">Nama Pengirim</th>
                  <th class="py-3 px-2">Email</th>
                  <th class="py-3 px-2">Rincian Keluhan/Masukan</th>
                  <th class="py-3 px-2 text-right">Opsi</th>
                </tr>
              </thead>
              <tbody id="admin-message-rows" class="divide-y divide-gray-100 dark:divide-gray-800 text-gray-800 dark:text-gray-200">
                <!-- Filled -->
              </tbody>
            </table>
          </div>
        </div>

        <!-- TAB E: Users list -->
        <div id="adm-tab-users" class="hidden space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 class="text-base font-black text-gray-900 dark:text-white pb-1">Daftar Akun Pelanggan GOR Smash Arena</h3>
            <div class="relative max-w-xs w-full">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <i data-lucide="search" class="w-3.5 h-3.5"></i>
              </span>
              <input type="text" id="admin-user-search" placeholder="Cari nama atau email..." class="pl-9 pr-3 py-1.5 w-full bg-gray-50 dark:bg-gray-900 text-xs rounded-xl border border-gray-200 dark:border-gray-850 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-gray-800 dark:text-white">
            </div>
          </div>
          
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="border-b border-gray-100 dark:border-gray-800 text-gray-400 font-extrabold uppercase">
                  <th class="py-3 px-2">ID User</th>
                  <th class="py-3 px-2">Nama Pelanggan</th>
                  <th class="py-3 px-2">Email</th>
                  <th class="py-3 px-2">Role Status</th>
                  <th class="py-3 px-2 text-right">Opsi</th>
                </tr>
              </thead>
              <tbody id="admin-user-rows" class="divide-y divide-gray-100 dark:divide-gray-800 text-gray-800 dark:text-gray-200">
                <!-- Filled -->
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;

    // Bind log-outs
    document.getElementById('admin-header-logout-btn')?.addEventListener('click', () => window.handleLogout());

    // Bind stats triggers
    document.getElementById('stat-card-revenue')?.addEventListener('click', () => switchAdminTab('bookings'));
    document.getElementById('stat-card-bookings')?.addEventListener('click', () => switchAdminTab('bookings'));
    document.getElementById('stat-card-users')?.addEventListener('click', () => switchAdminTab('users'));
    document.getElementById('stat-card-messages')?.addEventListener('click', () => switchAdminTab('messages'));

    // Bind tabs switcher
    const mapTabs = ['bookings', 'courts', 'promos', 'messages', 'users'];
    mapTabs.forEach(tab => {
      const btn = document.getElementById(`btn-adm-${tab}`);
      if (btn) {
        btn.addEventListener('click', () => switchAdminTab(tab));
      }
    });

    // Modal creation triggers
    document.getElementById('add-court-modal-trigger')?.addEventListener('click', handleOpenAddCourt);
    document.getElementById('add-promo-modal-trigger')?.addEventListener('click', handleOpenAddPromo);

    // Bind user searching trigger
    const userSearchInput = document.getElementById('admin-user-search');
    if (userSearchInput) {
      userSearchInput.addEventListener('input', () => {
        AdminView.renderUsersList(state, handleDeleteUser);
      });
    }

    // Run active rendering list updates
    switchAdminTab(state.activeAdminTab);

    if (window.lucide) lucide.createIcons();
  },

  renderBookingsList(state, approveBooking, rejectBooking, viewPaymentProof) {
    const list = document.getElementById('admin-booking-rows');
    if (!list) return;

    if (state.bookings.length === 0) {
      list.innerHTML = `<tr><td colspan="7" class="py-10 text-center text-gray-400">Sistem masih bersih dari reservasi.</td></tr>`;
      return;
    }

    list.innerHTML = state.bookings.map(b => {
      const u = state.users.find(x => x.id === b.userId);
      const nameUser = u ? u.nama : 'Pihak GOR';
      const court = state.courts.find(c => c.id === b.courtId);
      const courtName = court ? court.nama : b.courtId;

      let badgeStyle = 'bg-gray-100 text-gray-500';
      if (b.status === 'Disetujui') badgeStyle = 'bg-emerald-500/10 text-emerald-500';
      else if (b.status === 'Pending Approval') badgeStyle = 'bg-amber-500/10 text-amber-600';
      else if (b.status === 'Menunggu Pembayaran') badgeStyle = 'bg-blue-500/10 text-blue-500';
      else if (b.status === 'Dibatalkan') badgeStyle = 'bg-red-500/10 text-red-500';

      let approvals = '';
      const hasProof = b.metodeBayar !== 'cash' && (b.status === 'Pending Approval' || b.status === 'Disetujui' || b.pengirim);

      if (b.status === 'Pending Approval') {
        approvals = `
          <div class="flex items-center gap-1.5 justify-end flex-wrap">
            ${hasProof ? `
              <button class="p-1 px-2.5 bg-indigo-55 border border-indigo-200 dark:bg-indigo-950/20 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-extrabold text-[10px] rounded cursor-pointer active:scale-95 transition-all inline-flex items-center gap-1 btn-proof-trig" data-id="${b.id}" title="Lihat Bukti Transfer">
                <i data-lucide="receipt-text" class="w-3.5 h-3.5 pointer-events-none"></i> Bukti Bayar
              </button>
            ` : ''}
            <button class="p-1 px-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] rounded cursor-pointer active:scale-95 transition-all inline-flex items-center gap-1 btn-appr-trig" data-id="${b.id}"><i data-lucide="check" class="w-3 h-3"></i> Setujui</button>
            <button class="p-1 px-2 bg-red-600 hover:bg-red-705 text-white font-extrabold text-[10px] rounded cursor-pointer active:scale-95 transition-all btn-rej-trig" data-id="${b.id}">Batal</button>
          </div>
        `;
      } else if (b.status === 'Disetujui') {
        approvals = `
          <div class="flex items-center gap-1.5 justify-end flex-wrap">
            ${hasProof ? `
              <button class="p-1 px-2.5 bg-indigo-55 border border-indigo-200 dark:bg-indigo-950/20 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-extrabold text-[10px] rounded cursor-pointer active:scale-95 transition-all inline-flex items-center gap-1 btn-proof-trig" data-id="${b.id}" title="Lihat Bukti Transfer">
                <i data-lucide="receipt-text" class="w-3.5 h-3.5 pointer-events-none"></i> Bukti Bayar
              </button>
            ` : ''}
            <span class="text-[10px] text-gray-400 flex items-center gap-1 justify-end font-semibold"><i data-lucide="check" class="w-4 h-4 text-emerald-500"></i> Terverifikasi</span>
          </div>
        `;
      } else if (b.status === 'Menunggu Pembayaran') {
        approvals = `<span class="text-[10px] text-gray-400 italic font-semibold">Menunggu Pembayaran</span>`;
      } else if (b.status === 'Dibatalkan') {
        approvals = `<span class="text-[10px] text-red-500 font-semibold">Dibatalkan</span>`;
      }

      const billingSender = b.pengirim ? `<br><span class="text-[9px] text-gray-450 dark:text-gray-400 font-sans">Pengirim: ${b.pengirim}</span>` : '';
      let mText = "Transfer BCA";
      if (b.metodeBayar === 'mandiri') mText = "Transfer Mandiri";
      else if (b.metodeBayar === 'qris') mText = "QRIS (E-Wallet)";
      else if (b.metodeBayar === 'cash') mText = "Tunai di GOR";

      return `
        <tr class="border-b border-gray-100 dark:border-gray-850">
          <td class="py-3 px-2 font-bold">${nameUser}</td>
          <td class="py-3 px-2 font-mono text-gray-400 select-all">${b.id}</td>
          <td class="py-3 px-2 font-bold">${courtName}</td>
          <td class="py-3 px-2 leading-relaxed"><span class="font-bold text-[10px] text-emerald-500">${b.tgl}</span><br><span class="text-[10px] font-mono font-bold text-gray-450 dark:text-gray-400">${b.sesi.join(', ')}</span></td>
          <td class="py-3 px-2 font-black text-gray-800 dark:text-gray-100">Rp ${b.grandtotal.toLocaleString('id-ID')}<br><span class="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">${mText}</span>${billingSender}</td>
          <td class="py-3 px-2"><span class="px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${badgeStyle}">${b.status}</span></td>
          <td class="py-3 px-2 text-right">${approvals}</td>
        </tr>
      `;
    }).reverse().join('');

    // Bind sub-button item events
    document.querySelectorAll('.btn-proof-trig').forEach(el => {
      el.addEventListener('click', () => viewPaymentProof(el.getAttribute('data-id')));
    });
    document.querySelectorAll('.btn-appr-trig').forEach(el => {
      el.addEventListener('click', () => approveBooking(el.getAttribute('data-id')));
    });
    document.querySelectorAll('.btn-rej-trig').forEach(el => {
      el.addEventListener('click', () => rejectBooking(el.getAttribute('data-id')));
    });

    if (window.lucide) lucide.createIcons();
  },

  renderCourtsList(state, handleDeleteCourt, handleEditCourt) {
    const parent = document.getElementById('admin-court-rows');
    if (!parent) return;

    parent.innerHTML = state.courts.map(c => {
      const courtImg = c.foto || 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=600&q=80';
      return `
        <tr class="border-b border-gray-100 dark:border-gray-850">
          <td class="py-3 px-2 font-bold text-gray-400 font-mono">${c.id}</td>
          <td class="py-3 px-2 font-bold">
            <div class="flex items-center gap-2.5">
              <img src="${courtImg}" class="h-9 w-14 rounded-lg object-cover border border-gray-200 dark:border-gray-800 shrink-0" referrerPolicy="no-referrer">
              <span class="truncate">${c.nama}</span>
            </div>
          </td>
          <td class="py-3 px-2 font-bold">${c.tipe}</td>
          <td class="py-3 px-2 font-black">Rp ${c.harga.toLocaleString('id-ID')}/Sesi</td>
          <td class="py-3 px-2"><span class="px-2 py-0.5 rounded text-[10px] font-bold ${c.tersedia === 'yes' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}">${c.tersedia === 'yes' ? 'Tersedia' : 'Tutup'}</span></td>
          <td class="py-3 px-2 text-right space-x-1">
            <button class="p-1 px-2.5 bg-gray-50 border border-gray-150 dark:bg-gray-900 dark:border-gray-800 text-[10px] font-bold rounded hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-600 cursor-pointer transition-all edit-court-trig" data-id="${c.id}">Edit</button>
            <button class="p-1 px-2 text-red-500 hover:bg-red-500/10 text-[10px] rounded cursor-pointer transition-colors delete-court-trig" data-id="${c.id}">Hapus</button>
          </td>
        </tr>
      `;
    }).join('');

    // Bind events
    document.querySelectorAll('.edit-court-trig').forEach(el => {
      el.addEventListener('click', () => handleEditCourt(el.getAttribute('data-id')));
    });
    document.querySelectorAll('.delete-court-trig').forEach(el => {
      el.addEventListener('click', () => handleDeleteCourt(el.getAttribute('data-id')));
    });

    if (window.lucide) lucide.createIcons();
  },

  renderPromosList(state, handleDeletePromo) {
    const parent = document.getElementById('admin-promo-rows');
    if (!parent) return;

    if (state.promos.length === 0) {
      parent.innerHTML = `<tr><td colspan="5" class="py-10 text-center text-gray-400">Tidak ada kupon promo aktif.</td></tr>`;
      return;
    }

    parent.innerHTML = state.promos.map(p => `
      <tr class="border-b border-gray-100 dark:border-gray-850">
        <td class="py-3 px-2 font-mono font-bold text-emerald-600 dark:text-emerald-400">${p.kode}</td>
        <td class="py-3 px-2 font-black">${p.persen}%</td>
        <td class="py-3 px-2 text-gray-400 font-bold leading-normal">${p.desc}</td>
        <td class="py-3 px-2"><span class="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-500 font-bold">Aktif</span></td>
        <td class="py-3 px-2 text-right">
          <button class="p-1 px-2.5 bg-red-500/5 text-red-500 font-bold text-[10px] hover:bg-red-500/10 rounded cursor-pointer transition-colors delete-promo-trig" data-code="${p.kode}">Tarik Promo</button>
        </td>
      </tr>
    `).join('');

    // Bind event
    document.querySelectorAll('.delete-promo-trig').forEach(el => {
      el.addEventListener('click', () => handleDeletePromo(el.getAttribute('data-code')));
    });
  },

  renderMessagesList(state, handleDeleteMessage) {
    const parent = document.getElementById('admin-message-rows');
    if (!parent) return;

    if (state.messages.length === 0) {
      parent.innerHTML = `<tr><td colspan="4" class="py-10 text-center text-gray-400">Tidak ada pesan masuk dari pengunjung.</td></tr>`;
      return;
    }

    parent.innerHTML = state.messages.map((m, idx) => `
      <tr class="border-b border-gray-100 dark:border-gray-850">
        <td class="py-3 px-2 font-bold">${m.nama}</td>
        <td class="py-3 px-2 font-mono text-gray-400">${m.email}</td>
        <td class="py-3 px-2 font-medium leading-relaxed text-gray-700 dark:text-gray-350">${m.pesan}</td>
        <td class="py-3 px-2 text-right">
          <button class="p-1 px-2.5 bg-red-500/10 hover:bg-red-650 hover:text-white text-red-500 font-bold text-[10px] rounded cursor-pointer transition-colors delete-msg-trig" data-idx="${idx}">Arsipkan</button>
        </td>
      </tr>
    `).join('');

    document.querySelectorAll('.delete-msg-trig').forEach(el => {
      el.addEventListener('click', () => handleDeleteMessage(parseInt(el.getAttribute('data-idx'))));
    });
  },

  renderUsersList(state, handleDeleteUser) {
    const parent = document.getElementById('admin-user-rows');
    if (!parent) return;

    const searchVal = document.getElementById('admin-user-search')?.value.trim().toLowerCase() || '';

    const filteredUsers = state.users.filter(u => {
      return u.nama.toLowerCase().includes(searchVal) || 
             u.email.toLowerCase().includes(searchVal) ||
             u.id.toLowerCase().includes(searchVal);
    });

    if (filteredUsers.length === 0) {
      parent.innerHTML = `<tr><td colspan="5" class="py-10 text-center text-gray-400">Tidak ada data pelanggan terdaftar.</td></tr>`;
      return;
    }

    parent.innerHTML = filteredUsers.map(u => {
      let actionBtn = '';
      if (u.role !== 'admin' && u.role !== 'owner' && u.id !== (state.currentUser ? state.currentUser.id : '')) {
        actionBtn = `<button class="p-1 px-2.5 bg-red-500/10 hover:bg-red-600 hover:text-white text-red-500 font-extrabold text-[10px] rounded cursor-pointer transition-colors active:scale-95 delete-usr-trig" data-id="${u.id}">Hapus Akun</button>`;
      } else {
        actionBtn = `<span class="text-[10px] text-gray-450 dark:text-gray-500 font-bold uppercase italic select-none">Sistem GOR</span>`;
      }

      const roleStyle = u.role === 'admin' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/15' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/15';

      return `
        <tr class="border-b border-gray-100 dark:border-gray-850">
          <td class="py-3 px-2 font-mono font-bold text-gray-400 select-all">${u.id}</td>
          <td class="py-3 px-2 font-bold">${u.nama}</td>
          <td class="py-3 px-2 font-mono text-gray-450 dark:text-gray-400 select-all">${u.email}</td>
          <td class="py-3 px-2"><span class="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${roleStyle}">${u.role}</span></td>
          <td class="py-3 px-2 text-right">${actionBtn}</td>
        </tr>
      `;
    }).join('');

    document.querySelectorAll('.delete-usr-trig').forEach(el => {
      el.addEventListener('click', () => handleDeleteUser(el.getAttribute('data-id')));
    });

    if (window.lucide) lucide.createIcons();
  }
};
