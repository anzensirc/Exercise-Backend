// migrate.js
const { Pool } = require('pg');

// koneksi awal ke postgres default (bukan ke database toko)
const rootPool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres', // default DB
  password: 'ansen123', // ganti sesuai
  port: 5432,
});

// koneksi ke database toko (akan dipakai setelah dibuat)
const tokoConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'toko',
  password: 'ansen123', // ganti sesuai
  port: 5432,
};

async function migrate() {
  const tokoPool = new Pool(tokoConfig);

  try {
    // 1. Buat tabel produk
    await tokoPool.query(`
      CREATE TABLE IF NOT EXISTS produk (
        id_produk SERIAL PRIMARY KEY,
        nama_produk VARCHAR(100) NOT NULL,
        harga NUMERIC(12,2) NOT NULL,
        stok INT NOT NULL DEFAULT 0
      );
    `);

    // 2. Buat tabel pelanggan
    await tokoPool.query(`
      CREATE TABLE IF NOT EXISTS pelanggan (
        id_pelanggan SERIAL PRIMARY KEY,
        nama VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        telepon VARCHAR(20),
        alamat TEXT
      );
    `);

    // 3. Buat tabel transaksi
    await tokoPool.query(`
      CREATE TABLE IF NOT EXISTS transaksi (
        id_transaksi SERIAL PRIMARY KEY,
        id_pelanggan INT REFERENCES pelanggan(id_pelanggan) ON DELETE CASCADE,
        total_harga NUMERIC(12,2) NOT NULL,
        tanggal TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. Buat tabel detail_transaksi
    await tokoPool.query(`
      CREATE TABLE IF NOT EXISTS detail_transaksi (
        id_detail SERIAL PRIMARY KEY,
        id_transaksi INT REFERENCES transaksi(id_transaksi) ON DELETE CASCADE,
        id_produk INT REFERENCES produk(id_produk),
        jumlah INT NOT NULL,
        subtotal NUMERIC(12,2) NOT NULL,
        nama_produk_snapshot VARCHAR(100) NOT NULL
      );
    `);

    console.log("✅ Migrasi database selesai!");
  } catch (err) {
    console.error("❌ Error migrasi database:", err.message);
  } finally {
    tokoPool.end();
    process.exit(0);
  }
}

async function init() {
  try {
    // cek apakah database toko ada
    const res = await rootPool.query(
      "SELECT 1 FROM pg_database WHERE datname = 'toko'"
    );

    if (res.rowCount === 0) {
      console.log("⚠️ Database 'toko' belum ada, membuat baru...");
      await rootPool.query("CREATE DATABASE toko");
    } else {
      console.log("✅ Database 'toko' sudah ada");
    }

    // jalankan migrasi
    await migrate();
  } catch (err) {
    console.error("❌ Error init:", err.message);
    process.exit(1);
  } finally {
    rootPool.end();
  }
}

init();
