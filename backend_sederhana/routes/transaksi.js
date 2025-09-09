const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET semua transaksi
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.id_transaksi, t.total_harga, t.tanggal, p.nama
      FROM transaksi t
      JOIN pelanggan p ON t.id_pelanggan = p.id_pelanggan
      ORDER BY t.id_transaksi DESC
    `);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET transaksi by id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const transaksi = await pool.query(`
      SELECT t.id_transaksi, t.total_harga, t.tanggal, p.nama
      FROM transaksi t
      JOIN pelanggan p ON t.id_pelanggan = p.id_pelanggan
      WHERE t.id_transaksi = $1
    `, [id]);

    if (transaksi.rows.length === 0) {
      return res.status(404).json({ message: 'Transaksi tidak ditemukan' });
    }

    const detail = await pool.query(`
      SELECT d.id_produk, d.jumlah, d.subtotal, d.nama_produk_snapshot
      FROM detail_transaksi d
      WHERE d.id_transaksi = $1
    `, [id]);

    res.json({ transaksi: transaksi.rows[0], detail: detail.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST buat transaksi baru
router.post('/', async (req, res) => {
  const { id_pelanggan, items } = req.body; 
  // items = [{ id_produk, jumlah }]

  const client = await pool.connect();
  try {
    await client.query('BEGIN'); // Mulai transaksi

    let total = 0;

    for (let item of items) {
      const produk = await client.query('SELECT * FROM produk WHERE id_produk=$1', [item.id_produk]);
      
      if (produk.rows.length === 0) {
        throw new Error(`Produk dengan id ${item.id_produk} tidak ditemukan`);
      }

      if (produk.rows[0].stok < item.jumlah) {
        throw new Error(`Stok produk ${produk.rows[0].nama_produk} tidak mencukupi`);
      }

      const harga = produk.rows[0].harga;
      total += harga * item.jumlah;
    }

    // Insert transaksi
    const transaksi = await client.query(
      'INSERT INTO transaksi (id_pelanggan, total_harga) VALUES ($1, $2) RETURNING *',
      [id_pelanggan, total]
    );
    const id_transaksi = transaksi.rows[0].id_transaksi;

    // Insert detail transaksi + update stok
    for (let item of items) {
      const produk = await client.query('SELECT * FROM produk WHERE id_produk=$1', [item.id_produk]);
      const harga = produk.rows[0].harga;
      const subtotal = harga * item.jumlah;

      await client.query(
        'INSERT INTO detail_transaksi (id_transaksi, id_produk, jumlah, subtotal, nama_produk_snapshot) VALUES ($1, $2, $3, $4, $5)',
        [id_transaksi, item.id_produk, item.jumlah, subtotal, produk.rows[0].nama_produk]
      );

      await client.query(
        'UPDATE produk SET stok = stok - $1 WHERE id_produk=$2',
        [item.jumlah, item.id_produk]
      );
    }

    await client.query('COMMIT'); // Simpan transaksi
    res.status(201).json({ 
      message: 'Transaksi berhasil', 
      transaksi: transaksi.rows[0] 
    });
  } catch (err) {
    await client.query('ROLLBACK'); // Batalkan jika error
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
