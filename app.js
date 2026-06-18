// --- CENTRAL CORE APPLICATION PROCESSOR ---
import { DB, state } from './db.js';
import { BerandaView } from './views/beranda.js';
import { CustomerView } from './views/customer.js';
import { AdminView } from './views/admin.js';
import { OwnerView } from './views/owner.js';

// --- CUSTOM DIALOG resolver ---
let confirmResolver = null;

// --- DYNAMIC DIALOG UTILS ---
export function openModal(name) {
  const modal = document.getElementById(`modal-${name}`);
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

export function closeModal(name) {
  const modal = document.getElementById(`modal-${name}`);
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

export function niceConfirm(title, message, options = {}) {
  return new Promise((resolve) => {
    confirmResolver = resolve;
    
    const confirmTitle = document.getElementById('confirm-title');
    const confirmMsg = document.getElementById('confirm-message');
    const yesBtn = document.getElementById('confirm-yes-btn');
    const iconContainer = document.getElementById('confirm-icon-container');
    const iconEl = document.getElementById('confirm-icon');
    
    if (confirmTitle) confirmTitle.innerText = title;
    if (confirmMsg) confirmMsg.innerText = message;
    
    if (yesBtn && iconContainer && iconEl) {
      // Reset classes
      yesBtn.className = "flex-1 py-2.5 text-white font-black rounded-xl cursor-pointer transition-all active:scale-95";
      iconContainer.className = "h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-3";
      
      if (options.type === 'danger') {
        yesBtn.classList.add('bg-red-500', 'hover:bg-red-650');
        iconContainer.classList.add('bg-red-500/10', 'text-red-500');
        iconEl.setAttribute('data-lucide', 'alert-triangle');
      } else {
        yesBtn.classList.add('bg-emerald-600', 'hover:bg-emerald-750');
        iconContainer.classList.add('bg-emerald-500/10', 'text-emerald-500');
        iconEl.setAttribute('data-lucide', 'help-circle');
      }
    }
    
    if (window.lucide) lucide.createIcons();
    openModal('confirm');
  });
}

export function closeConfirmModal(result) {
  closeModal('confirm');
  if (confirmResolver) {
    confirmResolver(result);
    confirmResolver = null;
  }
}

// --- VISUAL NOTIFICATION TOASTS ---
export function showToast(message, type = 'info') {
  const parent = document.getElementById('toast-wrapper');
  if (!parent) return;
  const tId = 'toast-' + Math.floor(Math.random() * 100000);
  const bg = type === 'success' ? 'bg-emerald-600' : type === 'error' ? 'bg-red-600' : 'bg-gray-800 dark:bg-gray-950 border border-gray-800';
  const text = 'text-white';
  const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'alert-triangle' : 'info';
  
  const el = document.createElement('div');
  el.id = tId;
  el.className = `p-3.5 rounded-2xl shadow-xl flex items-center justify-between gap-3 text-xs font-bold leading-normal ${bg} ${text} animate-fadeIn`;
  el.innerHTML = `
    <div class="flex items-center gap-2">
      <i data-lucide="${icon}" class="w-4.5 h-4.5 shrink-0"></i>
      <span>${message}</span>
    </div>
    <button class="text-white/60 hover:text-white toast-close-btn" data-target="${tId}"><i data-lucide="x" class="w-4 h-4"></i></button>
  `;
  parent.appendChild(el);
  
  // Bind close button
  el.querySelector('.toast-close-btn')?.addEventListener('click', () => {
    el.remove();
  });

  if (window.lucide) lucide.createIcons();
  setTimeout(() => { if (document.getElementById(tId)) document.getElementById(tId).remove(); }, 4000);
}

// --- SYSTEM NOTIFICATION LOGS ---
export function addNotification(title, body, tipe = 'info') {
  const n = { id: Date.now(), title, body, tipe };
  state.notifications.unshift(n);
  DB.set('sa_notifs', state.notifications);
  syncNotifications();
}

export function syncNotifications() {
  const badge = document.getElementById('notif-badge');
  const list = document.getElementById('notif-list');
  if (badge) {
    if (state.notifications.length > 0) badge.classList.remove('hidden');
    else badge.classList.add('hidden');
  }
  if (list) {
    if (state.notifications.length === 0) {
      list.innerHTML = `<p class="text-[10px] text-gray-400 text-center py-4">Tidak ada notifikasi sistem baru.</p>`;
      return;
    }
    list.innerHTML = state.notifications.map(n => `
      <div class="p-2 border-b border-gray-100 dark:border-gray-840/50 last:border-0 font-sans">
        <h5 class="font-extrabold text-gray-800 dark:text-white leading-tight text-[11px]">${n.title}</h5>
        <p class="text-[10px] text-gray-450 dark:text-gray-400 leading-normal mt-0.5">${n.body}</p>
      </div>
    `).join('');
  }
}

export function toggleNotificationDropdown() {
  const el = document.getElementById('notif-dropdown');
  if (el) el.classList.toggle('hidden');
}

export function clearSystemNotifications() {
  state.notifications = [];
  DB.set('sa_notifs', []);
  syncNotifications();
  showToast('Seluruh notifikasi dibersihkan.', 'success');
}

// --- NAVIGATIONAL ROUTER ---
export function navigate(viewName) {
  state.currentView = viewName;
  localStorage.setItem('sa_current_view', viewName);
  
  const views = ['beranda', 'customer', 'admin', 'owner'];
  views.forEach(v => {
    const el = document.getElementById(`view-${v}`);
    if (el) el.classList.add('hidden');
  });

  const activeEl = document.getElementById(`view-${viewName}`);
  if (activeEl) activeEl.classList.remove('hidden');

  // Sync active view highlights & setups
  if (viewName === 'beranda') {
    BerandaView.render(state, triggerBookingView, handleContactSubmit);
  } else if (viewName === 'customer') {
    CustomerView.render(state, switchCustomerTab, handleBookingSubmit, selectPaymentMethod, applyPromoCode, handleProfileUpdate);
  } else if (viewName === 'admin') {
    AdminView.render(state, switchAdminTab, approveBooking, rejectBooking, viewPaymentProof, handleDeleteCourt, handleEditCourt, handleOpenAddCourt, handleDeletePromo, handleOpenAddPromo, handleDeleteMessage, handleDeleteUser);
    syncAdminStats();
  } else if (viewName === 'owner') {
    OwnerView.render(state, handleLogout, toggleGorStatus, handleBroadcastAnnouncement, resetBusinessData);
  }

  // Update layout header nav panels
  syncSessionLayouts();
  window.scrollTo(0, 0);
}

export function triggerBookingView() {
  const isClosed = localStorage.getItem('sa_gor_status') === 'closed';
  if (isClosed) {
    showToast('Maaf, GOR sedang tutup sementara atas instruksi Pemilik GOR.', 'error');
    return;
  }
  if (!state.currentUser) {
    showToast('Anda harus masuk/register terlebih dahulu untuk melakukan reservasi!', 'error');
    openModal('login');
  } else {
    navigate('customer');
    switchCustomerTab('book');
  }
}

// --- THEME SYNC ENGINE ---
export function syncTheme() {
  const themeIcon = document.getElementById('theme-icon');
  if (state.darkMode) {
    document.documentElement.classList.add('dark');
    if (themeIcon) {
      themeIcon.setAttribute('data-lucide', 'sun');
      themeIcon.style.color = '#fbbf24';
    }
  } else {
    document.documentElement.classList.remove('dark');
    if (themeIcon) {
      themeIcon.setAttribute('data-lucide', 'moon');
      themeIcon.style.color = '#6b7280';
    }
  }
  if (window.lucide) lucide.createIcons();
}

export function toggleTheme() {
  state.darkMode = !state.darkMode;
  localStorage.setItem('sa_dark', state.darkMode ? 'yes' : 'no');
  syncTheme();
}

// --- SESSION CONTROL LAYOUTS ---
export function goUserDashboard() {
  if (!state.currentUser) {
    openModal('login');
    return;
  }
  if (state.currentUser.role === 'admin') {
    navigate('admin');
  } else if (state.currentUser.role === 'owner') {
    navigate('owner');
  } else {
    navigate('customer');
  }
}

export function syncSessionLayouts() {
  // Save current user state to guarantee persistence across dev builds
  if (state.currentUser) {
    localStorage.setItem('sa_current_user', JSON.stringify(state.currentUser));
  } else {
    localStorage.removeItem('sa_current_user');
  }

  // --- Theme Mode styling sync ---
  const uBadge = document.getElementById('header-user-badge');
  const uName = document.getElementById('header-user-name');
  const btnAuth = document.getElementById('header-auth-deck');

  // --- Real index.html Header elements sync ---
  const authUnlogged = document.getElementById('auth-unlogged');
  const authLogged = document.getElementById('auth-logged');
  const navUserName = document.getElementById('nav-user-name');
  const navUserRole = document.getElementById('nav-user-role');
  
  const navBeranda = document.getElementById('nav-link-beranda');
  const navSewa = document.getElementById('nav-link-sewa');
  const navPortal = document.getElementById('nav-link-portal');

  // Hide portal link by default
  if (navPortal) navPortal.classList.add('hidden');

  if (state.currentUser) {
    // Legacy Header elements
    if (uBadge) uBadge.classList.remove('hidden');
    if (uName) uName.innerText = state.currentUser.nama;
    if (btnAuth) btnAuth.classList.add('hidden');

    // Real index.html Header elements
    if (authUnlogged) authUnlogged.classList.add('hidden');
    if (authLogged) authLogged.classList.remove('hidden');
    if (navUserName) navUserName.innerText = state.currentUser.nama;
    if (navUserRole) {
      if (state.currentUser.role === 'admin') {
        navUserRole.innerText = 'Administrator';
        navUserRole.className = 'text-[9px] font-black uppercase text-amber-500 tracking-wider mt-1';
      } else if (state.currentUser.role === 'owner') {
        navUserRole.innerText = 'Pemilik GOR';
        navUserRole.className = 'text-[9px] font-black uppercase text-rose-500 tracking-wider mt-1';
      } else {
        navUserRole.innerText = 'Pelanggan';
        navUserRole.className = 'text-[9px] font-black uppercase text-emerald-500 tracking-wider mt-1';
      }
    }

    if (state.currentUser.role === 'admin') {
      if (navPortal) {
        navPortal.innerText = 'Admin Panel';
        navPortal.classList.remove('hidden');
        navPortal.onclick = () => navigate('admin');
      }
    } else if (state.currentUser.role === 'owner') {
      if (navPortal) {
        navPortal.innerText = 'Owner Lounge';
        navPortal.classList.remove('hidden');
        navPortal.onclick = () => navigate('owner');
      }
    } else if (state.currentUser.role === 'pelanggan' || state.currentUser.role === 'owner' || state.currentUser.role === 'admin') {
      // Allow general portal link mapping
      if (navPortal) {
        navPortal.innerText = state.currentUser.role === 'admin' ? 'Admin Panel' : (state.currentUser.role === 'owner' ? 'Owner Lounge' : 'Pesanan Saya');
        navPortal.classList.remove('hidden');
        navPortal.onclick = () => {
          if (state.currentUser.role === 'admin') navigate('admin');
          else if (state.currentUser.role === 'owner') navigate('owner');
          else navigate('customer');
        };
      }
    }
  } else {
    // Legacy Header elements
    if (uBadge) uBadge.classList.add('hidden');
    if (btnAuth) btnAuth.classList.remove('hidden');

    // Real index.html Header elements
    if (authUnlogged) authUnlogged.classList.remove('hidden');
    if (authLogged) authLogged.classList.add('hidden');
  }

  // Set active link colors
  const activeClass = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all w-fit";
  const inactiveClass = "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-extrabold px-3 py-2 text-xs flex items-center gap-1.5 transition-all w-fit";

  if (navBeranda) navBeranda.className = state.currentView === 'beranda' ? activeClass : inactiveClass;
  if (navSewa) navSewa.className = (state.currentView === 'customer' && state.activeCustomerTab === 'book') ? activeClass : inactiveClass;
  if (navPortal && state.currentView !== 'beranda' && !(state.currentView === 'customer' && state.activeCustomerTab === 'book')) {
    navPortal.className = activeClass;
  } else if (navPortal) {
    navPortal.className = inactiveClass;
  }
}

// --- AUTHENTICATION ACTION SUBMITS ---
export function handleLoginSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const pass = document.getElementById('login-password').value.trim();

  // If inputs are empty (e.g. form was just reset), exit safely
  if (!email || !pass) {
    return;
  }

  // Retrieve freshest list of users from DB to avoid any cached/stale roles
  state.users = DB.get('sa_users') || state.users;

  const matched = state.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === pass);
  if (!matched) {
    showToast('Alamat email atau password kombinasi salah!', 'error');
    return;
  }

  state.currentUser = matched;
  closeModal('login');
  document.getElementById('login-form')?.reset();
  showToast(`Selamat datang kembali di Smash Arena, ${matched.nama}!`, 'success');
  addNotification('Sesi Login Sukses', `Aktivitas login terdeteksi pada akun ${matched.nama}.`, 'success');

  syncSessionLayouts();
  if (matched.role === 'admin') navigate('admin');
  else if (matched.role === 'owner') navigate('owner');
  else navigate('customer');
}

