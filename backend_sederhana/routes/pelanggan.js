const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET semua pelanggan
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM pelanggan ORDER BY id_pelanggan ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET pelanggan by id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM pelanggan WHERE id_pelanggan=$1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Pelanggan tidak ditemukan' });
    }
    res.json(result.rows[0]);
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

// PUT update pelanggan
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nama, email, telepon, alamat } = req.body;

  try {
    const oldData = await pool.query('SELECT * FROM pelanggan WHERE id_pelanggan=$1', [id]);
    if (oldData.rows.length === 0) {
      return res.status(404).json({ message: 'Pelanggan tidak ditemukan' });
    }

    const result = await pool.query(
      `UPDATE pelanggan 
       SET nama=$1, email=$2, telepon=$3, alamat=$4 
       WHERE id_pelanggan=$5 RETURNING *`,
      [nama, email, telepon, alamat, id]
    );

    res.json({ message: 'Pelanggan berhasil diupdate', pelanggan: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE pelanggan
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM pelanggan WHERE id_pelanggan=$1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Pelanggan tidak ditemukan' });
    }
    res.json({ message: 'Pelanggan berhasil dihapus', pelanggan: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
