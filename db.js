// --- REALTIME DATABASE LOCAL PERSISTENCE LAYER ---
const getRelativeDateStr = (offset) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split('T')[0];
};

const seedUsers = [
  { id: 'U11', nama: 'Administrator Smash', email: 'admin@smasharena.com', password: 'admin123', role: 'admin' },
  { id: 'U10', nama: 'Refli Zahara Sikin', email: 'pemilik@smasharena.com', password: 'pemilik123', role: 'owner' },
  { id: 'U12', nama: 'Budi Santoso', email: 'budi@gmail.com', password: 'user123', role: 'pelanggan' },
  { id: 'U13', nama: 'Andi Wijaya', email: 'andi@gmail.com', password: 'user123', role: 'pelanggan' },
  { id: 'U14', nama: 'Citra Dewi', email: 'citra@gmail.com', password: 'user123', role: 'pelanggan' },
  { id: 'U15', nama: 'Eko Prasetyo', email: 'eko@gmail.com', password: 'user123', role: 'pelanggan' },
  { id: 'U16', nama: 'Farhan Malik', email: 'farhan@gmail.com', password: 'user123', role: 'pelanggan' },
  { id: 'U17', nama: 'Gita Permata', email: 'gita@gmail.com', password: 'user123', role: 'pelanggan' },
  { id: 'U18', nama: 'Hasan Basri', email: 'hasan@gmail.com', password: 'user123', role: 'pelanggan' },
  { id: 'U19', nama: 'Indah Lestari', email: 'indah@gmail.com', password: 'user123', role: 'pelanggan' }
];

const seedBookings = [
  { id: 'BKT101', userId: 'U12', courtId: 'A', tgl: getRelativeDateStr(0), sesi: ['09:00 - 10:00', '10:00 - 11:00'], subtotal: 180000, diskon: 36000, grandtotal: 144000, status: 'Disetujui', pengirim: 'Budi Santoso', tgl_buat: getRelativeDateStr(-2), metodeBayar: 'bca' },
  { id: 'BKT102', userId: 'U13', courtId: 'B', tgl: getRelativeDateStr(-1), sesi: ['19:00 - 20:00', '20:00 - 21:00'], subtotal: 220000, diskon: 22000, grandtotal: 198000, status: 'Disetujui', pengirim: 'Andi Wijaya', tgl_buat: getRelativeDateStr(-2), metodeBayar: 'mandiri' },
  { id: 'BKT103', userId: 'U14', courtId: 'C', tgl: getRelativeDateStr(-1), sesi: ['15:00 - 16:00', '16:00 - 17:00'], subtotal: 160000, diskon: 16000, grandtotal: 144000, status: 'Disetujui', pengirim: 'Citra Dewi', tgl_buat: getRelativeDateStr(-3), metodeBayar: 'qris' },
  { id: 'BKT104', userId: 'U15', courtId: 'D', tgl: getRelativeDateStr(1), sesi: ['10:00 - 11:00'], subtotal: 75000, diskon: 0, grandtotal: 75000, status: 'Pending Approval', pengirim: 'Eko Prasetyo', tgl_buat: getRelativeDateStr(0), metodeBayar: 'qris' },
  { id: 'BKT105', userId: 'U17', courtId: 'A', tgl: getRelativeDateStr(-2), sesi: ['16:00 - 17:00', '17:00 - 18:00'], subtotal: 180000, diskon: 18000, grandtotal: 162000, status: 'Disetujui', pengirim: 'Gita Permata', tgl_buat: getRelativeDateStr(-2), metodeBayar: 'bca' },
  { id: 'BKT106', userId: 'U18', courtId: 'B', tgl: getRelativeDateStr(1), sesi: ['20:00 - 21:00', '21:00 - 22:00'], subtotal: 220000, diskon: 22000, grandtotal: 198000, status: 'Menunggu Pembayaran', pengirim: '', tgl_buat: getRelativeDateStr(0), metodeBayar: 'qris' },
  { id: 'BKT107', userId: 'U16', courtId: 'E', tgl: getRelativeDateStr(-1), sesi: ['18:00 - 19:00'], subtotal: 50000, diskon: 5050, grandtotal: 44950, status: 'Disetujui', pengirim: 'Farhan Malik', tgl_buat: getRelativeDateStr(-2), metodeBayar: 'shopeepay' },
  { id: 'BKT108', userId: 'U19', courtId: 'C', tgl: getRelativeDateStr(0), sesi: ['08:00 - 09:00'], subtotal: 80000, diskon: 0, grandtotal: 80000, status: 'Disetujui', pengirim: 'Indah Lestari', tgl_buat: getRelativeDateStr(-1), metodeBayar: 'bni' },
  { id: 'BKT109', userId: 'U14', courtId: 'A', tgl: getRelativeDateStr(-3), sesi: ['14:00 - 15:00', '15:00 - 16:00'], subtotal: 180000, diskon: 0, grandtotal: 180000, status: 'Disetujui', pengirim: 'Citra Dewi', tgl_buat: getRelativeDateStr(-4), metodeBayar: 'bca' },
  { id: 'BKT110', userId: 'U13', courtId: 'B', tgl: getRelativeDateStr(0), sesi: ['10:00 - 11:00'], subtotal: 110000, diskon: 11000, grandtotal: 99000, status: 'Disetujui', pengirim: 'Andi Wijaya', tgl_buat: getRelativeDateStr(-1), metodeBayar: 'gopay' },
  { id: 'BKT111', userId: 'U12', courtId: 'D', tgl: getRelativeDateStr(-3), sesi: ['19:00 - 20:00', '20:00 - 21:00'], subtotal: 150000, diskon: 30000, grandtotal: 120000, status: 'Disetujui', pengirim: 'Budi Santoso', tgl_buat: getRelativeDateStr(-5), metodeBayar: 'bca' },
  { id: 'BKT112', userId: 'U16', courtId: 'E', tgl: getRelativeDateStr(-4), sesi: ['10:00 - 11:00'], subtotal: 50000, diskon: 5000, grandtotal: 45000, status: 'Disetujui', pengirim: 'Farhan Malik', tgl_buat: getRelativeDateStr(-4), metodeBayar: 'cash' },
  { id: 'BKT113', userId: 'U17', courtId: 'B', tgl: getRelativeDateStr(1), sesi: ['14:00 - 15:00'], subtotal: 110000, diskon: 0, grandtotal: 110000, status: 'Pending Approval', pengirim: 'Gita Permata', tgl_buat: getRelativeDateStr(0), metodeBayar: 'bca' }
];

