const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET semua pelanggan
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM pelanggan');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST tambah pelanggan
router.post('/', async (req, res) => {
  const { nama, email, telepon, alamat } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO pelanggan (nama, email, telepon, alamat) VALUES ($1, $2, $3, $4) RETURNING *',
      [nama, email, telepon, alamat]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
