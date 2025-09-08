const express = require('express');
const router = express.Router();
const pool = require('../db');

// POST buat transaksi baru
router.post('/', async (req, res) => {
  const { id_pelanggan, items } = req.body; 
  // items = [{ id_produk, jumlah }]

  try {
    // Hitung total
    let total = 0;
    for (let item of items) {
      const produk = await pool.query('SELECT * FROM produk WHERE id_produk=$1', [item.id_produk]);
      const harga = produk.rows[0].harga;
      total += harga * item.jumlah;
    }

    // Insert transaksi
    const transaksi = await pool.query(
      'INSERT INTO transaksi (id_pelanggan, total_harga) VALUES ($1, $2) RETURNING *',
      [id_pelanggan, total]
    );

    const id_transaksi = transaksi.rows[0].id_transaksi;

    // Insert detail transaksi
    for (let item of items) {
      const produk = await pool.query('SELECT * FROM produk WHERE id_produk=$1', [item.id_produk]);
      const harga = produk.rows[0].harga;
      const subtotal = harga * item.jumlah;

      await pool.query(
        'INSERT INTO detail_transaksi (id_transaksi, id_produk, jumlah, subtotal) VALUES ($1, $2, $3, $4)',
        [id_transaksi, item.id_produk, item.jumlah, subtotal]
      );

      // Update stok produk
      await pool.query(
        'UPDATE produk SET stok = stok - $1 WHERE id_produk=$2',
        [item.jumlah, item.id_produk]
      );
    }

    res.status(201).json({ message: 'Transaksi berhasil', transaksi: transaksi.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
