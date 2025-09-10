import { useState, useEffect } from "react";

export default function App() {
  const [produk, setProduk] = useState([]);
  const [namaProduk, setNamaProduk] = useState("");
  const [harga, setHarga] = useState("");
  const [stok, setStok] = useState("");

  // GET produk
  const fetchProduk = async () => {
    const res = await fetch("http://localhost:5000/api/produk");
    const data = await res.json();
    setProduk(data);
  };

  useEffect(() => {
    fetchProduk();
  }, []);

  // CREATE produk
  const addProduk = async (e) => {
    e.preventDefault();
    await fetch("http://localhost:5000/api/produk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nama_produk: namaProduk,
        harga: parseFloat(harga),
        stok: parseInt(stok, 10),
      }),
    });
    setNamaProduk("");
    setHarga("");
    setStok("");
    fetchProduk();
  };

  // DELETE produk
  const deleteProduk = async (id) => {
    await fetch(`http://localhost:5000/api/produk/${id}`, {
      method: "DELETE",
    });
    fetchProduk();
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Manajemen Produk</h1>

      {/* Form tambah produk */}
      <form onSubmit={addProduk} style={{ marginBottom: "20px" }}>
        <input
          placeholder="Nama Produk"
          value={namaProduk}
          onChange={(e) => setNamaProduk(e.target.value)}
        />
        <input
          placeholder="Harga"
          type="number"
          value={harga}
          onChange={(e) => setHarga(e.target.value)}
        />
        <input
          placeholder="Stok"
          type="number"
          value={stok}
          onChange={(e) => setStok(e.target.value)}
        />
        <button type="submit">Tambah</button>
      </form>

      {/* List produk */}
      <table border="1" cellPadding="8" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nama</th>
            <th>Harga</th>
            <th>Stok</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {produk.map((p) => (
            <tr key={p.id_produk}>
              <td>{p.id_produk}</td>
              <td>{p.nama_produk}</td>
              <td>{p.harga}</td>
              <td>{p.stok}</td>
              <td>
                <button onClick={() => deleteProduk(p.id_produk)}>
                  Hapus
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
