const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan('dev')); // log setiap request di console

// Import routes
const produkRoutes = require('./routes/produk');
const pelangganRoutes = require('./routes/pelanggan');
const transaksiRoutes = require('./routes/transaksi');

// Routes
app.get('/', (req, res) => {
  res.send('🚀 API Kasir Online berjalan!');
});

app.use('/produk', produkRoutes);
app.use('/pelanggan', pelangganRoutes);
app.use('/transaksi', transaksiRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint tidak ditemukan' });
});

// Error handler (global)
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({ error: 'Terjadi kesalahan pada server' });
});

// Jalankan server
app.listen(port, () => {
  console.log(`✅ Server berjalan di http://localhost:${port}`);
});
