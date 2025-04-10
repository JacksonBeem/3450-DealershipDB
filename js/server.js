const express = require("express");
const mysql = require("mysql2");
const path = require("path");
const app = express();

app.use(express.json());


// Serve static files
app.use(express.static(path.join(__dirname, "..", "public")));
app.use("/html", express.static(path.join(__dirname, "..", "html")));
app.use("/css", express.static(path.join(__dirname, "..", "css")));
app.use("/js", express.static(path.join(__dirname, "..", "js")));

// MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "YOURPASSWORD",
  database: "dealershipdb",
});




// CARS API
app.get("/api/cars", (req, res) => {
  db.query("SELECT * FROM cars", (err, results) => {
    if (err) return res.status(500).json({ error: "DB query failed" });
    res.json(results);
  });
});

//SALES API
app.get("/api/sales", (req, res) => {
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
      return res.status(500).json({ error: "DB query failed" });
    }
    res.json(results);
  });
});

app.get("/api/sales-total", (req, res) => {
  db.query("SELECT SUM(sale_price) AS total_sale_price FROM sales;", (err, results) => {
    if (err) return res.status(500).json({ error: "DB query failed" });
    res.json(results);
  });
});

app.get("/api/sales-on-customers", (req, res) => {
  db.query(
    `SELECT c.car_make, c.car_model, cu.customer_first_name, cu.customer_last_name
     FROM sales s
     INNER JOIN cars c ON s.car_id = c.car_id
     INNER JOIN customers cu ON s.customer_id = cu.customer_id;`,
    (err, results) => {
      if (err) return res.status(500).json({ error: "DB query failed" });
      res.json(results);
    }
  );
});


//CUSTOMERS API

//inserts new customers
app.post('/api/customers', (req, res) => {
  const { first_name, last_name, email, phone } = req.body;

  const query = `
      INSERT INTO customers (customer_first_name, customer_last_name, customer_email, customer_phone, current_car, current_lease)
      VALUES (?, ?, ?, ?, NULL, NULL)
  `;

  db.query(query, [first_name, last_name, email, phone], (err, results) => {
      if (err) {
          console.error('DB INSERT ERROR:', err);
          return res.status(500).json({ error: 'Insert failed' });
      }
      res.json({ message: 'Customer added successfully', customer_id: results.insertId });
  });
});

//EMPLOYEES API

//all employees
app.get("/api/employees", (req, res) => {
  db.query("SELECT * FROM employees;", (err, results) => {
    if (err) return res.status(500).json({ error: "DB query failed" });
    res.json(results);
  });
});

//selects managers 
app.get("/api/employees-managers", (req, res) => {
  const query = `
    SELECT CONCAT_WS(". ", employee_first_name, LEFT(employee_last_name, 1)) AS manager_name
    FROM employees
    WHERE LOCATE("manager", position) > 0
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: "DB query failed" });
    res.json(results);
  });
});

//sales employees
app.get("/api/employees-sales", (req, res) => {
  console.log("Route /api/employees hit");

  const query = `
      SELECT 
          employee_id, 
          employee_first_name, 
          employee_last_name, 
          position, 
          hourly_rate,
          CONCAT(employee_first_name, ' ', employee_last_name) AS sales_person
      FROM (
          SELECT * FROM employees
          WHERE employee_id IN (10, 11, 12, 13, 14)
      ) AS sale_employee;
  `;

  db.query(query, (err, results) => {
      if (err) {
          console.error("DB query failed:", err);
          return res.status(500).json({ error: "DB query failed" });
      }
      res.json(results);
  });
});

//gives all employees $1 raises
app.get("/api/employees-raise", (req, res) => {
  db.query("UPDATE employees SET hourly_rate = hourly_rate + 1;", (err, results) => {
    if (err) return res.status(500).json({ error: "DB query failed" });
    res.json(results);
  });
});

// Shows employees that sold more than 3 cars
app.get("/api/top-employees", (req, res) => {
  const query = `
    SELECT e.employee_first_name, e.employee_last_name, COUNT(*) AS total_sales
    FROM sales s
    JOIN employees e ON s.employee_id = e.employee_id
    GROUP BY s.employee_id
    HAVING COUNT(*) > 3;
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: "DB query failed" });
    res.json(results);
  });
});

//LEASE API

//all lease data
app.get("/api/leases", (req, res) => {
  db.query("SELECT * FROM leases;", (err, results) => {
    if (err) return res.status(500).json({ error: "DB query failed" });
    res.json(results);
  });
});
//deletes all leases that end on current day
app.delete("/api/leases-end", (req, res) => {
  db.query("DELETE FROM leases WHERE lease_end_date = CURDATE();", (err, results) => {
    if (err) return res.status(500).json({ error: "DB query failed" });
    res.json(results);
  });
});

//shows customers and their leases
app.get("/api/leases-customers", (req, res) => {
  db.query(
    `SELECT cu.customer_first_name, cu.customer_last_name, l.lease_id
     FROM customers cu
     LEFT JOIN leases l ON cu.customer_id = l.customer_id WHERE lease_id IS NOT NULL;`,
    (err, results) => {
      if (err) return res.status(500).json({ error: "DB query failed" });
      res.json(results);
    }
  );
});

// Root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

// Start server
app.listen(3000, () => {
  console.log("🚗 Server running at http://localhost:3000");
});
