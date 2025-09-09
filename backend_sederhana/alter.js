const pool = require('./db');

async function alterTable() {
  try {
    await pool.query(`
      ALTER TABLE detail_transaksi 
      ADD COLUMN IF NOT EXISTS nama_produk_snapshot VARCHAR(100) NOT NULL DEFAULT '';
    `);

    console.log("✅ Kolom nama_produk_snapshot sudah siap!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error alter table:", err.message);
    process.exit(1);
  }
}

alterTable();