export function handleRegisterSubmit(e) {
  e.preventDefault();
  const nama = document.getElementById('reg-nama').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const pass = document.getElementById('reg-password').value;
  const conf = document.getElementById('reg-confirm').value;

  // If inputs are empty (e.g. form was just reset), exit safely
  if (!nama || !email || !pass) {
    return;
  }

  if (pass !== conf) {
    showToast('Konfirmasi password tidak cocok!', 'error');
    return;
  }
  if (state.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    showToast('Alamat email ini sudah terdaftar sebelumnya!', 'error');
    return;
  }

  const newId = 'M' + Math.floor(1000 + Math.random() * 9000);
  const newUser = {
    id: newId,
    nama,
    email,
    password: pass,
    role: 'pelanggan'
  };

  state.users.push(newUser);
  DB.set('sa_users', state.users);

  state.currentUser = newUser;
  closeModal('register');
  document.getElementById('register-form')?.reset();
  showToast(`Registrasi Berhasil! Selamat bermain di Smash Arena, ${nama}!`, 'success');
  addNotification('Registrasi Anggota Baru', `Selamat datang member baru ${nama} (${newId})!`, 'info');

  syncSessionLayouts();
  navigate('customer');
  switchCustomerTab('book');
}

export function handleLogout() {
  openModal('logout');
}

export function confirmLogoutAction() {
  const name = state.currentUser ? state.currentUser.nama : '';
  state.currentUser = null;
  localStorage.removeItem('sa_current_user');
  localStorage.setItem('sa_current_view', 'beranda');
  closeModal('logout');
  showToast(`Sampai jumpa kembali, ${name}!`, 'info');
  navigate('beranda');
}

// --- CUSTOMER TAB OPERATIONS ---
export function switchCustomerTab(tabName) {
  state.activeCustomerTab = tabName;
  const tabs = ['book', 'bookings', 'profile'];
  tabs.forEach(t => {
    const el = document.getElementById(`cust-tab-${t}`);
    const btn = document.getElementById(`btn-cust-${t}`);
    if (el) el.classList.add('hidden');
    if (btn) {
      btn.className = "px-4 py-3 bg-white dark:bg-gray-950 text-gray-500 dark:text-gray-400 hover:bg-emerald-50/10 flex items-center gap-2.5 rounded-xl font-bold text-xs cursor-pointer select-none shrink-0 border border-gray-100 dark:border-gray-850/80 transition-all";
    }
  });

  const activeTabEl = document.getElementById(`cust-tab-${tabName}`);
  if (activeTabEl) activeTabEl.classList.remove('hidden');

  const activeBtn = document.getElementById(`btn-cust-${tabName}`);
  if (activeBtn) {
    activeBtn.className = "px-4 py-3 bg-emerald-500 dark:bg-emerald-600 text-white flex items-center gap-2.5 rounded-xl font-bold text-xs cursor-pointer select-none shrink-0 shadow-lg shadow-emerald-500/20 mr-1.5 transition-all";
  }

  if (tabName === 'book') {
    setupBookingForm();
  } else if (tabName === 'bookings') {
    renderCustomerBookings();
  }
}

