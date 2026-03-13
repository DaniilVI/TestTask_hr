const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;


const pool = new Pool({
    user: 'admin',
    host: 'localhost', 
    database: 'employee_db',
    password: 'admin',
    port: 5432
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/employees', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM employee ORDER BY "name";');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка с БД' });
    }
});

app.patch('/api/employees/:id/toggle-status', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            'UPDATE employee SET is_active = NOT is_active WHERE id = $1', 
            [id]
        );
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка с БД' });
    }
});

app.put('/api/employees/:id', async (req, res) => {
    const { id } = req.params;
    const { name, birth_date, passport, phone, address, department, position, salary, hire_date } = req.body;
    try {
        await pool.query(`
            UPDATE employee 
            SET name = $1, birth_date = $2, passport = $3, phone = $4, 
                address = $5, department = $6, position = $7, salary = $8, hire_date = $9 
            WHERE id = $10
        `, [name, birth_date, passport, phone, address, department, position, salary, hire_date, id]);
        
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка с БД' });
    }
});

app.post('/api/new-employee', async (req, res) => {
    const { name, birth_date, passport, phone, address, department, position, salary, hire_date } = req.body;
    try {
        await pool.query(`
            INSERT INTO employee (name, birth_date, passport, phone, address, department, position, salary, hire_date) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [name, birth_date, passport, phone, address, department, position, salary, hire_date]);
        
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка с БД' });
    }
});

app.use(express.static('public'));

app.listen(PORT, () => {
    console.log(`Сервер: http://localhost:${PORT}`);
});