const seedMessages = [
  { nama: 'Roni', email: 'roni@gmail.com', pesan: 'Apakah shuttlecock disewakan juga di kantin depan GOR?' },
  { nama: 'Andi Wijaya', email: 'andi@gmail.com', pesan: 'Sangat menyukai lapangan karpet vinylnya, empuk dan tidak licin. Semoga kebersihan kamar mandi ditingkatkan lagi.' },
  { nama: 'Citra Dewi', email: 'citra@gmail.com', pesan: 'Apakah ada paket member bulanan untuk bermain rutin setiap hari jumat malam?' },
  { nama: 'Gita Permata', email: 'gita@gmail.com', pesan: 'GOR bersih sekali dan penerangan sangat bagus di malam hari! Sesi malam sangat nyaman.' }
];

export const DB = {
  init() {
    // Force version 6 reset to clear all bookings and bookings history right now
    if (!localStorage.getItem('sa_force_reset_v6')) {
      const adminAndOwner = [
        { id: 'U11', nama: 'Administrator Smash', email: 'admin@smasharena.com', password: 'admin123', role: 'admin' },
        { id: 'U10', nama: 'Refli Zahara Sikin', email: 'pemilik@smasharena.com', password: 'pemilik123', role: 'owner' }
      ];
      localStorage.setItem('sa_users', JSON.stringify(adminAndOwner));
      localStorage.setItem('sa_bookings', JSON.stringify([]));
      localStorage.setItem('sa_messages', JSON.stringify([]));
      localStorage.setItem('sa_force_reset_v6', 'done');
    }

    // If courts are not initialized or need migration to the new local premium images
    const storedCourtsRaw = localStorage.getItem('sa_courts');
    let needsImageUpgrade = false;
    if (storedCourtsRaw) {
      try {
        const parsed = JSON.parse(storedCourtsRaw);
        // If some courts do not contain the newly generated local assets
        needsImageUpgrade = parsed.some(c => !c.foto || !c.foto.includes('/src/assets/images/'));
      } catch (e) {
        needsImageUpgrade = true;
      }
    }

    if (!storedCourtsRaw || JSON.parse(storedCourtsRaw).length === 4 || needsImageUpgrade) {
      localStorage.setItem('sa_courts', JSON.stringify([
        { 
          id: 'A', 
          nama: 'Lapangan Karpet Vinyl (PVC)', 
          tipe: 'Karpet Vinyl (PVC)', 
          harga: 90000, 
          tersedia: 'yes', 
          foto: '/src/assets/images/court_a_vinyl_1781135055294.png'
        },
        { 
          id: 'B', 
          nama: 'Lapangan Lantai Kayu (Parket)', 
          tipe: 'Lantai Kayu (Parket)', 
          harga: 110000, 
          tersedia: 'yes', 
          foto: '/src/assets/images/court_b_parquet_1781135071075.png'
        },
        { 
          id: 'C', 
          nama: 'Lapangan Flexipave (Akrilik)', 
          tipe: 'Flexipave (Akrilik)', 
          harga: 80000, 
          tersedia: 'yes', 
          foto: '/src/assets/images/court_c_flexipave_1781135084614.png'
        },
        { 
          id: 'D', 
          nama: 'Lapangan Interlock (Plastik PP)', 
          tipe: 'Interlock (Plastik PP)', 
          harga: 75000, 
          tersedia: 'yes', 
          foto: '/src/assets/images/court_d_interlock_1781135098725.png'
        },
        { 
          id: 'E', 
          nama: 'Lapangan Semen / Plesteran', 
          tipe: 'Semen / Plesteran', 
          harga: 50000, 
          tersedia: 'yes', 
          foto: '/src/assets/images/court_e_semen_1781135034346.png'
        }
      ]));
    } else {
      // Ensure photos exist and correct them
      try {
        let storedC = JSON.parse(localStorage.getItem('sa_courts') || '[]');
        let changed = false;
        const defaultPhotos = {
          'A': '/src/assets/images/court_a_vinyl_1781135055294.png',
          'B': '/src/assets/images/court_b_parquet_1781135071075.png',
          'C': '/src/assets/images/court_c_flexipave_1781135084614.png',
          'D': '/src/assets/images/court_d_interlock_1781135098725.png',
          'E': '/src/assets/images/court_e_semen_1781135034346.png'
        };
        storedC.forEach(c => {
          if (!c.foto || !c.foto.includes('/src/assets/images/')) {
            c.foto = defaultPhotos[c.id] || defaultPhotos['A'];
            changed = true;
          }
        });
        if (changed && storedC.length > 0) {
          localStorage.setItem('sa_courts', JSON.stringify(storedC));
        }
      } catch (e) {
        console.error("Court migration error:", e);
      }
    }

    if (!localStorage.getItem('sa_promos')) {
      localStorage.setItem('sa_promos', JSON.stringify([
        { kode: 'SMASH20', persen: 20, desc: 'Diskon kilat 20% khusus member baru' },
        { kode: 'MEMBERBARU', persen: 10, desc: 'Potongan harga loyalitas 10% setiap sesi' },
        { kode: 'WEEKENDSERU', persen: 15, desc: 'Promo akhir pekan seru diskon 15% semua GOR' }
      ]));
    }

    if (!localStorage.getItem('sa_users')) {
      localStorage.setItem('sa_users', JSON.stringify(seedUsers));
    }

    if (!localStorage.getItem('sa_bookings')) {
      localStorage.setItem('sa_bookings', JSON.stringify(seedBookings));
    }

    if (!localStorage.getItem('sa_messages')) {
      localStorage.setItem('sa_messages', JSON.stringify(seedMessages));
    }

    if (!localStorage.getItem('sa_notifs')) {
      localStorage.setItem('sa_notifs', JSON.stringify([
        { id: 1, title: 'Halo Pemain!', body: 'Pemesanan GOR Smash Arena kini sudah mendukung real-time booking sesi dengan metode pilihan bayar terlengkap.', tipe: 'info' }
      ]));
    }
  },

  get(k) { 
    return JSON.parse(localStorage.getItem(k)); 
  },

  set(k, v) { 
    localStorage.setItem(k, JSON.stringify(v)); 
  },

  resetToSeed() {
    localStorage.setItem('sa_users', JSON.stringify(seedUsers));
    localStorage.setItem('sa_bookings', JSON.stringify(seedBookings));
    localStorage.setItem('sa_messages', JSON.stringify(seedMessages));
    localStorage.removeItem('sa_gor_status');
    localStorage.removeItem('sa_announcement');
  },

  resetToClean() {
    const adminAndOwner = [
      { id: 'U11', nama: 'Administrator Smash', email: 'admin@smasharena.com', password: 'admin123', role: 'admin' },
      { id: 'U10', nama: 'Refli Zahara Sikin', email: 'pemilik@smasharena.com', password: 'pemilik123', role: 'owner' }
    ];
    localStorage.setItem('sa_users', JSON.stringify(adminAndOwner));
    localStorage.setItem('sa_bookings', JSON.stringify([]));
    localStorage.setItem('sa_messages', JSON.stringify([]));
    localStorage.removeItem('sa_gor_status');
    localStorage.removeItem('sa_announcement');
  }
};

