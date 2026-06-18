// --- GUEST / LANDING VIEW RENDERER ---
import { DB } from '../db.js';

export const BerandaView = {
  render(state, triggerBookingView, handleContactSubmit) {
    const mainContainer = document.getElementById('view-beranda');
    if (!mainContainer) return;

    // We can populate the main view-beranda with its inner HTML content modularly
    mainContainer.innerHTML = `
      <!-- Owner Broadcast Announcement Banner -->
      <div id="owner-banner-container" class="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white px-4 py-3 flex items-center justify-center text-center text-xs font-semibold shadow-inner hidden">
        <div class="flex items-center gap-2 max-w-4xl mx-auto flex-wrap justify-center">
          <span class="px-2 py-0.5 bg-white/20 rounded text-[9px] font-black uppercase tracking-wider shrink-0 flex items-center gap-0.5">
            <i data-lucide="megaphone" class="w-3 h-3"></i> Pengumuman Pemilik GOR
          </span>
          <span id="owner-announcement-text" class="tracking-tight block leading-snug"></span>
        </div>
      </div>

      <!-- Hero Banner Section -->
      <section class="relative bg-emerald-900 text-white py-16 px-4 md:px-8 text-center overflow-hidden">
        <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.2),transparent_70%)] pointer-events-none"></div>
        <div class="max-w-4xl mx-auto flex flex-col items-center relative z-10">
          <div class="flex flex-wrap items-center justify-center gap-2 mb-4">
            <span class="px-3.5 py-1.5 bg-emerald-500/15 border border-emerald-500/25 rounded-full text-xs font-extrabold text-emerald-400 uppercase tracking-widest">
              ✨ RESERVASI INSTAN CEPAT & TERPERCAYA
            </span>
            <span id="gor-status-badge" class="px-3 py-1.5 bg-emerald-600 text-white border border-emerald-500/20 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 font-sans">
              <span class="h-1.5 w-1.5 rounded-full bg-white animate-pulse"></span> GOR BUKA
            </span>
          </div>
          <h1 class="text-3xl md:text-5xl font-black tracking-tight leading-tight max-w-2xl mb-4">
            Rasakan Sensasi Main di Arena <span class="text-emerald-400">Bulutangkis Premium</span> Terbaik!
          </h1>
          <p class="text-sm md:text-base text-emerald-100 max-w-xl mb-8 leading-relaxed">
            Pemesanan lapangan modern Smash Arena dengan lantai standar internasional, fasilitas mandi air hangat, kantin bertenaga, & sistem online instan 24 Jam.
          </p>
          <div class="flex flex-col sm:flex-row gap-3">
            <button id="hero-booking-btn" class="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-sm rounded-xl cursor-pointer shadow-lg shadow-emerald-500/25 border border-emerald-400/20 active:scale-95 transition-all">
              Pesan Lapangan Sekarang
            </button>
            <a href="#section-fasilitas" class="px-6 py-3 bg-emerald-800/40 hover:bg-emerald-800/60 border border-emerald-700/30 text-white font-extrabold text-sm rounded-xl cursor-pointer active:scale-95 transition-all inline-flex items-center justify-center">
              Lihat Standard Fasilitas
            </a>
          </div>
        </div>
      </section>

      <!-- Courts Catalog Listing Grid -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div class="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h2 class="text-2xl font-black tracking-tight text-gray-900 dark:text-white">Pilihan Lapangan Badminton</h2>
            <p class="text-xs text-gray-400 mt-1">Kami menyediakan 5 jenis lantai lapangan bulutangkis premium berstandar dunia (BWF).</p>
          </div>
          <span class="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 px-3 py-1 bg-emerald-500/10 rounded-full w-fit">
            ⚽ Terawat & Bersih Setiap Jam
          </span>
        </div>

        <div id="courts-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          <!-- Filled Dynamically -->
        </div>
      </section>

      <!-- BWF Standard Specifications Card Section -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full animate-fadeIn">
        <div class="bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-indigo-500/5 rounded-3xl p-6 md:p-8 border border-emerald-500/10 dark:border-emerald-500/5 flex flex-col xl:flex-row items-center gap-6 justify-between">
          <div class="space-y-2 md:max-w-xl text-center xl:text-left">
            <span class="px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-full font-bold text-[10px] uppercase tracking-wider inline-block w-fit">📐 Standard Ukuran Resmi (BWF)</span>
            <h3 class="text-xl font-black text-gray-900 dark:text-white tracking-tight">Setiap Lapangan Smash Arena Sesuai Standar BWF</h3>
            <p class="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">Apapun jenis lantainya, ukuran garis dan ketinggian net lapangan bulutangkis yang digunakan tetap mematuhi standardisasi Federasi Bulutangkis Dunia (BWF) secara presisi.</p>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full xl:w-auto shrink-0 font-mono text-[11px]">
            <div class="p-3 bg-white dark:bg-gray-950 border border-gray-150 dark:border-gray-850 rounded-2xl flex items-center gap-2.5 shadow-xs transition-transform hover:scale-105">
              <div class="h-8 w-8 bg-emerald-500/15 text-emerald-500 rounded-xl flex items-center justify-center shrink-0"><i data-lucide="arrows-left-right" class="w-4 h-4"></i></div>
              <div>
                <span class="text-[9px] uppercase font-bold text-gray-400 block leading-none mb-1">Panjang</span>
                <span class="font-extrabold text-gray-800 dark:text-gray-200 block">13.40 Meter</span>
              </div>
            </div>
            <div class="p-3 bg-white dark:bg-gray-950 border border-gray-150 dark:border-gray-850 rounded-2xl flex items-center gap-2.5 shadow-xs transition-transform hover:scale-105">
              <div class="h-8 w-8 bg-emerald-500/15 text-emerald-500 rounded-xl flex items-center justify-center shrink-0"><i data-lucide="split" class="w-4 h-4"></i></div>
              <div>
                <span class="text-[9px] uppercase font-bold text-gray-400 block leading-none mb-1">Lebar Ganda</span>
                <span class="font-extrabold text-gray-800 dark:text-gray-200 block">6.10 Meter</span>
              </div>
            </div>
            <div class="p-3 bg-white dark:bg-gray-950 border border-gray-150 dark:border-gray-850 rounded-2xl flex items-center gap-2.5 shadow-xs transition-transform hover:scale-105">
              <div class="h-8 w-8 bg-emerald-500/15 text-emerald-500 rounded-xl flex items-center justify-center shrink-0"><i data-lucide="shrink" class="w-4 h-4"></i></div>
              <div>
                <span class="text-[9px] uppercase font-bold text-gray-400 block leading-none mb-1">Lebar Tunggal</span>
                <span class="font-extrabold text-gray-800 dark:text-gray-200 block">5.18 Meter</span>
              </div>
            </div>
            <div class="p-3 bg-white dark:bg-gray-950 border border-gray-150 dark:border-gray-850 rounded-2xl flex items-center gap-2.5 shadow-xs transition-transform hover:scale-105">
              <div class="h-8 w-8 bg-emerald-500/15 text-emerald-500 rounded-xl flex items-center justify-center shrink-0"><i data-lucide="chevrons-up-down" class="w-4 h-4"></i></div>
              <div>
                <span class="text-[9px] uppercase font-bold text-gray-400 block leading-none mb-1">Tinggi Net</span>
                <span class="font-extrabold text-gray-800 dark:text-gray-200 block">1.524 Meter</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Active Promo Slider Cards -->
      <section class="bg-gray-100 dark:bg-gray-950 transition-colors py-12 px-4 shadow-xs">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="mb-8">
            <h2 class="text-xl font-black tracking-tight text-gray-900 dark:text-white">Daftar Promo Aktif Terbaru</h2>
            <p class="text-xs text-gray-400 mt-1">Gunakan kupon di bawah saat checkout pemesanan untuk potongan harga spesial.</p>
          </div>
          <div id="promos-container" class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Dynamically populated promos -->
          </div>
        </div>
      </section>

      <!-- Facilities list standard bento-style section -->
      <section id="section-fasilitas" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div class="text-center max-w-2xl mx-auto mb-10">
          <h2 class="text-2xl font-black tracking-tight text-gray-900 dark:text-white">Fasilitas Penunjang GOR</h2>
          <p class="text-xs text-gray-400 mt-1.5 leading-relaxed">Nikmati kenyamanan bermain bulutangkis dengan ketersediaan fasilitas yang lengkap dan modern untuk memanjakan seluruh pemain.</p>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div class="p-5 rounded-2xl bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 text-center flex flex-col items-center gap-3 shadow-xs">
            <div class="h-10 w-10 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center"><i data-lucide="parking-circle" class="w-5 h-5"></i></div>
            <span class="font-bold text-xs text-gray-900 dark:text-white">Area Parkir Luas</span>
            <p class="text-[10px] text-gray-400 leading-relaxed">Keamanan CCTV 24 Jam untuk Mobil & Motor.</p>
          </div>
          <div class="p-5 rounded-2xl bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 text-center flex flex-col items-center gap-3 shadow-xs">
            <div class="h-10 w-10 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center"><i data-lucide="heart" class="w-5 h-5"></i></div>
            <span class="font-bold text-xs text-gray-900 dark:text-white">Mushola Bersih</span>
            <p class="text-[10px] text-gray-400 leading-relaxed">Ruang ibadah nyaman lengkap sarana wudhu.</p>
          </div>
          <div class="p-5 rounded-2xl bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 text-center flex flex-col items-center gap-3 shadow-xs">
            <div class="h-10 w-10 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center"><i data-lucide="shower-head" class="w-5 h-5"></i></div>
            <span class="font-bold text-xs text-gray-900 dark:text-white">Toilet & Shower</span>
            <p class="text-[10px] text-gray-400 leading-relaxed">Ruang shower terpisah, air bersih melimpah.</p>
          </div>
          <div class="p-5 rounded-2xl bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 text-center flex flex-col items-center gap-3 shadow-xs">
            <div class="h-10 w-10 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center"><i data-lucide="coffee" class="w-5 h-5"></i></div>
            <span class="font-bold text-xs text-gray-900 dark:text-white">Kantin Enerjik</span>
            <p class="text-[10px] text-gray-400 leading-relaxed">Tersedia isotonic drinks, kopi, kok, & grip raket.</p>
          </div>
        </div>
      </section>

      <!-- Hubungi Kami Message form section -->
      <section class="bg-gray-100 dark:bg-gray-950 transition-colors py-12 px-4 shadow-inner">
        <div class="max-w-3xl mx-auto bg-white dark:bg-gray-900 rounded-2xl p-6 sm:p-8 border border-gray-200/50 dark:border-gray-800/80 shadow-xs">
          <h3 class="text-lg font-black tracking-tight text-emerald-600 dark:text-emerald-400 mb-1 flex items-center gap-1.5 justify-center sm:justify-start">
            <i data-lucide="message-square-text" class="w-5 h-5"></i> Hubungi Manajemen Pusat
          </h3>
          <p class="text-xs text-gray-400 mb-6 text-center sm:text-left">Kirim pesan pertanyaan, masukan, atau keluhan Anda. Kami akan menjawab via email secepatnya.</p>
          
          <form id="contact-form" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="text" id="contact-nama" placeholder="Nama Lengkap" required class="p-3 bg-gray-50 dark:bg-gray-950 text-xs rounded-xl border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-1 focus:ring-emerald-500">
            <input type="email" id="contact-email" placeholder="Alamat Email" required class="p-3 bg-gray-50 dark:bg-gray-950 text-xs rounded-xl border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-1 focus:ring-emerald-500">
            <textarea id="contact-pesan" placeholder="Tulis rincian pesan Anda di sini..." required class="p-3 bg-gray-50 dark:bg-gray-950 text-xs rounded-xl border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:col-span-2 h-24 resize-none"></textarea>
            <button type="submit" class="p-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl cursor-pointer shadow-md transition-all sm:col-span-2 active:scale-95">
              Kirim Pertanyaan
            </button>
          </form>
        </div>
      </section>
    `;

    // Dynamic Court grids
    const courtsRow = document.getElementById('courts-grid');
    if (courtsRow) {
      courtsRow.innerHTML = state.courts.map(c => {
        const badgeClass = c.tersedia === 'yes' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/25' : 'bg-red-500/10 text-red-500 border-red-500/25';
        const badgeText = c.tersedia === 'yes' ? 'Tersedia' : 'Tutup (Maintenis)';
        const courtImg = c.foto || 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=600&q=80';
        return `
          <div class="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden shadow-xs transition-colors hover:scale-[1.03] duration-300 flex flex-col justify-between">
            <!-- Court Image Layer -->
            <div class="h-44 w-full relative overflow-hidden bg-gray-100 dark:bg-gray-900">
              <img src="${courtImg}" alt="${c.nama}" class="w-full h-full object-cover transition-transform duration-500 hover:scale-110" referrerPolicy="no-referrer">
              <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
              <div class="absolute top-3 left-3">
                <span class="px-2.5 py-1 backdrop-blur-md bg-black/40 text-white border border-white/10 rounded-lg text-[9px] uppercase tracking-wider font-extrabold ${c.tersedia === 'yes' ? 'text-emerald-400' : 'text-red-400'}">${badgeText}</span>
              </div>
              <div class="absolute bottom-3 left-4">
                <span class="px-2 py-0.5 bg-black/40 text-emerald-400 font-mono text-[9px] font-black rounded border border-emerald-500/30 uppercase">ID: ${c.id}</span>
              </div>
            </div>
            <div class="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h3 class="font-extrabold text-sm text-gray-900 dark:text-white tracking-tight leading-snug">${c.nama}</h3>
                <p class="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                  <i data-lucide="layers" class="w-3.5 h-3.5 text-gray-400"></i> Bahan: ${c.tipe}
                </p>
              </div>
              <div class="mt-4 pt-3 border-t border-gray-100 dark:border-gray-850 flex justify-between items-center">
                <div class="flex flex-col">
                  <span class="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Tarif Sesi</span>
                  <span class="font-extrabold text-xs text-emerald-600 dark:text-emerald-400">Rp ${c.harga.toLocaleString('id-ID')}/Sesi</span>
                </div>
                <button class="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors cursor-pointer court-booking-trigger" data-id="${c.id}" title="Pesan Lapangan">
                  <i data-lucide="plus" class="w-4 h-4"></i>
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    // Dynamic Promos grid
    const promosRow = document.getElementById('promos-container');
    if (promosRow) {
      promosRow.innerHTML = state.promos.map(p => `
        <div class="p-5 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/50 dark:border-gray-800 transition-colors flex flex-col justify-between shadow-xs">
          <div>
            <span class="px-3 py-1 bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 font-mono font-black text-xs rounded-lg select-all border border-emerald-500/10 uppercase tracking-wider leading-none block w-fit mb-3">${p.kode}</span>
            <h4 class="font-black text-sm text-gray-900 dark:text-white mb-1.5 leading-tight">Potongan Harga ${p.persen}%</h4>
            <p class="text-[10px] text-gray-400 leading-relaxed">${p.desc}</p>
          </div>
          <button class="w-full mt-4 p-2.5 bg-gray-50 border border-gray-100 hover:bg-emerald-500 dark:bg-gray-950 dark:border-gray-850 dark:hover:bg-emerald-600 hover:text-white dark:hover:text-white font-bold text-[10px] text-emerald-600 dark:text-emerald-400 rounded-xl transition-all uppercase cursor-pointer use-promo-trigger" data-code="${p.kode}">Gunakan Kupon</button>
        </div>
      `).join('');
    }

    // Bind event listeners
    const triggerBtn = document.getElementById('hero-booking-btn');
    if (triggerBtn) {
      triggerBtn.addEventListener('click', triggerBookingView);
    }

    document.querySelectorAll('.court-booking-trigger').forEach(b => {
      b.addEventListener('click', () => {
        const id = b.getAttribute('data-id');
        state.bookingFields.courtId = id;
        triggerBookingView();
      });
    });

    document.querySelectorAll('.use-promo-trigger').forEach(b => {
      b.addEventListener('click', () => {
        const code = b.getAttribute('data-code');
        state.bookingFields.appliedPromo = state.promos.find(p => p.kode === code) || null;
        triggerBookingView();
      });
    });

    // Contact Form submission
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
      contactForm.addEventListener('submit', handleContactSubmit);
    }

    // Refresh Owner Banner Announcement if exists
    const storedAnn = localStorage.getItem('sa_announcement');
    const annContainer = document.getElementById('owner-banner-container');
    const annText = document.getElementById('owner-announcement-text');
    if (storedAnn && annContainer && annText) {
      annText.textContent = storedAnn;
      annContainer.classList.remove('hidden');
    }

    // Update operational badge
    const opStatus = localStorage.getItem('sa_gor_status') !== 'closed';
    const gorBadge = document.getElementById('gor-status-badge');
    if (gorBadge) {
      if (opStatus) {
        gorBadge.className = 'px-3 py-1.5 bg-emerald-600 text-white border border-emerald-500/20 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 font-sans';
        gorBadge.innerHTML = '<span class="h-1.5 w-1.5 rounded-full bg-white animate-pulse"></span> GOR BUKA';
      } else {
        gorBadge.className = 'px-3 py-1.5 bg-red-600 text-white border border-red-500/20 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 font-sans';
        gorBadge.innerHTML = '<span class="h-1.5 w-1.5 rounded-full bg-white"></span> GOR TUTUP';
      }
    }

    if (window.lucide) {
      lucide.createIcons();
    }
  }
};
