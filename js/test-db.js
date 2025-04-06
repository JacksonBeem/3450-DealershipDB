const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Rangerbuddy1',
    database: 'dealershipdb'
});

db.connect((err) => {
    if (err) {
        console.error('❌ Connection failed:', err.message);
        process.exit(1);
    } else {
        console.log('✅ Connected to MySQL database.');

        db.query('SELECT 1 + 1 AS result', (err, results) => {
            if (err) {
                console.error('❌ Query failed:', err.message);
            } else {
                console.log('🧪 Test query result:', results[0].result);
            }

            db.end();
        });
    }
});
