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

app.use(cors());
app.use(express.json());
app.use(express.static('public'));


app.get('/api/employees', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM employee ORDER BY 2;');
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


app.listen(PORT, () => {
    console.log(`Сервер: http://localhost:${PORT}`);
});