export function setupBookingForm() {
  const courtWrapper = document.getElementById('booking-court-select');
  if (courtWrapper) {
    courtWrapper.innerHTML = state.courts.map(c => {
      const selected = state.bookingFields.courtId === c.id;
      const isAvailable = c.tersedia === 'yes';
      
      let statusColors = 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-750 bg-white dark:bg-gray-950';
      if (!isAvailable) {
        statusColors = 'opacity-40 cursor-not-allowed bg-gray-100 dark:bg-gray-900 border-gray-250 dark:border-gray-850';
      } else if (selected) {
        statusColors = 'border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10';
      }

      const clickAction = isAvailable ? `onclick="selectBookingCourt('${c.id}')"` : '';
      const courtImg = c.foto || 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=600&q=80';
      return `
        <div ${clickAction} class="p-2.5 border-2 rounded-2xl cursor-pointer ${statusColors} transition-all flex items-center gap-3">
          <img src="${courtImg}" class="h-12 w-12 rounded-xl object-cover shrink-0 pointer-events-none" alt="" referrerPolicy="no-referrer">
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-1 leading-none">
              <span class="font-extrabold text-[11px] text-gray-900 dark:text-white truncate block">${c.nama}</span>
              ${selected && isAvailable ? '<i data-lucide="check-circle" class="w-4.5 h-4.5 text-emerald-500 shrink-0"></i>' : ''}
            </div>
            <p class="text-[9.5px] text-gray-400 mt-1 truncate">Bahan: ${c.tipe} &bull; <span class="font-bold text-emerald-500 dark:text-emerald-400">Rp ${c.harga.toLocaleString('id-ID')}</span></p>
          </div>
        </div>
      `;
    }).join('');
  }

  const dPicker = document.getElementById('booking-date-picker');
  if (dPicker) {
    if (!state.bookingFields.date) {
      const today = new Date().toISOString().split('T')[0];
      dPicker.value = today;
      state.bookingFields.date = today;
    } else {
      dPicker.value = state.bookingFields.date;
    }
    // Set minimal date pool
    dPicker.min = new Date().toISOString().split('T')[0];
    dPicker.onchange = handleBookingDateChanged;
  }

  renderSesiSlots();
  updateBillSummary();
}

export function selectBookingCourt(cId) {
  state.bookingFields.courtId = cId;
  state.bookingFields.sesi = [];
  setupBookingForm();
  updateBillSummary();
}

export function handleBookingDateChanged() {
  const picker = document.getElementById('booking-date-picker');
  if (picker) {
    state.bookingFields.date = picker.value;
    state.bookingFields.sesi = [];
    renderSesiSlots();
    updateBillSummary();
  }
}

export function renderSesiSlots() {
  const slotsGrid = document.getElementById('booking-slots-grid');
  if (!slotsGrid) return;
  if (!state.bookingFields.courtId) {
    slotsGrid.innerHTML = `<p class="col-span-4 text-center text-[10px] text-gray-400 py-6 font-semibold">Silakan pilih Lapangan terlebih dahulu pada Langkah 1.</p>`;
    return;
  }

  const hours = ['08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00', '12:00 - 13:00', '13:00 - 14:00', '14:00 - 15:00', '15:00 - 16:00', '16:00 - 17:00', '17:00 - 18:00', '18:00 - 19:00', '19:00 - 20:00', '20:00 - 21:00', '21:00 - 22:00'];
  
  const matchedB = state.bookings.filter(b => b.courtId === state.bookingFields.courtId && b.tgl === state.bookingFields.date && b.status !== 'Dibatalkan');
  const bookedSlots = matchedB.reduce((acc, b) => acc.concat(b.sesi), []);

  slotsGrid.innerHTML = hours.map(h => {
    const isBooked = bookedSlots.includes(h);
    const isChecked = state.bookingFields.sesi.includes(h);

    let colors = 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-emerald-500 cursor-pointer hover:bg-emerald-50/10';
    if (isBooked) {
      colors = 'bg-red-500/10 text-red-500 border-red-500/20 cursor-not-allowed opacity-50';
    } else if (isChecked) {
      colors = 'bg-emerald-500 text-white border-emerald-500';
    }

    const clickAction = !isBooked ? `onclick="toggleSesiSlot('${h}')"` : '';
    return `
      <div ${clickAction} class="p-3 border rounded-xl font-mono text-[10px] font-bold text-center select-none transition-all ${colors}">
        ${h}
      </div>
    `;
  }).join('');
}

export function toggleSesiSlot(sName) {
  const idx = state.bookingFields.sesi.indexOf(sName);
  if (idx > -1) {
    state.bookingFields.sesi.splice(idx, 1);
  } else {
    state.bookingFields.sesi.push(sName);
  }
  renderSesiSlots();
  updateBillSummary();
}

export function applyPromoCode() {
  const field = document.getElementById('booking-promo-code');
  const notice = document.getElementById('promo-notice');
  if (!field || !notice) return;

  const codeVal = field.value.trim().toUpperCase();
  if (!codeVal) {
    state.bookingFields.appliedPromo = null;
    notice.innerText = '';
    updateBillSummary();
    return;
  }

  const match = state.promos.find(p => p.kode === codeVal);
  if (match) {
    state.bookingFields.appliedPromo = match;
    notice.innerText = `Kupon diskon sukses diterapkan! Potongan ${match.persen}%.`;
    notice.className = "text-[10px] text-emerald-500 font-bold block mt-1";
    showToast(`Kupon ${codeVal} diterapkan dengan sukses!`, 'success');
  } else {
    state.bookingFields.appliedPromo = null;
    notice.innerText = 'Kode kupon promo tidak valid / kadaluarsa!';
    notice.className = "text-[10px] text-red-500 font-bold block mt-1";
    showToast('Kupon promo tidak valid!', 'error');
  }
  updateBillSummary();
}

export function getBillDetails() {
  const court = state.courts.find(c => c.id === state.bookingFields.courtId);
  if (!court) return { sub: 0, disc: 0, grand: 0 };

  const sub = court.harga * state.bookingFields.sesi.length;
  let disc = 0;
  if (state.bookingFields.appliedPromo) {
    disc = Math.floor(sub * (state.bookingFields.appliedPromo.persen / 100));
  }
  return { sub, disc, grand: sub - disc };
}

export function updateBillSummary() {
  const { sub, disc, grand } = getBillDetails();
  const subEl = document.getElementById('bill-subtotal');
  const discEl = document.getElementById('bill-discount');
  const grandEl = document.getElementById('bill-grandtotal');

  if (subEl) subEl.innerText = `Rp ${sub.toLocaleString('id-ID')}`;
  if (discEl) {
    if (disc > 0) {
      discEl.innerText = `- Rp ${disc.toLocaleString('id-ID')}`;
    } else {
      discEl.innerText = `Rp 0`;
    }
  }
  if (grandEl) grandEl.innerText = `Rp ${grand.toLocaleString('id-ID')}`;
}

export function selectPaymentMethod(method, cardElement) {
  state.bookingFields.metodeBayar = method;
  document.querySelectorAll('.payment-method-card').forEach(el => {
    el.classList.remove('border-emerald-500', 'bg-emerald-500/5', 'dark:bg-emerald-500/10');
    el.classList.add('border-gray-200', 'dark:border-gray-800');
    const input = el.querySelector('input[type="radio"]');
    if (input) input.checked = false;
  });
  
  if (cardElement) {
    cardElement.classList.remove('border-gray-200', 'dark:border-gray-800');
    cardElement.classList.add('border-emerald-500', 'bg-emerald-500/5', 'dark:bg-emerald-500/10');
    const input = cardElement.querySelector('input[type="radio"]');
    if (input) input.checked = true;
  }
}

