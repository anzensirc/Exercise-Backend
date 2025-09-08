const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

// Import routes
const produkRoutes = require('./routes/produk');
const pelangganRoutes = require('./routes/pelanggan');
const transaksiRoutes = require('./routes/transaksi');

app.use('/produk', produkRoutes);
app.use('/pelanggan', pelangganRoutes);
app.use('/transaksi', transaksiRoutes);

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
