const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, '/')));

// CONEXIÓN A BASE DE DATOS (Configuración Interna de Railway)
const db = mysql.createPool({
    host: 'mysql.railway.internal',
    user: 'root',
    password: 'bAfFDUKvFhJjCvUiXsXyhYtYmyvCOmpX',
    database: 'railway',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// --- RUTA DE REGISTRO ---
app.post('/api/trpc/registration.register', (req, res) => {
    if (!req.body.json) {
        return res.status(400).json({ error: { message: "Datos no recibidos correctamente" } });
    }

    // El HTML envía: regUser, regEmail, regPass
    const { regUser, regEmail, regPass } = req.body.json;
    const query = "INSERT INTO usuarios (username, email, password) VALUES (?, ?, ?)";
    
    db.query(query, [regUser, regEmail, regPass], (err, result) => {
        if (err) {
            console.error("Error en DB:", err);
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ error: { data: { code: 'CONFLICT' } } });
            }
            return res.status(500).json({ error: { message: "Error al registrar en la base de datos" } });
        }
        res.json({ result: { data: { success: true } } });
    });
});

// --- RUTA DE LOGIN ---
app.post('/api/trpc/login', (req, res) => {
    if (!req.body.json) {
        return res.status(400).json({ error: { message: "Datos no recibidos" } });
    }

    // IMPORTANTE: El HTML envía loginEmail y loginPass
    const { loginEmail, loginPass } = req.body.json;
    const query = "SELECT username, email FROM usuarios WHERE email = ? AND password = ?";
    
    db.query(query, [loginEmail, loginPass], (err, result) => {
        if (err) {
            console.error("Error en Login:", err);
            return res.status(500).json({ error: { message: "Error en el servidor" } });
        }
        
        if (result.length > 0) {
            // Login exitoso: Devolvemos el usuario para el localStorage del HTML
            res.json({ result: { data: { success: true, user: result[0] } } });
        } else {
            res.status(401).json({ error: { message: "Correo o contraseña incorrectos" } });
        }
    });
});

// Configuración del Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor funcionando en puerto ${PORT}`);
    console.log(`📡 Conectado a la base de datos interna de Railway`);
});

module.exports = app;