export function handleBookingSubmit(e) {
  e.preventDefault();
  if (!state.bookingFields.courtId) {
    showToast('Tentukan pilihan lapangan bulutangkis terlebih dahulu!', 'error');
    return;
  }
  if (state.bookingFields.sesi.length === 0) {
    showToast('Pilih setidaknya 1 sesi jam kosong!', 'error');
    return;
  }

  const { sub, disc, grand } = getBillDetails();
  const bId = 'BKT' + Math.floor(100 + Math.random() * 900);
  const isCash = (state.bookingFields.metodeBayar === 'cash');
  const newB = {
    id: bId,
    userId: state.currentUser.id,
    courtId: state.bookingFields.courtId,
    tgl: state.bookingFields.date,
    sesi: [...state.bookingFields.sesi],
    subtotal: sub,
    diskon: disc,
    grandtotal: grand,
    status: 'Menunggu Pembayaran',
    pengirim: isCash ? 'Bayar Cash di Tempat' : '',
    tgl_buat: new Date().toISOString().split('T')[0],
    metodeBayar: state.bookingFields.metodeBayar || 'bca'
  };

  state.bookings.push(newB);
  DB.set('sa_bookings', state.bookings);

  if (isCash) {
    showToast('Reservasi GOR sukses terdaftar! Silakan lakukan pelunasan langsung di Kasir GOR.', 'success');
    addNotification('Booking Baru Terdaftar (Tunai)', `Menunggu pembayaran cash di kasir GOR pada tiket ID ${bId}.`, 'info');
  } else {
    showToast('Tiket booking sukses terdaftar! Selesaikan transfer pelunasan.', 'success');
    addNotification('Booking Baru Terdaftar', `Menunggu transfer pembayaran pada tiket ID ${bId}.`, 'info');
  }

  // Clear fields
  state.bookingFields.sesi = [];
  state.bookingFields.appliedPromo = null;
  const pCode = document.getElementById('booking-promo-code');
  if (pCode) pCode.value = '';
  const pNot = document.getElementById('promo-notice');
  if (pNot) pNot.innerText = '';

  switchCustomerTab('bookings');
}

export function renderCustomerBookings() {
  const list = document.getElementById('customer-booking-rows');
  if (!list) return;

  const myBookings = state.bookings.filter(b => b.userId === state.currentUser.id);
  if (myBookings.length === 0) {
    list.innerHTML = `<tr><td colspan="7" class="py-10 text-center text-gray-400 font-semibold font-sans">Anda belum memiliki riwayat reservasi. Yuk main Badminton!</td></tr>`;
    return;
  }

  list.innerHTML = myBookings.map(b => {
    const court = state.courts.find(c => c.id === b.courtId);
    const name = court ? court.nama : 'Lapangan Lain';
    
    let badgeStyle = 'bg-gray-100 text-gray-500';
    if (b.status === 'Disetujui') badgeStyle = 'bg-emerald-500/10 text-emerald-500';
    else if (b.status === 'Pending Approval') badgeStyle = 'bg-amber-500/10 text-amber-600';
    else if (b.status === 'Menunggu Pembayaran') badgeStyle = 'bg-blue-500/10 text-blue-500';
    else if (b.status === 'Dibatalkan') badgeStyle = 'bg-red-500/10 text-red-500';

    let actions = '';
    if (b.status === 'Menunggu Pembayaran') {
      actions = `
        <div class="flex flex-row items-center justify-end gap-1.5 font-sans">
          <button onclick="openPayTransferModal('${b.id}', ${b.grandtotal})" class="p-1.5 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] rounded-lg cursor-pointer transition-all active:scale-95 inline-flex items-center gap-1">
            <i data-lucide="wallet" class="w-3 h-3"></i> Bayar
          </button>
          <button onclick="cancelBooking('${b.id}')" class="p-1.5 px-2.5 bg-red-500/10 hover:bg-red-600 hover:text-white dark:bg-red-950/40 text-red-500 text-[10px] rounded-lg font-black cursor-pointer transition-all active:scale-95 inline-flex items-center gap-1">
            <i data-lucide="ban" class="w-3 h-3"></i> Batal
          </button>
        </div>
      `;
    } else if (b.status === 'Pending Approval') {
      actions = `
        <div class="flex flex-row items-center justify-end gap-1.5 font-sans">
          <button onclick="openPrintVoucherModal('${b.id}')" class="p-1.5 px-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-900 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-extrabold text-[10px] rounded-lg cursor-pointer transition-all active:scale-95 inline-flex items-center gap-1">
            <i data-lucide="printer" class="w-2.5 h-2.5"></i> Tiket
          </button>
          <button onclick="cancelBooking('${b.id}')" class="p-1.5 px-2.5 bg-red-500/10 hover:bg-red-600 hover:text-white dark:bg-red-950/40 text-red-500 text-[10px] rounded-lg font-black cursor-pointer transition-all active:scale-95 inline-flex items-center gap-1">
            <i data-lucide="ban" class="w-3 h-3"></i> Batal
          </button>
        </div>
      `;
    } else if (b.status === 'Disetujui') {
      actions = `
        <div class="flex flex-row items-center justify-end gap-1.5 font-sans">
          <button onclick="openPrintVoucherModal('${b.id}')" class="p-1.5 px-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-900 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-extrabold text-[10px] rounded-lg cursor-pointer transition-all active:scale-95 inline-flex items-center gap-1">
            <i data-lucide="printer" class="w-2.5 h-2.5"></i> Tiket
          </button>
        </div>
      `;
    }

    let mText = "Transfer BCA";
    if (b.metodeBayar === 'mandiri') mText = "Transfer Mandiri";
    else if (b.metodeBayar === 'qris') mText = "QRIS (E-Wallet)";
    else if (b.metodeBayar === 'cash') mText = "Tunai di GOR";

    return `
      <tr class="border-b border-gray-100 dark:border-gray-850">
        <td class="py-3 px-2 font-mono font-bold text-gray-400 select-all">${b.id}</td>
        <td class="py-3 px-2 font-bold">${name}</td>
        <td class="py-3 px-2 font-bold">${b.tgl}</td>
        <td class="py-3 px-2 leading-relaxed"><span class="font-bold text-[10px] text-emerald-600 font-mono">${b.sesi.join(', ')}</span><br><span class="text-[9px] text-gray-400 font-semibold">Total Durasi: ${b.sesi.length} Sesi Jam</span></td>
        <td class="py-3 px-2 font-black text-gray-900 dark:text-white">Rp ${b.grandtotal.toLocaleString('id-ID')}<br><span class="text-[9px] font-bold text-gray-400 dark:text-gray-500">${mText}</span></td>
        <td class="py-3 px-2"><span class="px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${badgeStyle}">${b.status}</span></td>
        <td class="py-3 px-2 text-right">${actions}</td>
      </tr>
    `;
  }).join('');

  if (window.lucide) lucide.createIcons();
}

export async function cancelBooking(bId) {
  const confirmed = await niceConfirm(
    'Batalkan Reservasi GOR',
    `Apakah Anda yakin ingin membatalkan transaksi sewa lapangan ${bId}? Tindakan ini tidak dapat dibatalkan.`,
    { type: 'danger' }
  );
  if (confirmed) {
    state.bookings = state.bookings.map(b => b.id === bId ? { ...b, status: 'Dibatalkan' } : b);
    DB.set('sa_bookings', state.bookings);
    showToast('Reservasi GOR berhasil dibatalkan!', 'success');
    addNotification('Pemesanan Dibatalkan', `Tiket sewa ${bId} telah dibatalkan oleh pengguna.`, 'info');
    renderCustomerBookings();
  }
}

