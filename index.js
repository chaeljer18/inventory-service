// INVENTORI MANAGEMENT SERVICE KANTIN ITB
// MICHAEL JEREMI B S - NIM 18221136
// TST K02

const express = require('express');
const cors = require('cors');
const app = express();

// Middleware 
app.use(cors());
app.use(express.json());

// DATABASE SEADANYA
let inventory = [
    { id: 1, name: "Onigiri", price: 15000, stock: 10 },
    { id: 2, name: "Ayam Bakar Surabaya", price: 20000, stock: 5 },
    { id: 3, name: "Jus Jeruk", price: 5000, stock: 20 },
    { id: 4, name: "Mie Goreng Medan", price: 12000, stock: 8 },
    { id: 5, name: "Sate Halal", price: 15000, stock: 5 },
    { id: 6, name: "Roti Bakar Ovomaltine", price: 10000, stock: 15 },
    { id: 7, name: "Nasi Goreng Sosis", price: 12000, stock: 7 },
    { id: 8, name: "Bakso Malang", price: 8000, stock: 10 },
    { id: 9, name: "Es Teh Matcha", price: 7000, stock: 12 },
    { id: 10, name: "Kopi Susu", price: 10000, stock: 18 },
    { id: 11, name: "Pisang Cokelat", price: 5000, stock: 25 },
    { id: 12, name: "Aqua 600ml", price: 3000, stock: 30 }
];

// Rute

// 1. Lihat Semua Menu
app.get('/items', (req, res) => {
    res.json({
        status: "success",
        data: inventory
    });
});

// 2. Menambah Menu Baru
app.post('/items', (req, res) => {
    const { name, price, stock } = req.body;
    if (!name || !price || !stock) {
        return res.status(400).json({ 
            status: "error", 
            message: "Mohon lengkapi name, price, dan stock" 
        });
    }

    const newId = inventory.length > 0 
        ? Math.max(...inventory.map(item => item.id)) + 1 
        : 1;

    const newItem = {
        id: newId,
        name: name,
        price: Number(price), 
        stock: Number(stock)  
    };

    // Simpen ke database seadanya
    inventory.push(newItem);
    console.log(`[Inventory] Menu baru ditambahkan: ${name}`);

    res.status(201).json({
        status: "success",
        message: "Menu telah berhasil ditambahkan!",
        data: newItem
    });
});

// 3. Kurangi Stok (Akan dipanggil oleh ORDER API)
app.post('/deduct', (req, res) => {
    const { id, quantity } = req.body;
    const item = inventory.find(i => i.id === id);

    if (!item) {
        return res.status(404).json({ 
            status: "error", 
            message: `Produk dengan ID ${id} tidak ditemukan` 
        });
    }
    // Cek stok
    if (item.stock < quantity) {
        return res.status(400).json({ 
            status: "error", 
            message: `Stok tidak cukup! Sisa stok sekarang: ${item.stock}` 
        });
    }
    // Kurangi stok
    item.stock -= quantity;

    console.log(`[Inventory] Stok ${item.name} berkurang ${quantity}. Sisa: ${item.stock}`);

    res.json({
        status: "success",
        message: "Stok telah berhasil dikurangi",
        data: item
    });
});

// 4. Update Menu 
app.put('/items/:id', (req, res) => {
    const { id } = req.params;
    const { name, price, stock } = req.body;

    const itemIndex = inventory.findIndex(i => i.id == id);

    if (itemIndex === -1) {
        return res.status(404).json({ 
            status: "error", 
            message: `Menu dengan ID ${id} tidak ditemukan` 
        });
    }
    if (name) inventory[itemIndex].name = name;
    if (price) inventory[itemIndex].price = Number(price);
    if (stock !== undefined) inventory[itemIndex].stock = Number(stock);

    console.log(`[Inventory] Menu ID ${id} telah berhasil diupdate.`);
    res.json({
        status: "success",
        message: "Menu telah berhasil diperbarui",
        data: inventory[itemIndex]
    });
});

// 5. Hapus Menu
app.delete('/items/:id', (req, res) => {
    const { id } = req.params;
    const itemIndex = inventory.findIndex(i => i.id == id);

    if (itemIndex === -1) {
        return res.status(404).json({ 
            status: "error", 
            message: `Menu dengan ID ${id} tidak ditemukan` 
        });
    }
    const deletedItem = inventory.splice(itemIndex, 1); 
    console.log(`[Inventory] Menu ID ${id} berhasil dihapus.`);
    res.json({
        status: "success",
        message: "Menu telah berhasil dihapus",
        data: deletedItem[0]
    });
});

// 6. Restock Menu
app.patch('/items/:id/restock', (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;
    const item = inventory.find(i => i.id == id);

    if (!item) {
        return res.status(404).json({ 
            status: "error", 
            message: `Menu dengan ID ${id} tidak ditemukan` 
        });
    }
    if (!quantity || quantity <= 0) {
        return res.status(400).json({ 
            status: "error", 
            message: "Jumlah restock harus lebih dari nol" 
        });
    }

    item.stock += Number(quantity);
    console.log(`[Inventory] Restock ${item.name} sebanyak ${quantity}. Total: ${item.stock}`);
    res.json({
        status: "success",
        message: "Stok berhasil ditambahkan",
        data: item
    });
});

// 7. Run Server
const PORT = process.env.PORT || 9697;
app.listen(PORT, () => {
    console.log(`Inventory Service berjalan di http://localhost:${PORT}`);
});