// Run initialization immediately on load
DB.init();

// Handle force reset key
if (!localStorage.getItem('sa_force_reset_v5')) {
  localStorage.setItem('sa_users', JSON.stringify(seedUsers));
  localStorage.setItem('sa_bookings', JSON.stringify(seedBookings));
  localStorage.setItem('sa_messages', JSON.stringify(seedMessages));
  localStorage.setItem('sa_force_reset_v5', 'done');
}

// Ensure Owner and Admin accounts are present and not duplicated with other roles
{
  let existingUsers = JSON.parse(localStorage.getItem('sa_users') || '[]');
  
  // Clean up any email duplicates and enforce exact admin/owner roles
  existingUsers = existingUsers.filter(u => {
    const emailLower = u.email.toLowerCase();
    if (emailLower === 'admin@smasharena.com' && u.role !== 'admin') {
      return false; // Remove incorrect admin roles
    }
    if (emailLower === 'pemilik@smasharena.com' && u.role !== 'owner') {
      return false; // Remove incorrect owner roles
    }
    return true;
  });

  // Ensure Owner is present and details are synchronized
  let hasOwner = false;
  existingUsers.forEach(u => {
    if (u.role === 'owner' || u.email.toLowerCase() === 'pemilik@smasharena.com') {
      u.id = 'U10';
      u.nama = 'Refli Zahara Sikin';
      u.email = 'pemilik@smasharena.com';
      u.password = 'pemilik123';
      u.role = 'owner';
      hasOwner = true;
    }
  });
  if (!hasOwner) {
    existingUsers.unshift({ id: 'U10', nama: 'Refli Zahara Sikin', email: 'pemilik@smasharena.com', password: 'pemilik123', role: 'owner' });
  }

  // Ensure Admin is present and details are synchronized
  let hasAdmin = false;
  existingUsers.forEach(u => {
    if (u.role === 'admin' || u.email.toLowerCase() === 'admin@smasharena.com') {
      u.id = 'U11';
      u.nama = 'Administrator Smash';
      u.email = 'admin@smasharena.com';
      u.password = 'admin123';
      u.role = 'admin';
      hasAdmin = true;
    }
  });
  if (!hasAdmin) {
    existingUsers.unshift({ id: 'U11', nama: 'Administrator Smash', email: 'admin@smasharena.com', password: 'admin123', role: 'admin' });
  }

  // Final check to deduplicate array by email
  const uniqueUsers = [];
  const registeredEmails = new Set();
  existingUsers.forEach(u => {
    const emailLower = u.email.toLowerCase();
    if (!registeredEmails.has(emailLower)) {
      registeredEmails.add(emailLower);
      uniqueUsers.push(u);
    }
  });

  localStorage.setItem('sa_users', JSON.stringify(uniqueUsers));
}

// Load global states
export const state = {
  currentUser: JSON.parse(localStorage.getItem('sa_current_user') || 'null'),
  currentView: localStorage.getItem('sa_current_view') || 'beranda',
  activeCustomerTab: 'book',
  activeAdminTab: 'bookings',
  courts: DB.get('sa_courts'),
  promos: DB.get('sa_promos'),
  users: DB.get('sa_users'),
  bookings: DB.get('sa_bookings'),
  messages: DB.get('sa_messages'),
  notifications: DB.get('sa_notifs'),
  darkMode: localStorage.getItem('sa_dark') === 'yes',
  bookingFields: {
    courtId: '',
    date: '',
    sesi: [],
    appliedPromo: null,
    metodeBayar: 'bca'
  }
};
