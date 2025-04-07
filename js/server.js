const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const app = express();

// Serve static files
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/html', express.static(path.join(__dirname, '..', 'html')));
app.use('/css', express.static(path.join(__dirname, '..', 'css')));
app.use('/js', express.static(path.join(__dirname, '..', 'js')));

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'YOURPASSWORD',
    database: 'dealershipdb'
});

db.connect((err) => {
    if (err) {
        console.error('❌ DB connection failed:', err.message);
        process.exit(1);
    } else {
        console.log('✅ Connected to MySQL');
    }
});


// CARS API
app.get('/api/cars', (req, res) => {
    db.query('SELECT * FROM cars', (err, results) => {
        if (err) return res.status(500).json({ error: 'DB query failed' });
        res.json(results);
    });
});

//SALES API
app.get('/api/sales', (req, res) => {
    const query = `
        SELECT 
            sale_id,
            car_id,
            customer_id,
            sale_price,
            sale_date,
            employee_id,
            ROUND(sale_price * 1.07, 2) AS sale_plus_tax,
            DATEDIFF(CURDATE(), sale_date) AS time_since_sale
        FROM sales;
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("❌ DB query failed:", err);
            return res.status(500).json({ error: 'DB query failed' });
        }
        res.json(results);
    });
});

//CUSTOMERS API

app.get('/api/customers', (req, res) => {
    db.query('', (err, results) => {
        if (err) return res.status(500).json({ error: 'DB query failed' });
        res.json(results);
    });
});

//EMPLOYEES API

app.get('/api/epmployees', (req, res) => {
    db.query('', (err, results) => {
        if (err) return res.status(500).json({ error: 'DB query failed' });
        res.json(results);
    });
});

//LEASE API

app.get('/api/leases', (req, res) => {
    db.query('SELECT * FROM cars', (err, results) => {
        if (err) return res.status(500).json({ error: 'DB query failed' });
        res.json(results);
    });
});


// Root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Start server
app.listen(3000, () => {
    console.log('🚗 Server running at http://localhost:3000');
});

