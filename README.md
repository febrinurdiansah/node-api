---

#  Indonesia News API

Indonesia News API adalah API agregator berita Indonesia yang menggabungkan berbagai sumber dari **Public API** dan **RSS Feed** media ternama.
Dibangun menggunakan **Express.js**, API ini memungkinkan pengambilan berita terbaru, trending, hingga berita spesifik berdasarkan kategori atau penerbit secara **real-time**.

---

##  Fitur Utama

* **Multi-Source**
  Menggabungkan berita dari CNBC, CNN, Republika, BBC, ANTARA, VIVA, dan banyak media lainnya.
* **Hybrid Data Source**
  Mengambil data dari API eksternal dan RSS Feed.
* **Auto-Sorting**
  Berita otomatis diurutkan berdasarkan waktu terbaru.
* **CORS Ready**
  Siap digunakan untuk aplikasi **Flutter**, **Web (React/Vue)**, maupun **Mobile App**.

---

##  Instalasi

### 1. Clone Repository

```bash
git clone https://github.com/febrinurdiansah/node-api.git
cd node-api
```

### 2. Install Dependency

```bash
npm install
```

### 3. Konfigurasi Environment

Buat file `.env` di root folder:

```env
PORT=4000
```

### 4. Jalankan API

```bash
npm start
```

API akan berjalan di:

```
http://localhost:4000
```

---

##  Daftar Endpoint API

### 1. Metadata & Publikasi

| Endpoint                | Deskripsi                                                                    |
| ----------------------- | ---------------------------------------------------------------------------- |
| `GET /`                 | Health check (cek apakah API aktif).                                         |
| `GET /publiser`         | Mendapatkan daftar lengkap publisher (API & RSS), ikon, dan kategori.        |
| `GET /kategori/semua`   | Mendapatkan seluruh kategori dari semua sumber.                              |
| `GET /:source/kategori` | Mendapatkan kategori dari satu publisher tertentu (contoh: `/cnn/kategori`). |

---

### 2. Berita Utama (Aggregated)

| Endpoint        | Deskripsi                                                |
| --------------- | -------------------------------------------------------- |
| `GET /terbaru`  | Mengambil berita terbaru dari semua sumber.              |
| `GET /berita`   | Mengambil berita dengan parameter `limit` (default: 20). |
| `GET /trending` | Mengambil berita yang sedang trending.                   |

---

### 3. Berita Spesifik (Filter)

| Endpoint                        | Deskripsi                                                               |
| ------------------------------- | ----------------------------------------------------------------------- |
| `GET /berita/:source`           | Berita dari sumber tertentu (contoh: `/berita/antara`).                 |
| `GET /berita/:source/:kategori` | Berita dari sumber dan kategori tertentu (contoh: `/berita/bbc/dunia`). |
| `GET /kategori/:kategori`       | Berita berdasarkan kategori global (contoh: `/kategori/ekonomi`).       |

---

## Daftar Sumber Berita (Publishers)

### JSON API Sources

* `cnbc`
* `cnn`
* `republika`

### RSS Feed Sources

* `bbc`
* `antara`
* `sindonews`
* `viva`
* `jpnn`
* `fajar`
* `waspada`
* `online24jam`
* `mediaindonesia`
* `kaskus`

---

##  Catatan Penting

* **Connection Timeout**
  API memiliki timeout otomatis (±5–8 detik) untuk menjaga performa jika salah satu sumber berita sedang *down*.
* **Akses dari Mobile / Emulator**

  * Emulator Android:

    ```
    http://10.0.2.2:4000
    ```
  * Perangkat fisik (HP):
    Gunakan IP privat laptop Anda, contoh:

    ```
    http://192.168.1.5:4000
    ```

---
