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

module.exports = router;
