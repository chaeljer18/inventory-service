# Inventory Management Microservice

Michael Jeremi B S  
NIM 18221136

Live Deployment

Production URL: https://jer.theokaitou.my.id  
Port: 9697  
GitHub Repository: https://github.com/chaeljer18/inventory-service

Quick Test:

```bash
curl https://jer.theokaitou.my.id/health
curl https://jer.theokaitou.my.id/api/products
```

---

Deskripsi

Microservice untuk mengelola inventaris kantin kampus ITB menggunakan Domain-Driven Design (DDD) dengan Node.js dan Express.js.

Fitur:

- CRUD Produk
- Manajemen Stok (tambah/kurangi)
- Cek Ketersediaan Stok
- Alert Stok Rendah
- History Restock
- Laporan Summary
- Batch Operations untuk Order Service

---

Cara Menjalankan Lokal

1. Clone Repository

```bash
git clone https://github.com/YOUR-USERNAME/inventory-service.git
cd inventory-service
```

2. Install Dependencies

```bash
npm install
```

3. Setup Environment

```bash
# Copy .env.example ke .env
cp .env.example .env

# Edit .env jika perlu (default: PORT=9697)
```

4. Jalankan Service

```bash
npm start
```

Service berjalan di: `http://localhost:9697`

5. Test Service

```bash
# Health Check
curl http://localhost:9697/health

# Get All Products
curl http://localhost:9697/api/products
```

Deploy dengan Docker

Build & Run

```bash
# Build image
docker build -t inventory-service .

# Run container
docker run -d -p 9697:9697 --name inventory-management inventory-service

# Check logs
docker logs inventory-management
```

Menggunakan Docker Compose

```bash
# Start
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

---

API Endpoints

Base URL: `https://jer.theokaitou.my.id` (Production)  
Base URL: `http://localhost:9697` (Local)

Products

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

Stock Management

- `POST /api/products/:id/restock` - Add stock
- `POST /api/products/:id/reduce` - Reduce stock
- `POST /api/products/:id/check-availability` - Check availability

Batch Operations (buat Order Service)

- `POST /api/products/batch/check-availability` - Batch check
- `POST /api/products/batch/reduce` - Batch reduce

Alerts & Reports

- `GET /api/alerts/low-stock` - Low stock alert
- `GET /api/alerts/expiry` - Expiry alert
- `GET /api/summary` - Inventory summary
- `GET /api/restock-history` - Restock history

---

Integrasi dengan Order Service

Check Availability

```bash
POST https://jer.theokaitou.my.id/api/products/batch/check-availability
Content-Type: application/json

{
  "items": [
    { "productId": "P001", "quantity": 2 },
    { "productId": "P003", "quantity": 5 }
  ]
}
```

Reduce Stock

```bash
POST https://jer.theokaitou.my.id/api/products/batch/reduce
Content-Type: application/json

{
  "items": [
    { "productId": "P001", "quantity": 2 }
  ],
  "reason": "Order #12345"
}
```

Testing Examples

- Health Check

```bash
curl https://jer.theokaitou.my.id/health
```

- Get All Products

```bash
curl https://jer.theokaitou.my.id/api/products
```

- Create New Product

```bash
curl -X POST https://jer.theokaitou.my.id/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bakso",
    "category": "Makanan Berat",
    "price": 13000,
    "stock": 15,
    "minStock": 5
  }'
```

- Check Stock Availability

```bash
curl -X POST https://jer.theokaitou.my.id/api/products/P001/check-availability \
  -H "Content-Type: application/json" \
  -d '{"quantity": 5}'
```

- Restock Product

```bash
curl -X POST https://jer.theokaitou.my.id/api/products/P001/restock \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 10,
    "reason": "Daily restock",
    "performedBy": "Admin"
  }'
```

Environment Variables

| Variable   | Default    | Description      |
| ---------- | ---------- | ---------------- |
| `PORT`     | 9697       | Server port      |
| `NODE_ENV` | production | Environment mode |

---

Performance

- Memory Usage: ~15-20 MB
- Disk Space: ~3 MB (with node_modules)
- Response Time: < 50ms (average)
- Concurrent Requests: 100+ supported

---

Troubleshooting

Port already in use

```bash
# Check what's using port 9697
lsof -i :9697

# Kill the process
kill -9 <PID>
```

Docker container not starting

```bash
# Check logs
docker logs inventory-management

# Restart container
docker restart inventory-management
```

Cannot connect to service

```bash
# Check if container is running
docker ps

# Check if port is listening
netstat -tlnp | grep 9697
```