export function openPayTransferModal(bId, grandTotal) {
  const bUniqueInput = document.getElementById('modal-pay-booking-id');
  if (bUniqueInput) bUniqueInput.value = bId;

  const b = state.bookings.find(x => x.id === bId);
  const instructionsContainer = document.getElementById('dynamic-payment-instructions');
  
  if (instructionsContainer && b) {
    let methodTitle = "";
    let logoHtml = "";
    let detailHtml = "";
    
    if (b.metodeBayar === 'bca') {
      instructionsContainer.className = "bg-emerald-500/10 rounded-xl p-4 border border-dashed border-emerald-500/20 text-[11px] text-gray-500 space-y-2 mb-4";
      methodTitle = "Bank Central Asia (BCA)";
      detailHtml = `
        <div class="space-y-1.5 font-sans">
          <div class="flex justify-between">
            <span class="text-gray-400 font-medium">Nama Bank:</span>
            <span class="font-bold text-gray-800 dark:text-gray-200">BCA (Bank Transfer)</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-400 font-medium">Nomor Rekening:</span>
            <span class="font-mono text-xs font-black bg-gray-100 dark:bg-gray-900 px-2 py-0.5 rounded tracking-wider text-emerald-600 dark:text-emerald-400 select-all">800234551122</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400 font-medium">Nama Penerima:</span>
            <span class="font-bold text-gray-800 dark:text-gray-200">A.N. GOR Smash Arena Binjai</span>
          </div>
          <div class="flex justify-between border-t border-gray-200/50 dark:border-gray-800 pt-1.5 mt-1">
            <span class="text-gray-400 font-medium text-[11px]">Total Tagihan:</span>
            <span class="font-black text-xs text-emerald-600 dark:text-emerald-400">Rp ${grandTotal.toLocaleString('id-ID')}</span>
          </div>
        </div>
      `;
    } else if (b.metodeBayar === 'mandiri') {
      instructionsContainer.className = "bg-emerald-500/10 rounded-xl p-4 border border-dashed border-emerald-500/20 text-[11px] text-gray-500 space-y-2 mb-4";
      methodTitle = "Bank Mandiri";
      detailHtml = `
        <div class="space-y-1.5 font-sans">
          <div class="flex justify-between">
            <span class="text-gray-400 font-medium">Nama Bank:</span>
            <span class="font-bold text-gray-800 dark:text-gray-200">Mandiri (Bank Transfer)</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-400 font-medium">Nomor Rekening:</span>
            <span class="font-mono text-xs font-black bg-gray-100 dark:bg-gray-900 px-2 py-0.5 rounded tracking-wider text-emerald-600 dark:text-emerald-400 select-all">1110022334455</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400 font-medium">Nama Penerima:</span>
            <span class="font-bold text-gray-800 dark:text-gray-200">A.N. GOR Smash Arena Binjai</span>
          </div>
          <div class="flex justify-between border-t border-gray-200/50 dark:border-gray-800 pt-1.5 mt-1">
            <span class="text-gray-400 font-medium text-[11px]">Total Tagihan:</span>
            <span class="font-black text-xs text-emerald-600 dark:text-emerald-400">Rp ${grandTotal.toLocaleString('id-ID')}</span>
          </div>
        </div>
      `;
    } else if (b.metodeBayar === 'qris') {
      instructionsContainer.className = "bg-white dark:bg-gray-950 rounded-2xl p-4 border border-gray-150 dark:border-gray-800 mb-4 flex flex-col items-center justify-center overflow-hidden shadow-sm";
      methodTitle = "E-Wallet QRIS GOR Smash Arena";
      detailHtml = `
        <div class="w-full flex flex-col items-center justify-center bg-white p-1 rounded-xl">
          <img src="/src/assets/images/user_shopeepay_qris_1781736845128.jpg" alt="Kode QRIS ShopeePay" class="w-56 h-auto object-contain pointer-events-none rounded-lg" referrerPolicy="no-referrer">
          <div class="mt-4 text-center font-sans">
            <span class="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block mb-1">TOTAL NOMINAL YANG HARUS DIBAYAR</span>
            <span class="text-base font-black text-emerald-600 dark:text-emerald-500 block leading-tight">Rp ${grandTotal.toLocaleString('id-ID')}</span>
          </div>
        </div>
      `;
    } else {
      instructionsContainer.className = "bg-emerald-500/10 rounded-xl p-4 border border-dashed border-emerald-500/20 text-[11px] text-gray-500 space-y-2 mb-4";
      methodTitle = "Tunai di GOR";
      detailHtml = `
        <div class="space-y-1.5 font-sans">
          <p class="text-gray-400 text-center leading-relaxed">Silakan lakukan pelunasan pemesanan secara tunai ke petugas piket kasir di GOR Smash Arena.</p>
          <div class="flex justify-between border-t border-gray-200/50 dark:border-gray-800 pt-1.5 mt-1">
            <span class="text-gray-400 font-medium text-[11px]">Total Tagihan:</span>
            <span class="font-black text-xs text-emerald-600 dark:text-emerald-400">Rp ${grandTotal.toLocaleString('id-ID')}</span>
          </div>
        </div>
      `;
    }

    if (b.metodeBayar === 'qris') {
      instructionsContainer.innerHTML = detailHtml;
    } else {
      instructionsContainer.innerHTML = `
        <div class="space-y-2">
          <h4 class="font-extrabold text-[12px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <i data-lucide="info" class="w-4 h-4"></i> ${methodTitle}
          </h4>
          ${detailHtml}
        </div>
      `;
    }
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  // Clear inputs
  const fText = document.getElementById('pay-sender');
  if (fText) fText.value = '';
  const fFile = document.getElementById('pay-file');
  if (fFile) fFile.value = '';

  openModal('pay');
}

export function handlePayProofSubmit(e) {
  e.preventDefault();
  const bId = document.getElementById('modal-pay-booking-id').value;
  const senderName = document.getElementById('pay-sender').value.trim();
  const fileInput = document.getElementById('pay-file');

  const finalizeUpload = (base64String) => {
    state.bookings = state.bookings.map(b => {
      if (b.id === bId) {
        return {
          ...b,
          status: 'Pending Approval',
          pengirim: senderName,
          buktiFoto: base64String || ''
        };
      }
      return b;
    });

    DB.set('sa_bookings', state.bookings);
    showToast(`Bukti pembayaran ${bId} terkirim! Admin piket Smash Arena akan memverifikasi segera.`, 'success');
    addNotification('Bukti Transfer Terkirim', `Pelanggan mengunggah bukti bayar pada tiket ID ${bId}.`, 'info');

    closeModal('pay');
    renderCustomerBookings();
  };

  if (fileInput && fileInput.files && fileInput.files[0]) {
    const reader = new FileReader();
    reader.onload = function(evt) {
      finalizeUpload(evt.target.result);
    };
    reader.readAsDataURL(fileInput.files[0]);
  } else {
    // Retain simulated image slips
    finalizeUpload('');
  }
}

export function handleProfileUpdate(e) {
  e.preventDefault();
  const namaVal = document.getElementById('profile-name').value;
  const passVal = document.getElementById('profile-password').value;

  state.users = state.users.map(u => {
    if (u.id === state.currentUser.id) {
      const updated = { ...u, nama: namaVal };
      if (passVal) updated.password = passVal;
      return updated;
    }
    return u;
  });
  DB.set('sa_users', state.users);

  state.currentUser.nama = namaVal;
  showToast('Profil Akun Member sukses diperbarui!', 'success');
  
  const profilePwEl = document.getElementById('profile-password');
  if (profilePwEl) profilePwEl.value = '';

  syncSessionLayouts();
}

export function openPrintVoucherModal(bId) {
  const b = state.bookings.find(x => x.id === bId);
  if (!b) return;

  const user = state.users.find(u => u.id === b.userId);
  const nameUser = user ? user.nama : (b.pengirim || 'Member GOR');
  const court = state.courts.find(c => c.id === b.courtId);
  const courtName = court ? court.nama : b.courtId;

  const tId = document.getElementById('ticket-id');
  const tCourt = document.getElementById('ticket-court');
  const tUser = document.getElementById('ticket-user');
  const tDate = document.getElementById('ticket-date');
  const tSesi = document.getElementById('ticket-sesi');
  const tPayment = document.getElementById('ticket-payment');
  const tStatus = document.getElementById('ticket-status');
  const tSub = document.getElementById('ticket-subtotal');
  const tDisc = document.getElementById('ticket-discount');
  const tGrand = document.getElementById('ticket-grandtotal');
  const tPrintDate = document.getElementById('ticket-print-date');

  if (tId) tId.innerText = b.id;
  if (tCourt) tCourt.innerText = courtName;
  if (tUser) tUser.innerText = nameUser;
  if (tDate) tDate.innerText = b.tgl;
  if (tSesi) tSesi.innerText = b.sesi.join(', ');
  
  let mText = "Transfer BCA";
  if (b.metodeBayar === 'mandiri') mText = "Transfer Mandiri";
  else if (b.metodeBayar === 'qris') mText = "QRIS (E-Wallet)";
  else if (b.metodeBayar === 'cash') mText = "Tunai di GOR";
  if (tPayment) tPayment.innerText = mText;

  if (tStatus) {
    tStatus.innerText = b.status;
    if (b.status === 'Disetujui') {
      tStatus.className = "px-2 py-0.5 bg-emerald-500/15 text-emerald-500 font-extrabold rounded-md text-[9px] uppercase tracking-wide border border-emerald-500/20";
    } else if (b.status === 'Pending Approval') {
      tStatus.className = "px-2 py-0.5 bg-amber-500/15 text-amber-600 font-extrabold rounded-md text-[9px] uppercase tracking-wide border border-amber-500/20";
    } else {
      tStatus.className = "px-2 py-0.5 bg-gray-150 text-gray-500 font-extrabold rounded-md text-[9px] uppercase tracking-wide";
    }
  }

  if (tSub) tSub.innerText = 'Rp ' + b.subtotal.toLocaleString('id-ID');
  if (tDisc) tDisc.innerText = '- Rp ' + b.diskon.toLocaleString('id-ID');
  if (tGrand) tGrand.innerText = 'Rp ' + b.grandtotal.toLocaleString('id-ID');
  if (tPrintDate) tPrintDate.innerText = new Date().toLocaleString('id-ID');

  openModal('print');
}

// --- ADMIN CONTROL WORKFLOWS ---
export function switchAdminTab(tabName) {
  state.activeAdminTab = tabName;
  const tabs = ['bookings', 'courts', 'promos', 'messages', 'users'];
  tabs.forEach(t => {
    const el = document.getElementById(`adm-tab-${t}`);
    const btn = document.getElementById(`btn-adm-${t}`);
    if (el) el.classList.add('hidden');
    if (btn) {
      btn.className = "px-3 md:px-5 py-3 border-b-2 border-transparent text-gray-400 hover:text-gray-500 text-xs font-bold tracking-tight shrink-0 transition-all cursor-pointer";
    }
  });

  const activeTabEl = document.getElementById(`adm-tab-${tabName}`);
  if (activeTabEl) activeTabEl.classList.remove('hidden');

  const activeBtn = document.getElementById(`btn-adm-${tabName}`);
  if (activeBtn) {
    activeBtn.className = "px-3 md:px-5 py-3 border-b-2 border-emerald-500 text-emerald-500 text-xs font-black tracking-tight shrink-0 transition-all cursor-pointer";
  }

  // Populate actual list reports
  if (tabName === 'bookings') {
    AdminView.renderBookingsList(state, approveBooking, rejectBooking, viewPaymentProof);
  } else if (tabName === 'courts') {
    AdminView.renderCourtsList(state, handleDeleteCourt, handleEditCourt);
  } else if (tabName === 'promos') {
    AdminView.renderPromosList(state, handleDeletePromo);
  } else if (tabName === 'messages') {
    AdminView.renderMessagesList(state, handleDeleteMessage);
  } else if (tabName === 'users') {
    AdminView.renderUsersList(state, handleDeleteUser);
  }
}

export function syncAdminStats() {
  const approved = state.bookings.filter(b => b.status === 'Disetujui');
  const revenue = approved.reduce((sum, b) => sum + b.grandtotal, 0);

  const rElem = document.getElementById('stat-revenue');
  const bElem = document.getElementById('stat-bookings');
  const uElem = document.getElementById('stat-users');
  const mElem = document.getElementById('stat-messages');

  if (rElem) rElem.innerText = 'Rp ' + revenue.toLocaleString('id-ID');
  if (bElem) bElem.innerText = state.bookings.length + ' Transaksi';
  if (uElem) uElem.innerText = state.users.filter(u => u.role === 'pelanggan').length + ' Pengguna';
  if (mElem) mElem.innerText = state.messages.length + ' Inbox';
}

export function approveBooking(bId) {
  state.bookings = state.bookings.map(b => b.id === bId ? { ...b, status: 'Disetujui' } : b);
  DB.set('sa_bookings', state.bookings);
  showToast(`Tagihan booking ${bId} disetujui resmi!`, 'success');
  syncAdminStats();
  if (state.currentView === 'owner') {
    OwnerView.calculateStatsAndRender(state);
  } else {
    switchAdminTab('bookings');
  }
}

export async function rejectBooking(bId) {
  const confirmed = await niceConfirm(
    'Batalkan Transaksi',
    `Apakah Anda yakin ingin membatalkan secara permanen reservasi sewa ${bId}?`,
    { type: 'danger' }
  );
  if (confirmed) {
    state.bookings = state.bookings.map(b => b.id === bId ? { ...b, status: 'Dibatalkan' } : b);
    DB.set('sa_bookings', state.bookings);
    showToast(`Reservasi ${bId} dibatalkan.`, 'info');
    syncAdminStats();
    if (state.currentView === 'owner') {
      OwnerView.calculateStatsAndRender(state);
    } else {
      switchAdminTab('bookings');
    }
  }
}

export function viewPaymentProof(bId) {
  const b = state.bookings.find(x => x.id === bId);
  if (!b) return;

  const user = state.users.find(u => u.id === b.userId);
  const nameUser = user ? user.nama : 'Pihak GOR';
  const court = state.courts.find(c => c.id === b.courtId);
  const courtName = court ? court.nama : b.courtId;

  const container = document.getElementById('payment-proof-container');
  if (!container) return;

  const approveBtn = document.getElementById('btn-proof-approve');
  const rejectBtn = document.getElementById('btn-proof-reject');

  if (b.status === 'Pending Approval') {
    if (approveBtn) {
      approveBtn.style.display = 'flex';
      approveBtn.onclick = () => {
        approveBooking(bId);
        closeModal('view-proof');
      };
    }
    if (rejectBtn) {
      rejectBtn.style.display = 'block';
      rejectBtn.onclick = () => {
        rejectBooking(bId);
        closeModal('view-proof');
      };
    }
  } else {
    if (approveBtn) approveBtn.style.display = 'none';
    if (rejectBtn) rejectBtn.style.display = 'none';
  }

  let mText = "Transfer BCA";
  if (b.metodeBayar === 'mandiri') mText = "Transfer Bank Mandiri";
  else if (b.metodeBayar === 'qris') mText = "QRIS (E-Wallet)";

  let inner = '';
  if (b.buktiFoto && b.buktiFoto.startsWith('data:image/')) {
    inner = `
      <div class="space-y-3 font-sans">
        <div class="p-3 bg-gray-50 dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-xl space-y-1 text-xs">
          <div class="flex justify-between text-gray-800 dark:text-gray-200"><span class="text-gray-400 font-medium">Metode Pilih:</span> <span class="font-extrabold">${mText}</span></div>
          <div class="flex justify-between text-gray-800 dark:text-gray-200"><span class="text-gray-400 font-medium">Nama Pengirim:</span> <span class="font-extrabold">${b.pengirim || nameUser}</span></div>
          <div class="flex justify-between text-gray-800 dark:text-gray-200"><span class="text-gray-400 font-medium">Jumlah Tagihan:</span> <span class="font-black text-emerald-600 dark:text-emerald-400">Rp ${b.grandtotal.toLocaleString('id-ID')}</span></div>
          <div class="flex justify-between text-gray-800 dark:text-gray-200"><span class="text-gray-400 font-medium">ID Reservasi:</span> <span class="font-mono font-bold text-gray-500">${b.id}</span></div>
        </div>
        <div class="border border-gray-150 dark:border-gray-800 rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-2">
          <img src="${b.buktiFoto}" alt="Bukti Transfer" class="max-w-full max-h-[350px] object-contain rounded-xl shadow-sm" referrerPolicy="no-referrer">
        </div>
      </div>
    `;
  } else {
    inner = `
      <div class="space-y-3 font-sans">
        <div class="p-4 bg-gray-50 dark:bg-gray-900 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl text-center space-y-3">
          <div class="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center"><i data-lucide="shield-check" class="w-6 h-6"></i></div>
          <div class="space-y-1">
            <h4 class="font-black text-gray-900 dark:text-white text-xs">Simulasi Slip Transaksi Otomatis</h4>
            <p class="text-[11px] text-gray-400 leading-relaxed">Member memilih metode bayar ${mText} dan melampirkan pelunasan lunas.</p>
          </div>
          <div class="p-3 bg-white dark:bg-gray-950 border border-gray-150 dark:border-gray-850 rounded-xl space-y-1.5 text-left text-[11px] mx-auto max-w-sm">
            <div class="flex justify-between"><span>Nama Pelanggan:</span><span class="font-bold text-gray-800 dark:text-white">${b.pengirim || nameUser}</span></div>
            <div class="flex justify-between"><span>ID Reservasi:</span><span class="font-mono font-bold text-gray-500">${b.id}</span></div>
            <div class="flex justify-between"><span>Bahan GOR:</span><span class="font-medium text-gray-500">${courtName}</span></div>
            <div class="flex justify-between font-extrabold border-t border-gray-100 dark:border-gray-800 pt-1.5 text-xs text-gray-900 dark:text-white"><span>Jumlah Transfer:</span><span class="text-emerald-500">Rp ${b.grandtotal.toLocaleString('id-ID')}</span></div>
          </div>
        </div>
      </div>
    `;
  }

  container.innerHTML = inner;
  if (window.lucide) lucide.createIcons();
  openModal('view-proof');
}

export function handleOpenAddCourt() {
  const modalId = document.getElementById('modal-court-id');
  const modalTitle = document.getElementById('court-modal-title');
  const courtForm = document.getElementById('court-form');
  const modalFoto = document.getElementById('modal-court-foto');
  const modalFile = document.getElementById('modal-court-file');

  if (modalId) modalId.value = '';
  if (modalTitle) modalTitle.innerText = 'Tambah Lapangan Baru GOR';
  if (courtForm) courtForm.reset();
  if (modalFoto) modalFoto.value = '';
  if (modalFile) modalFile.value = '';

  openModal('court');
}

export function handleEditCourt(cId) {
  const match = state.courts.find(c => c.id === cId);
  if (!match) return;

  const modalId = document.getElementById('modal-court-id');
  const modalTitle = document.getElementById('court-modal-title');
  const modalNama = document.getElementById('modal-court-nama');
  const modalLantai = document.getElementById('modal-court-lantai');
  const modalHarga = document.getElementById('modal-court-harga');
  const modalTersedia = document.getElementById('modal-court-tersedia');
  const modalFoto = document.getElementById('modal-court-foto');
  const modalFile = document.getElementById('modal-court-file');

  if (modalId) modalId.value = match.id;
  if (modalTitle) modalTitle.innerText = 'Modifikasi Data Lapangan ' + match.id;
  if (modalNama) modalNama.value = match.nama;
  if (modalLantai) modalLantai.value = match.tipe;
  if (modalHarga) modalHarga.value = match.harga;
  if (modalTersedia) modalTersedia.value = match.tersedia;
  if (modalFoto) modalFoto.value = match.foto || '';
  if (modalFile) modalFile.value = '';

  openModal('court');
}

export function handleCourtSave(e) {
  e.preventDefault();
  const idVal = document.getElementById('modal-court-id').value;
  const namaVal = document.getElementById('modal-court-nama').value;
  const lantaiVal = document.getElementById('modal-court-lantai').value;
  const hargaVal = parseInt(document.getElementById('modal-court-harga').value);
  const tersediaVal = document.getElementById('modal-court-tersedia').value;
  const fotoUrlVal = document.getElementById('modal-court-foto').value;
  const fileInput = document.getElementById('modal-court-file');

  const finalizeSave = (fotoData) => {
    let finalFoto = fotoData || fotoUrlVal;
    
    if (!finalFoto && idVal) {
      const match = state.courts.find(c => c.id === idVal);
      if (match) finalFoto = match.foto;
    }

    if (!finalFoto) {
      finalFoto = 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=600&q=80';
    }

    if (idVal) {
      state.courts = state.courts.map(c => c.id === idVal ? { id: idVal, nama: namaVal, tipe: lantaiVal, harga: hargaVal, tersedia: tersediaVal, foto: finalFoto } : c);
      showToast('Modifikasi data lapangan sukses!', 'success');
    } else {
      const newId = String.fromCharCode(65 + state.courts.length);
      state.courts.push({ id: newId, nama: namaVal, tipe: lantaiVal, harga: hargaVal, tersedia: tersediaVal, foto: finalFoto });
      showToast('Lapangan baru berhasil ditambahkan ke katalog!', 'success');
    }
    
    DB.set('sa_courts', state.courts);
    closeModal('court');
    switchAdminTab('courts');
  };

  if (fileInput && fileInput.files && fileInput.files[0]) {
    const reader = new FileReader();
    reader.onload = function(evt) {
      finalizeSave(evt.target.result);
    };
    reader.readAsDataURL(fileInput.files[0]);
  } else {
    finalizeSave('');
  }
}

export async function handleDeleteCourt(cId) {
  const confirmed = await niceConfirm(
    'Hapus Lapangan',
    `Hapus data lapangan ${cId} secara permanen dari katalog Smash Arena?`,
    { type: 'danger' }
  );
  if (confirmed) {
    state.courts = state.courts.filter(c => c.id !== cId);
    DB.set('sa_courts', state.courts);
    showToast('Lapangan berhasil dihapus.', 'info');
    switchAdminTab('courts');
  }
}

export function handleOpenAddPromo() {
  document.getElementById('promo-form')?.reset();
  openModal('promo');
}

export function handlePromoSave(e) {
  e.preventDefault();
  const code = document.getElementById('modal-promo-kode').value.trim().toUpperCase();
  const persen = parseInt(document.getElementById('modal-promo-persen').value);
  const desc = document.getElementById('modal-promo-desc').value.trim();

  if (state.promos.some(p => p.kode === code)) {
    showToast('Kode kupon ini sudah terbit!', 'error');
    return;
  }

  state.promos.push({ kode: code, persen, desc });
  DB.set('sa_promos', state.promos);
  showToast('Kupon diskon promo baru terbit secara global!', 'success');
  closeModal('promo');
  switchAdminTab('promos');
}

export async function handleDeletePromo(code) {
  const confirmed = await niceConfirm(
    'Tarik Kode Promo',
    `Tarik kode promo ${code}? Anggota tidak akan bisa memakainya kembali.`,
    { type: 'danger' }
  );
  if (confirmed) {
    state.promos = state.promos.filter(p => p.kode !== code);
    DB.set('sa_promos', state.promos);
    showToast('Kupon berhasil ditarik.', 'info');
    switchAdminTab('promos');
  }
}

export async function handleDeleteMessage(idx) {
  const confirmed = await niceConfirm(
    'Arsipkan Pesan',
    'Arsipkan pesan ini dari inbox utama?',
    { type: 'info' }
  );
  if (confirmed) {
    state.messages.splice(idx, 1);
    DB.set('sa_messages', state.messages);
    showToast('Pesan berhasil diarsipkan!', 'success');
    syncAdminStats();
    switchAdminTab('messages');
  }
}

export async function handleDeleteUser(uId) {
  const confirmed = await niceConfirm(
    'Hapus Akun Pelanggan',
    `Apakah Anda yakin ingin menghapus secara permanen akun pelanggan dengan ID ${uId}? Semua riwayat sewa yang bersangkutan akan tetap tercatat di sistem log GOR.`,
    { type: 'danger' }
  );
  if (confirmed) {
    state.users = state.users.filter(u => u.id !== uId);
    DB.set('sa_users', state.users);
    showToast('Akun pelanggan berhasil dihapus secara permanen!', 'success');
    syncAdminStats();
    switchAdminTab('users');
  }
}

// --- VISITOR HUB CONTACT US ---
export function handleContactSubmit(e) {
  e.preventDefault();
  const nama = document.getElementById('contact-nama').value.trim();
  const email = document.getElementById('contact-email').value.trim();
  const pesan = document.getElementById('contact-pesan').value.trim();

  state.messages.push({ nama, email, pesan });
  DB.set('sa_messages', state.messages);

  showToast('Pesan Anda sukses dikirim! Tim Smash Arena akan membalas via email.', 'success');
  addNotification('Pertanyaan Masuk', `Pesan baru diterima dari pengirim ${nama} (${email}).`, 'info');

  document.getElementById('contact-form')?.reset();
}

// --- OWNER EXECUTIVE OPERATIONS ---
export function toggleGorStatus() {
  const current = localStorage.getItem('sa_gor_status') || 'buka';
  const target = current === 'closed' ? 'buka' : 'closed';
  localStorage.setItem('sa_gor_status', target);
  
  if (target === 'closed') {
    showToast('Operasional GOR ditutup sementara!', 'info');
    addNotification('GOR Ditutup', 'Pendaftaran sewa lapangan online dinonaktifkan sementara.', 'error');
  } else {
    showToast('Operasional GOR kembali dibuka secara online!', 'success');
    addNotification('GOR Dibuka', 'Pemesanan sesi lapangan online kembali aktif berkala.', 'success');
  }

  OwnerView.calculateStatsAndRender(state);
}

export function handleBroadcastAnnouncement() {
  const input = document.getElementById('owner-announcement-input');
  if (input) {
    const text = input.value.trim();
    localStorage.setItem('sa_announcement', text);
    showToast('Pengumuman resmi Pemilik GOR berhasil disiarkan secara real-time!', 'success');
    OwnerView.calculateStatsAndRender(state);
  }
}

export function resetBusinessData() {
  openModal('reset-database');
}

export async function executeResetFlow(type) {
  closeModal('reset-database');
  
  if (type === 'clean') {
    const confirmed = await niceConfirm(
      'Reset Sistem GOR (Kosong)',
      'Apakah Anda yakin ingin menghapus seluruh akun pelanggan, riwayat booking, dan pesan masuk secara permanen? GOR Anda akan berada dalam keadaan kosong dan bersih untuk digunakan oleh umum.',
      { type: 'danger' }
    );
    if (!confirmed) return;
    
    DB.resetToClean();
    showToast('Seluruh data sewa (booking) & akun pelanggan berhasil dikosongkan!', 'success');
  } else if (type === 'seed') {
    const confirmed = await niceConfirm(
      'Mereset GOR (Data Demo)',
      'Apakah Anda yakin ingin mengisi ulang sistem GOR dengan data demo premium? Seluruh kustomisasi aktif Anda akan ditimpa dengan 13 transaksi sewa bawaan simulasi.',
      { type: 'danger' }
    );
    if (!confirmed) return;
    
    DB.resetToSeed();
    showToast('Database GOR Smash Arena berhasil di-reset ke Data Demo Premium!', 'success');
  }
  
  // Sync state
  state.users = DB.get('sa_users');
  state.bookings = DB.get('sa_bookings');
  state.messages = DB.get('sa_messages');
  
  // Log out if deleted or not in active list
  if (state.currentUser && state.currentUser.role === 'pelanggan') {
    const exists = state.users.some(u => u.id === state.currentUser.id);
    if (!exists) {
      state.currentUser = null;
    }
  }

  syncSessionLayouts();
  navigate('owner');
}

// --- UTILITY MODAL SWITCHERS AND PASSWORD VISIBILITY ---
export function switchLoginRegisterModal() {
  closeModal('login');
  openModal('register');
}

export function switchRegisterLoginModal() {
  closeModal('register');
  openModal('login');
}

export function togglePasswordVisibility(id) {
  const input = document.getElementById(id);
  const icon = document.getElementById(`eye-icon-${id}`);
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    if (icon) {
      icon.setAttribute('data-lucide', 'eye-off');
    }
  } else {
    input.type = 'password';
    if (icon) {
      icon.setAttribute('data-lucide', 'eye');
    }
  }
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// --- GLOBAL BINDINGS TO WINDOW FOR INLINE TEMPLATE ONCLICKS ---
window.toggleTheme = toggleTheme;
window.toggleDarkMode = toggleTheme;
window.openModal = openModal;
window.closeModal = closeModal;
window.closeConfirmModal = closeConfirmModal;
window.resetBusinessData = resetBusinessData;
window.executeResetFlow = executeResetFlow;
window.switchCustomerTab = switchCustomerTab;
window.switchAdminTab = switchAdminTab;
window.selectBookingCourt = selectBookingCourt;
window.toggleSesiSlot = toggleSesiSlot;
window.selectPaymentMethod = selectPaymentMethod;
window.applyPromoCode = applyPromoCode;
window.cancelBooking = cancelBooking;
window.openPayTransferModal = openPayTransferModal;
window.openPrintVoucherModal = openPrintVoucherModal;
window.approveBooking = approveBooking;
window.rejectBooking = rejectBooking;
window.viewPaymentProof = viewPaymentProof;
window.editCourtSlot = handleEditCourt;
window.deleteCourtSlot = handleDeleteCourt;
window.openAddCourtModal = handleOpenAddCourt;
window.openAddPromoModal = handleOpenAddPromo;
window.deletePromoCoupon = handleDeletePromo;
window.deleteMessageInbox = handleDeleteMessage;
window.deleteUserAccount = handleDeleteUser;
window.clearSystemNotifications = clearSystemNotifications;
window.toggleNotificationDropdown = toggleNotificationDropdown;
window.handleLogout = handleLogout;
window.confirmLogoutAction = confirmLogoutAction;
window.triggerBookingView = triggerBookingView;
window.goUserDashboard = goUserDashboard;

// Inlines submit and click handlers
window.handleLoginSubmit = handleLoginSubmit;
window.handleRegisterSubmit = handleRegisterSubmit;
window.handleBookingSubmit = handleBookingSubmit;
window.handlePayProofSubmit = handlePayProofSubmit;
window.handleProfileUpdate = handleProfileUpdate;
window.handleCourtSave = handleCourtSave;
window.handlePromoSave = handlePromoSave;
window.handleContactSubmit = handleContactSubmit;
window.handleBroadcastAnnouncement = handleBroadcastAnnouncement;
window.handleBookingDateChanged = handleBookingDateChanged;
window.switchLoginRegisterModal = switchLoginRegisterModal;
window.switchRegisterLoginModal = switchRegisterLoginModal;
window.togglePasswordVisibility = togglePasswordVisibility;

// --- INITIALIZE EVERYTHING ON DOM MOUNTS ---
window.addEventListener('DOMContentLoaded', () => {
  // Sync preferences and states
  syncTheme();
  syncNotifications();
  syncSessionLayouts();

  // Populate first view on boot
  const storedView = localStorage.getItem('sa_current_view') || 'beranda';
  if (!state.currentUser && (storedView === 'admin' || storedView === 'owner' || storedView === 'customer')) {
    navigate('beranda');
  } else {
    navigate(storedView);
  }

  // Trigger real-time ticking clocks
  setInterval(() => {
    const timeEl1 = document.getElementById('realtime-clock-displaya');
    const timeEl2 = document.getElementById('live-time');
    const now = new Date();
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';
    if (timeEl1) timeEl1.innerText = timeStr;
    if (timeEl2) timeEl2.innerText = timeStr;
  }, 1000);

  // Static form submits are bound via inline onsubmit="..." in index.html to avoid duplicate submissions.

  // Bind top navbar elements
  document.getElementById('nav-link-beranda')?.addEventListener('click', () => navigate('beranda'));
  document.getElementById('nav-link-sewa')?.addEventListener('click', triggerBookingView);
  
  // Theme switcher bind
  document.getElementById('theme-toggle-btn')?.addEventListener('click', toggleTheme);

  // Notifications dropdown trigger bind
  document.getElementById('notif-bell-btn')?.addEventListener('click', toggleNotificationDropdown);
  document.getElementById('btn-clear-notifs')?.addEventListener('click', clearSystemNotifications);

  // Bind close dropdowns auto-closers
  document.addEventListener('click', (e) => {
    const notifMenu = document.getElementById('notif-dropdown');
    const notifBtn = document.getElementById('notif-bell-btn');
    if (notifMenu && !notifMenu.contains(e.target) && notifBtn && !notifBtn.contains(e.target)) {
      notifMenu.classList.add('hidden');
    }
  });
});
