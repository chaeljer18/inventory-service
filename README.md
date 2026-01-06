---
# Kantin Labtek V Microservices Integration
Aplikasi sistem manajemen kantin kampus berbasis arsitektur Microservices. Aplikasi ini mendemonstrasikan integrasi antara dua layanan backend terpisah (Order & Inventory) dan sebuah Frontend modern berbasis Web.
---

Nama : Michael Jeremi B S  
NIM : 18221136

Production URL: https://jer.theokaitou.my.id/items
Port: 9697  
GitHub Repository: https://github.com/chaeljer18/inventory-service

# Manajemen Inventaris Lengkap (CRUD):

- Melihat daftar menu.
- Menambah menu baru.
- Mengupdate harga/nama menu.
- Menghapus menu.
- Fitur Restock (Menambah stok tanpa mereset data).

# Sistem Pemesanan Terintegrasi:

- Validasi stok real-time (mengurangi stok di Inventory Service saat pesanan dibuat).
- Menolak pesanan jika stok tidak cukup atau ID salah.
- Menyimpan riwayat transaksi (Order History).

- Frontend: Berjalan di browser, bertugas menampilkan UI dan mengirim request HTTP.
- Order Service: Mengatur logika pemesanan, menghubungkan user dengan inventory.
- Inventory Service: Menyimpan data menu, mengelola stok, dan validasi ID.

# Tech Stack

- Backend: Node.js, Express.js, Axios, CORS, Dotenv.
- Frontend: HTML5, CSS3 (Modern UI), Vanilla JS.
- Deployment: Localhost

---

# Struktur Project

---

```text
canteen-system/
│
├── inventory-service/          # Layanan 1: Pengelola Stok
│   ├── node_modules/
│   ├── .env                     # Konfigurasi PORT=9697
│   └── index.js                 # Kode Server Inventory
│
├── order-service/               # Layanan 2: Pengelola Pesanan
│   ├── node_modules/
│   ├── .env                     # Konfigurasi PORT=9698 & URL Inventory
│   └── index.js                 # Kode Server Order
│
└── frontend/                    # Antarmuka Web
    ├── index.html
    ├── style.css
    └── script.js

```

---

# Prasyarat

---

- Node.js (Versi 14 atau lebih disarankan). Download di sini.
- Web Browser modern (Google Chrome/Edge/Firefox).

---

# Cara Menjalankan API INVENTORY dan ORDER

---

1. INSTALL API
   Buka terminal, masuk ke masing-masing folder service dan jalankan perintah install:

# Masuk ke folder Inventory Service

cd inventory-service
npm install express cors
cd ..

2. RUN API INVENTORY SERVICE

- Buka sebuah terminal
- cd ke folder inventory
- jalankan node index.js
  Seharusnya muncul pesan : Inventory Service berjalan di http://localhost:9697

# MANUAL TEST

---

# Melihat Semua Menu (GET /items)

curl http://localhost:9697/items

# Menambah Menu Baru (POST /items)

curl -X POST http://localhost:9697/items -H "Content-Type: application/json" -d "{\"name\": \"Es Teh Anget\", \"price\": 15000, \"stock\": 20}"

# Update Harga/Info Menu (PUT /items/:id)

curl -X PUT http://localhost:9697/items/1 -H "Content-Type: application/json" -d "{\"price\": 25000}"

# Restock / Tambah Stok (PATCH /items/:id/restock)

curl -X PATCH http://localhost:9697/items/3/restock -H "Content-Type: application/json" -d "{\"quantity\": 50}"

# Hapus Menu (DELETE /items/:id)

curl -X DELETE http://localhost:9697/items/12
