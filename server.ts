import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

// Load local environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Serve the Badminton court and QR code assets statically to make them fully visible in production/production-built modes
app.use("/src/assets/images", express.static(path.join(process.cwd(), "src/assets/images")));

// Temporal custom session configuration for easy debug
let sessionConfig: any = null;

function getDbConfig() {
  const host = sessionConfig?.host || process.env.TIDB_HOST;
  const port = parseInt(sessionConfig?.port || process.env.TIDB_PORT || "4000");
  const user = sessionConfig?.user || process.env.TIDB_USER;
  const password = sessionConfig?.password || process.env.TIDB_PASSWORD;
  const database = sessionConfig?.database || process.env.TIDB_DATABASE;
  const sslEnable = sessionConfig?.sslEnable !== undefined ? sessionConfig.sslEnable : (process.env.TIDB_SSL_ENABLE === "true");

  return { host, port, user, password, database, sslEnable };
}

async function getDbConnection() {
  const config = getDbConfig();

  if (!config.host || !config.user || !config.database) {
    throw new Error(
      "Kredensial database TiDB Anda belum lengkap. Silakan lengkapi di file .env."
    );
  }

  const connectionOptions: any = {
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database,
    connectTimeout: 10000,
  };

  // Aktifkan SSL jika diaktifkan pada konfigurasi
  if (config.sslEnable) {
    connectionOptions.ssl = {
      rejectUnauthorized: false,
    };
  }

  try {
    // Membuat koneksi ke TiDB
    const connection = await mysql.createConnection(connectionOptions);

    // Tes koneksi
    const [rows] = await connection.query("SELECT 1 AS status");

    console.log("========================================");
    console.log("✅ BERHASIL TERHUBUNG KE TIDB CLOUD");
    console.log("Host     :", config.host);
    console.log("Database :", config.database);
    console.log("Hasil Tes:", rows);
    console.log("========================================");

    return connection;
  } catch (err: any) {
    console.error("========================================");
    console.error("❌ GAGAL TERHUBUNG KE TIDB CLOUD");
    console.error("Error:", err.message);
    console.error("========================================");
    throw err;
  }
}

