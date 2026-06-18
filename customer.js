// --- CUSTOMER DASHBOARD VIEW RENDERER ---
import { DB } from '../db.js';

export const CustomerView = {
  render(state, switchCustomerTab, handleBookingSubmit, selectPaymentMethod, applyPromoCode, handleProfileUpdate) {
    const mainContainer = document.getElementById('view-customer');
    if (!mainContainer) return;

    // Fill main container skeleton
    mainContainer.innerHTML = `
      <!-- Sidebar nav button deck -->
      <aside class="w-full md:w-64 shrink-0 flex flex-row md:flex-col gap-2 overflow-x-auto pb-3 md:pb-0 scrollbar-hide">
        <!-- User Info Badge -->
        <div class="hidden md:flex flex-col items-center p-5 bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl text-center mb-4 transition-colors">
          <img id="cust-profile-pic" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" class="h-16 w-16 rounded-full border-2 border-emerald-500 object-cover mb-3" alt="Foto Profil" referrerPolicy="no-referrer">
          <span id="cust-profile-name" class="font-extrabold text-sm text-gray-800 dark:text-white">Active Member</span>
          <span class="text-[10px] uppercase font-bold text-gray-400 mt-0.5">Bronze Member GOR</span>
        </div>

        <button id="btn-cust-book" class="px-4 py-3 bg-emerald-500 dark:bg-emerald-600 text-white flex items-center gap-2.5 rounded-xl font-bold text-xs cursor-pointer select-none shrink-0 transition-all">
          <i data-lucide="calendar" class="w-4 h-4"></i> Booking Sesi Lapangan
        </button>
        <button id="btn-cust-bookings" class="px-4 py-3 bg-white dark:bg-gray-950 text-gray-500 dark:text-gray-400 hover:bg-emerald-50/10 flex items-center gap-2.5 rounded-xl font-bold text-xs cursor-pointer select-none shrink-0 border border-gray-100 dark:border-gray-800/80 transition-all">
          <i data-lucide="receipt" class="w-4 h-4"></i> Riwayat & Pembayaran
        </button>
        <button id="btn-cust-profile" class="px-4 py-3 bg-white dark:bg-gray-950 text-gray-500 dark:text-gray-400 hover:bg-emerald-50/10 flex items-center gap-2.5 rounded-xl font-bold text-xs cursor-pointer select-none shrink-0 border border-gray-100 dark:border-gray-800/80 transition-all">
          <i data-lucide="user-cog" class="w-4 h-4"></i> Pengaturan Akun
        </button>
        <button id="btn-cust-logout" class="relative z-10 px-4 py-3 bg-red-50 dark:bg-red-950/20 text-red-500 hover:bg-red-500 hover:text-white dark:hover:bg-red-500 dark:hover:text-white flex items-center gap-2.5 rounded-xl font-bold text-xs cursor-pointer select-none shrink-0 border border-red-200 dark:border-red-900/30 transition-all active:scale-95" shadow-xs>
          <i data-lucide="log-out" class="w-4 h-4 pointer-events-none"></i> Keluar Akun
        </button>
      </aside>

      <!-- Sub dashboard tabs screen boards -->
      <section class="flex-grow">
        
        <!-- TAB A: Booking Sesi Form Board -->
        <div id="cust-tab-book">
          <div class="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-xs transition-colors">
            <h2 class="text-xl font-black text-gray-900 dark:text-white mb-1 tracking-tight flex items-center gap-1.5">
              <i data-lucide="sparkles" class="text-emerald-500 w-5 h-5"></i> Formulir Sewa Lapangan Bulutangkis
            </h2>
            <p class="text-xs text-gray-400 mb-6">Pilih lapangan, tentukan tanggal bermain, pilih jam kosong, dan dapatkan potongan harga menggiurkan!</p>

            <form id="booking-submit-form" class="space-y-6">
              <!-- 1. Court choice select mapping -->
              <div class="flex flex-col gap-2">
                <label class="text-xs font-extrabold text-gray-400 uppercase tracking-wider">Langkah 1: Pilih Lapangan GOR</label>
                <div id="booking-court-select" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <!-- Dynamically populated options -->
                </div>
              </div>

              <!-- 2. Date input choice mapping -->
              <div class="max-w-xs flex flex-col gap-2">
                <label class="text-xs font-extrabold text-gray-400 uppercase tracking-wider" for="booking-date-picker">Langkah 2: Tentukan Tanggal Bermain</label>
                <input type="date" id="booking-date-picker" class="p-3 bg-gray-50 dark:bg-gray-900 text-xs font-bold rounded-xl border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-gray-800 dark:text-white">
              </div>

              <!-- 3. Slots Sesi multiselect board tracker -->
              <div class="flex flex-col gap-2">
                <div class="flex items-center justify-between">
                  <label class="text-xs font-extrabold text-gray-400 uppercase tracking-wider">Langkah 3: Pilih Sesi Jam (Dapat pilih beberapa sesi)</label>
                  <div class="flex gap-2 text-[10px]">
                    <span class="inline-flex items-center gap-1"><span class="h-2 w-2 rounded bg-gray-100 dark:bg-gray-800"></span> Tersedia</span>
                    <span class="inline-flex items-center gap-1"><span class="h-2 w-2 rounded bg-emerald-500"></span> Terpilih</span>
                    <span class="inline-flex items-center gap-1"><span class="h-2 w-2 rounded bg-red-400"></span> Dipesan Orang</span>
                  </div>
                </div>
                <div id="booking-slots-grid" class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <!-- Session hourly boxes are generated dynamically -->
                </div>
              </div>

              <!-- 3b. Payment Method select mapping -->
              <div class="flex flex-col gap-2">
                <label class="text-xs font-extrabold text-gray-400 uppercase tracking-wider">Langkah 4: Pilih Metode Pembayaran</label>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label id="payment-card-bca" class="border-2 border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10 p-3.5 rounded-2xl cursor-pointer hover:border-emerald-500 transition-all flex flex-col justify-between h-20 payment-method-card" data-method="bca">
                    <div class="flex items-center justify-between pointer-events-none">
                      <span class="font-black text-xs text-gray-900 dark:text-white">Bank BCA</span>
                      <input type="radio" name="payment-method-radio" id="pay-bca" checked class="accent-emerald-500">
                    </div>
                    <span class="text-[9px] text-gray-400 dark:text-gray-500 mt-1 block pointer-events-none">Transfer Instan Luar Biasa</span>
                  </label>
                  <label id="payment-card-mandiri" class="border-2 border-gray-200 dark:border-gray-800 p-3.5 rounded-2xl cursor-pointer hover:border-emerald-500 transition-all flex flex-col justify-between h-20 payment-method-card" data-method="mandiri">
                    <div class="flex items-center justify-between pointer-events-none">
                      <span class="font-black text-xs text-gray-900 dark:text-white">Bank Mandiri</span>
                      <input type="radio" name="payment-method-radio" id="pay-mandiri" class="accent-emerald-500">
                    </div>
                    <span class="text-[9px] text-gray-400 dark:text-gray-500 mt-1 block pointer-events-none">Transfer Bank Mandiri</span>
                  </label>
                  <label id="payment-card-qris" class="border-2 border-gray-200 dark:border-gray-800 p-3.5 rounded-2xl cursor-pointer hover:border-emerald-500 transition-all flex flex-col justify-between h-20 payment-method-card" data-method="qris">
                    <div class="flex items-center justify-between pointer-events-none">
                      <span class="font-black text-xs text-gray-900 dark:text-white">QRIS (E-Wallet)</span>
                      <input type="radio" name="payment-method-radio" id="pay-qris" class="accent-emerald-500">
                    </div>
                    <span class="text-[9px] text-gray-400 dark:text-gray-500 mt-1 block pointer-events-none">GoPay, OVO, Dana, LinkAja</span>
                  </label>
                </div>
              </div>

              <!-- 4. Coupon Promo discount input -->
              <div class="flex flex-col gap-2">
                <label class="text-xs font-extrabold text-gray-400 uppercase tracking-wider" for="booking-promo-code">Kupon Potongan Diskon (Opsional)</label>
                <div class="flex gap-2 max-w-sm">
                  <input type="text" id="booking-promo-code" placeholder="Contoh: SMASH20" class="p-3 bg-gray-50 dark:bg-gray-900 text-xs font-mono font-bold rounded-xl border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 uppercase flex-grow text-gray-800 dark:text-white">
                  <button type="button" id="apply-promo-btn" class="px-4 py-3 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-emerald-500 dark:hover:bg-emerald-600 hover:text-white font-black text-xs rounded-xl cursor-pointer active:scale-95 transition-all">
                    Terapkan
                  </button>
                </div>
                <p id="promo-notice" class="text-[10px] text-gray-400 leading-none mt-1"></p>
              </div>

              <!-- 5. Billing summary box -->
              <div class="bg-gray-50 dark:bg-gray-900/60 rounded-2xl p-4 border border-dashed border-gray-200 dark:border-gray-800 space-y-2 text-xs">
                <div class="flex justify-between text-gray-400">
                  <span>Subtotal Sesi Penyewaan</span>
                  <span id="bill-subtotal" class="font-bold text-gray-600 dark:text-gray-300">Rp 0</span>
                </div>
                <div class="flex justify-between text-gray-400">
                  <span>Diskon Kupon</span>
                  <span id="bill-discount" class="font-bold text-red-500">- Rp 0</span>
                </div>
                <div class="flex justify-between border-t border-gray-200 dark:border-gray-800 pt-2 text-sm font-black">
                  <span class="text-gray-800 dark:text-white">Estimasi Total Bayar</span>
                  <span id="bill-grandtotal" class="text-emerald-500">Rp 0</span>
                </div>
              </div>

              <button type="submit" class="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs rounded-xl shadow-md active:scale-95 cursor-pointer transition-all uppercase flex items-center justify-center gap-1.5">
                <i data-lucide="check-circle" class="w-4 h-4"></i> Selesaikan Registrasi Booking & Dapatkan Invoice
              </button>
            </form>
          </div>
        </div>

        <!-- TAB B: History Riwayat & Pembayaran Board -->
        <div id="cust-tab-bookings" class="hidden space-y-6 animate-fadeIn">
          <div class="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 transition-colors">
            <h2 class="text-lg font-black text-gray-900 dark:text-white mb-1 tracking-tight flex items-center gap-1.5">
              <i data-lucide="receipt" class="w-5 h-5 text-emerald-500"></i> Riwayat Transaksi Booking Saya
            </h2>
            <p class="text-xs text-gray-400 mb-6">Patuhi batas waktu pembayaran untuk mencegah otomatisasi pembatalan sewa lapangan.</p>

            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs border-collapse">
                <thead>
                  <tr class="border-b border-gray-100 dark:border-gray-800 text-gray-400 font-extrabold uppercase tracking-wide">
                    <th class="py-3 px-2">ID Booking</th>
                    <th class="py-3 px-2">Lapangan GOR</th>
                    <th class="py-3 px-2">Tanggal Main</th>
                    <th class="py-3 px-2">Sesi Dipilih (Durasi)</th>
                    <th class="py-3 px-2">Grand Total</th>
                    <th class="py-3 px-2">Status</th>
                    <th class="py-3 px-2 text-right">Aksi Tindakan</th>
                  </tr>
                </thead>
                <tbody id="customer-booking-rows" class="divide-y divide-gray-100 dark:divide-gray-800 text-gray-800 dark:text-gray-200">
                  <!-- Dynamically packed -->
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- TAB C: Profile Account Settings -->
        <div id="cust-tab-profile" class="hidden animate-fadeIn">
          <div class="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 transition-colors">
            <h2 class="text-lg font-black text-gray-900 dark:text-white mb-1 tracking-tight flex items-center gap-1.5">
              <i data-lucide="user-cog" class="w-5 h-5 text-emerald-500"></i> Pengaturan Informasi Akun Member
            </h2>
            <p class="text-xs text-gray-400 mb-6">Sesuaikan nama resmi pemesanan untuk kenyamanan validasi gerbang pas masuk GOR.</p>

            <form id="profile-update-form" class="space-y-4 max-w-md">
              <div class="flex flex-col gap-1">
                <label class="text-[11px] font-bold text-gray-500">Nama Resmi Member</label>
                <input type="text" id="profile-name" required class="p-3 bg-gray-50 dark:bg-gray-900 text-xs rounded-xl border border-gray-200 dark:border-gray-800 focus:outline-none text-gray-850 dark:text-white font-semibold">
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-[11px] font-bold text-gray-500">Alamat Email Terdaftar (Tidak dapat diedit)</label>
                <input type="email" id="profile-email" disabled class="p-3 bg-gray-100 dark:bg-gray-800 text-xs rounded-xl border border-gray-200 dark:border-gray-800 text-gray-400 cursor-not-allowed">
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-[11px] font-bold text-gray-500">Ganti Password</label>
                <div class="relative flex items-center">
                  <input type="password" id="profile-password" placeholder="Kosongkan jika tidak ingin diubah" class="w-full p-3 pr-10 bg-gray-50 dark:bg-gray-900 text-xs rounded-xl border border-gray-200 dark:border-gray-800 focus:outline-none text-gray-850 dark:text-white font-semibold">
                  <button type="button" class="absolute right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer focus:outline-none flex items-center" id="btn-toggle-profile-pw" title="Tampilkan Password">
                    <i data-lucide="eye" id="eye-icon-profile-password" class="w-4 h-4"></i>
                  </button>
                </div>
              </div>
              <button type="submit" class="p-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer">
                Simpan Perubahan Akun
              </button>
            </form>

            <!-- Fallback Logout Card inside Settings Panel -->
            <div class="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800/60 max-w-md">
              <h4 class="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider mb-2">Sesi & Keamanan Akun</h4>
              <p class="text-[11px] text-gray-400 mb-4 leading-relaxed">Apakah Anda ingin keluar dari akun member Smash Arena saat ini?</p>
              <button id="profile-panel-logout-btn" class="w-full sm:w-auto px-5 py-3 bg-red-500/10 hover:bg-red-600 text-red-500 hover:text-white font-black text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95">
                <i data-lucide="log-out" class="w-4 h-4"></i> Keluar Dari Akun Anda
              </button>
            </div>
          </div>
        </div>

      </section>
    `;

    // Fill profile info if available
    const nameInput = document.getElementById('profile-name');
    const emailInput = document.getElementById('profile-email');
    if (nameInput && emailInput && state.currentUser) {
      nameInput.value = state.currentUser.nama || '';
      emailInput.value = state.currentUser.email || '';
    }

    // Populate profile pic and name in card
    const custProfilePic = document.getElementById('cust-profile-pic');
    const custProfileName = document.getElementById('cust-profile-name');
    if (custProfileName && state.currentUser) {
      custProfileName.textContent = state.currentUser.nama || 'Bronze Member';
    }

    // Set side badge class
    switchCustomerTab(state.activeCustomerTab);

    // Bind layout button deck
    const btnBook = document.getElementById('btn-cust-book');
    const btnBookings = document.getElementById('btn-cust-bookings');
    const btnProfile = document.getElementById('btn-cust-profile');
    const btnLogout = document.getElementById('btn-cust-logout');
    const btnProfileLogout = document.getElementById('profile-panel-logout-btn');

    if (btnBook) btnBook.addEventListener('click', () => switchCustomerTab('book'));
    if (btnBookings) btnBookings.addEventListener('click', () => switchCustomerTab('bookings'));
    if (btnProfile) btnProfile.addEventListener('click', () => switchCustomerTab('profile'));
    if (btnLogout) btnLogout.addEventListener('click', () => window.handleLogout());
    if (btnProfileLogout) btnProfileLogout.addEventListener('click', () => window.handleLogout());

    // Bind sub-form submit
    const bookingForm = document.getElementById('booking-submit-form');
    if (bookingForm) {
      bookingForm.addEventListener('submit', handleBookingSubmit);
    }

    // Bind profile updates form
    const profileForm = document.getElementById('profile-update-form');
    if (profileForm) {
      profileForm.addEventListener('submit', handleProfileUpdate);
    }

    // Bind coupon code buttons
    const applyPromoBtn = document.getElementById('apply-promo-btn');
    if (applyPromoBtn) {
      applyPromoBtn.addEventListener('click', applyPromoCode);
    }

    // Bind payment cards Selection triggers
    document.querySelectorAll('.payment-method-card').forEach(card => {
      card.addEventListener('click', () => {
        const met = card.getAttribute('data-method');
        selectPaymentMethod(met, card);
      });
    });

    // Populate Coupon code text if preset
    const promoCodeInput = document.getElementById('booking-promo-code');
    if (promoCodeInput && state.bookingFields.appliedPromo) {
      promoCodeInput.value = state.bookingFields.appliedPromo.kode;
    }

    // Bind profile password visibility trigger
    const pwToggleBtn = document.getElementById('btn-toggle-profile-pw');
    if (pwToggleBtn) {
      pwToggleBtn.addEventListener('click', () => {
        const input = document.getElementById('profile-password');
        const eye = document.getElementById('eye-icon-profile-password');
        if (input && eye) {
          if (input.type === 'password') {
            input.type = 'text';
            eye.setAttribute('data-lucide', 'eye-off');
          } else {
            input.type = 'password';
            eye.setAttribute('data-lucide', 'eye');
          }
          if (window.lucide) lucide.createIcons();
        }
      });
    }

    if (window.lucide) {
      lucide.createIcons();
    }
  }
};
