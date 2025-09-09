const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET semua produk
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM produk');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST tambah produk
router.post('/', async (req, res) => {
  const { nama_produk, harga, stok } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO produk (nama_produk, harga, stok) VALUES ($1, $2, $3) RETURNING *',
      [nama_produk, harga, stok]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update produk
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nama_produk, harga, stok } = req.body;

  try {
    const oldProduk = await pool.query('SELECT * FROM produk WHERE id_produk=$1', [id]);
    if (oldProduk.rows.length === 0) {
      return res.status(404).json({ message: 'Produk tidak ditemukan' });
    }

    // Update produk (nama, harga, stok)
    const result = await pool.query(
      `UPDATE produk 
       SET nama_produk = $1, harga = $2, stok = $3 
       WHERE id_produk = $4 
       RETURNING *`,
      [nama_produk, harga, stok, id]
    );

    res.json({ message: 'Produk berhasil diupdate', produk: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE produk
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM produk WHERE id_produk=$1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Produk tidak ditemukan' });
    }
    res.json({ message: 'Produk berhasil dihapus', produk: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