// Ensure database connection and tables structure
async function initializeTables(connection: mysql.Connection) {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS sa_users (
      id VARCHAR(50) PRIMARY KEY,
      nama VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS sa_courts (
      id VARCHAR(50) PRIMARY KEY,
      nama VARCHAR(255) NOT NULL,
      tipe VARCHAR(255) NOT NULL,
      harga INT NOT NULL,
      tersedia VARCHAR(10) NOT NULL,
      foto VARCHAR(512) NOT NULL
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS sa_promos (
      kode VARCHAR(50) PRIMARY KEY,
      persen INT NOT NULL,
      \`desc\` VARCHAR(512) NOT NULL
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS sa_bookings (
      id VARCHAR(50) PRIMARY KEY,
      userId VARCHAR(50) NOT NULL,
      courtId VARCHAR(50) NOT NULL,
      tgl VARCHAR(50) NOT NULL,
      sesi TEXT NOT NULL,
      subtotal INT NOT NULL,
      diskon INT NOT NULL,
      grandtotal INT NOT NULL,
      status VARCHAR(100) NOT NULL,
      pengirim VARCHAR(255) NOT NULL,
      tgl_buat VARCHAR(50) NOT NULL,
      metodeBayar VARCHAR(100) NOT NULL
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS sa_messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nama VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      pesan TEXT NOT NULL
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS sa_metadata (
      k VARCHAR(255) PRIMARY KEY,
      v TEXT NOT NULL
    )
  `);
}

// 1. Check TiDB database connection status
app.get("/api/tidb/status", async (req, res) => {
  const config = getDbConfig();
  if (!config.host || !config.user || !config.database) {
    return res.json({
      active: false,
      configured: false,
      message: "TiDB belum terkonfigurasi. Lengkapi di .env atau panel pimpinan GOR."
    });
  }

  let connection;
  try {
    connection = await getDbConnection();
    await connection.query("SELECT 1");
    
    // Check if tables exist
    const [rows]: any = await connection.query("SHOW TABLES");
    const tablesList = rows.map((r: any) => Object.values(r)[0]);
    const initialized = tablesList.includes("sa_users") && tablesList.includes("sa_bookings");

    return res.json({
      active: true,
      configured: true,
      host: config.host,
      database: config.database,
      tablesExist: initialized,
      tablesList,
      message: "Koneksi sukses! Sistem terhubung ke TiDB Cloud."
    });
  } catch (error: any) {
    return res.json({
      active: false,
      configured: true,
      host: config.host,
      database: config.database,
      error: error.message,
      message: "Integrasi gagal: " + error.message
    });
  } finally {
    if (connection) await connection.end();
  }
});

// 2. Test dynamic custom credentials temporarily 
app.post("/api/tidb/config", async (req, res) => {
  const { host, port, user, password, database, sslEnable } = req.body;

  sessionConfig = {
    host,
    port: port || "4000",
    user,
    password,
    database,
    sslEnable: sslEnable === true || sslEnable === "true"
  };

  let connection;
  try {
    connection = await getDbConnection();
    await connection.query("SELECT 1");
    // Ensure table structure exists
    await initializeTables(connection);
    
    return res.json({
      success: true,
      message: "Koneksi TiDB berhasil diuji, struktur tabel dibuat, dan disimpan!"
    });
  } catch (err: any) {
    sessionConfig = null; // revert on failure
    return res.json({
      success: false,
      message: "Gagal menghubungkan: " + err.message
    });
  } finally {
    if (connection) await connection.end();
  }
});

// 3. Push local storage to TiDB database
app.post("/api/tidb/push", async (req, res) => {
  const { users, bookings, messages, courts, promos, metadata } = req.body;
  
  let connection;
  try {
    connection = await getDbConnection();
    // Pre-initialize
    await initializeTables(connection);

    // Sync Users
    if (Array.isArray(users)) {
      await connection.query("DELETE FROM sa_users");
      for (const u of users) {
        if (!u.id) continue;
        await connection.query(
          "INSERT INTO sa_users (id, nama, email, password, role) VALUES (?, ?, ?, ?, ?)",
          [u.id, u.nama || "", u.email || "", u.password || "", u.role || "pelanggan"]
        );
      }
    }

    // Sync Courts (Lantai)
    if (Array.isArray(courts)) {
      await connection.query("DELETE FROM sa_courts");
      for (const c of courts) {
        if (!c.id) continue;
        await connection.query(
          "INSERT INTO sa_courts (id, nama, tipe, harga, tersedia, foto) VALUES (?, ?, ?, ?, ?, ?)",
          [c.id, c.nama || "", c.tipe || "", c.harga || 0, c.tersedia || "yes", c.foto || ""]
        );
      }
    }

    // Sync Promos
    if (Array.isArray(promos)) {
      await connection.query("DELETE FROM sa_promos");
      for (const p of promos) {
        if (!p.kode) continue;
        await connection.query(
          "INSERT INTO sa_promos (kode, persen, \`desc\`) VALUES (?, ?, ?)",
          [p.kode, p.persen || 0, p.desc || ""]
        );
      }
    }

    // Sync Bookings
    if (Array.isArray(bookings)) {
      await connection.query("DELETE FROM sa_bookings");
      for (const b of bookings) {
        if (!b.id) continue;
        await connection.query(
          "INSERT INTO sa_bookings (id, userId, courtId, tgl, sesi, subtotal, diskon, grandtotal, status, pengirim, tgl_buat, metodeBayar) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [
            b.id,
            b.userId || "",
            b.courtId || "",
            b.tgl || "",
            Array.isArray(b.sesi) ? JSON.stringify(b.sesi) : (b.sesi || "[]"),
            b.subtotal || 0,
            b.diskon || 0,
            b.grandtotal || 0,
            b.status || "Pending Approval",
            b.pengirim || "",
            b.tgl_buat || "",
            b.metodeBayar || "qris"
          ]
        );
      }
    }

    // Sync Hubungi Pesan
    if (Array.isArray(messages)) {
      await connection.query("DELETE FROM sa_messages");
      for (const m of messages) {
        await connection.query(
          "INSERT INTO sa_messages (nama, email, pesan) VALUES (?, ?, ?)",
          [m.nama || "", m.email || "", m.pesan || ""]
        );
      }
    }

    // Sync General Metadata (gor status, announcement)
    if (metadata && typeof metadata === "object") {
      await connection.query("DELETE FROM sa_metadata");
      for (const [k, v] of Object.entries(metadata)) {
        if (v !== undefined && v !== null) {
          await connection.query(
            "INSERT INTO sa_metadata (k, v) VALUES (?, ?) ON DUPLICATE KEY UPDATE v = ?",
            [String(k), String(v), String(v)]
          );
        }
      }
    }

    return res.json({
      success: true,
      message: "Sukses! Seluruh data GOR telah didorong & disimpan di TiDB Cloud."
    });
  } catch (err: any) {
    return res.json({
      success: false,
      message: "Gagal menyelaraskan TiDB: " + err.message
    });
  } finally {
    if (connection) await connection.end();
  }
});

// 4. Pull database from TiDB to Client
app.get("/api/tidb/pull", async (req, res) => {
  let connection;
  try {
    connection = await getDbConnection();
    
    // Ensure tables exist
    await initializeTables(connection);

    // Query databases safely
    const [users]: any = await connection.query("SELECT * FROM sa_users");
    const [courts]: any = await connection.query("SELECT * FROM sa_courts");
    const [promos]: any = await connection.query("SELECT * FROM sa_promos");
    const [bookings]: any = await connection.query("SELECT * FROM sa_bookings");
    const [messages]: any = await connection.query("SELECT * FROM sa_messages");
    const [metadata]: any = await connection.query("SELECT * FROM sa_metadata");

    // Reformat fields
    const parsedBookings = bookings.map((b: any) => {
      let sessions = [];
      try {
        sessions = JSON.parse(b.sesi);
        if (!Array.isArray(sessions)) sessions = [];
      } catch (e) {
        sessions = typeof b.sesi === "string" && b.sesi ? b.sesi.split(",") : [];
      }
      return {
        ...b,
        sesi: sessions
      };
    });

    // Reformat promos
    const parsedPromos = promos.map((p: any) => ({
      kode: p.kode,
      persen: p.persen,
      desc: p.desc
    }));

    // Reformat metadata
    const parsedMetadata: any = {};
    if (Array.isArray(metadata)) {
      metadata.forEach((item: any) => {
        parsedMetadata[item.k] = item.v;
      });
    }

    return res.json({
      success: true,
      data: {
        users,
        courts,
        promos: parsedPromos,
        bookings: parsedBookings,
        messages,
        metadata: parsedMetadata
      },
      message: "Data ditarik secara online dari TiDB Cloud."
    });
  } catch (err: any) {
    return res.json({
      success: false,
      message: "Gagal menarik data dari TiDB: " + err.message
    });
  } finally {
    if (connection) await connection.end();
  }
});


export { app };

// Start Vite Dev Server Middleware or Serve Built Production Bundles if not in serverless (Netlify) environment
if (!process.env.NETLIFY && !process.env.AWS_LAMBDA) {
  async function startServer() {
    if (process.env.NODE_ENV !== "production") {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), "dist");
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server is listening on http://localhost:${PORT}`);
    });
  }

  startServer().catch(err => {
    console.error("Vite server loader failed:", err);
  });
}
