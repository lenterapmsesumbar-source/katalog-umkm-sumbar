
import { useEffect, useState } from 'react'
import { Search, MapPin, ShoppingBag, Store } from 'lucide-react'
import { supabase } from './lib/supabase'

export default function App() {
  const [kategori, setKategori] = useState([])
  const [daerah, setDaerah] = useState([])
  const [produk, setProduk] = useState([])
  const [pencarian, setPencarian] = useState('')
  const [kategoriDipilih, setKategoriDipilih] = useState('')
  const [daerahDipilih, setDaerahDipilih] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function muatData() {
      const [hasilKategori, hasilDaerah, hasilProduk] =
        await Promise.all([
          supabase.from('kategori').select('*').order('nama_kategori'),
          supabase.from('kabupaten_kota').select('*').order('nama'),
          supabase
            .from('produk')
            .select('*, kategori(nama_kategori), umkm!inner(nama_umkm, status_verifikasi, kabupaten_kota_id, kabupaten_kota(id,nama))')
            .eq('status', 'Aktif')
            .eq('umkm.status_verifikasi', 'terverifikasi')
            .order('created_at', { ascending: false })
        ])

      if (!hasilKategori.error) setKategori(hasilKategori.data || [])
      if (!hasilDaerah.error) setDaerah(hasilDaerah.data || [])
      if (!hasilProduk.error) setProduk(hasilProduk.data || [])

      setLoading(false)
    }

    muatData()
  }, [])

  const produkTampil = produk.filter((item) => {
    const cocokNama = item.nama_produk
      .toLowerCase()
      .includes(pencarian.toLowerCase())

    const cocokKategori =
      !kategoriDipilih || String(item.kategori_id) === kategoriDipilih

    const cocokDaerah =
      !daerahDipilih ||
      String(item.umkm?.kabupaten_kota?.id) === daerahDipilih ||
      String(item.umkm?.kabupaten_kota_id) === daerahDipilih

    return cocokNama && cocokKategori && cocokDaerah
  })

  return (
    <div className="app">
      <header className="navbar">
        <a className="brand" href="#">
          <div className="brand-icon"><Store size={25} /></div>
          <div>
            <strong>KATALOG UMKM SUMBAR</strong>
            <small>Produk Unggulan Sumatera Barat</small>
          </div>
        </a>
        <span className="nav-label">Jelajahi Produk UMKM</span>
      </header>

      <main>
        <section className="hero">
          <div className="hero-content">
            <span className="eyebrow">BANGGA PRODUK LOKAL</span>
            <h1>Temukan Produk Unggulan UMKM Sumatera Barat</h1>
            <p>
              Jelajahi beragam produk terbaik dari pelaku UMKM
              di 19 kabupaten dan kota di Sumatera Barat.
            </p>
            <a href="#katalog" className="hero-button">
              <ShoppingBag size={18} /> Jelajahi Katalog
            </a>
          </div>
        </section>

        <section className="catalog" id="katalog">
          <div className="section-heading">
            <div>
              <span className="eyebrow">KATALOG PRODUK</span>
              <h2>Jelajahi Produk UMKM</h2>
              <p>Temukan produk lokal sesuai kebutuhan Anda.</p>
            </div>
          </div>

          <div className="filters">
            <div className="search-box">
              <Search size={19} />
              <input
                value={pencarian}
                onChange={(e) => setPencarian(e.target.value)}
                placeholder="Cari nama produk..."
              />
            </div>

            <select
              value={kategoriDipilih}
              onChange={(e) => setKategoriDipilih(e.target.value)}
            >
              <option value="">Semua Kategori</option>
              {kategori.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nama_kategori}
                </option>
              ))}
            </select>

            <select
              value={daerahDipilih}
              onChange={(e) => setDaerahDipilih(e.target.value)}
            >
              <option value="">Semua Kabupaten/Kota</option>
              {daerah.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nama}
                </option>
              ))}
            </select>
          </div>

          <div className="result-heading">
            <h3>Produk Pilihan</h3>
            <span>{produkTampil.length} produk</span>
          </div>

          {loading ? (
            <div className="empty-state">Memuat katalog produk...</div>
          ) : produkTampil.length === 0 ? (
            <div className="empty-state">
              <ShoppingBag size={38} />
              <h3>Produk belum tersedia</h3>
              <p>
                Produk UMKM yang sudah terverifikasi dan aktif
                akan ditampilkan di halaman ini.
              </p>
            </div>
          ) : (
            <div className="product-grid">
              {produkTampil.map((item) => (
                <article className="product-card" key={item.id}>
                  <div className="product-image">
                    {item.link_foto ? (
                      <img src={item.link_foto} alt={item.nama_produk} />
                    ) : (
                      <ShoppingBag size={38} />
                    )}
                  </div>
                  <div className="product-info">
                    <small>{item.kategori?.nama_kategori}</small>
                    <h3>{item.nama_produk}</h3>
                    <p>{item.umkm?.nama_umkm}</p>
                    <strong>
                      Rp {Number(item.harga).toLocaleString('id-ID')}
                    </strong>
                    <span className="location">
                      <MapPin size={14} />
                      {item.umkm?.kabupaten_kota?.nama || 'Sumatera Barat'}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer>
        <strong>Katalog UMKM Sumatera Barat</strong>
        <p>Mendukung UMKM, Menggerakkan Ekonomi Daerah.</p>
      </footer>
    </div>
  )
}
