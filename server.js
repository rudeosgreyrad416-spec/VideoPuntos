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

// CONEXIÓN A BASE DE DATOS
const db = mysql.createPool({
    host: process.env.MYSQLHOST || 'mysql.railway.internal',
    user: process.env.MYSQLUSER || 'root',
    password: process.env.MYSQLPASSWORD || 'bAfFDUKvFhJjCvUiXsXyhYtYmyvCOmpX',
    database: process.env.MYSQLDATABASE || 'railway',
    port: process.env.MYSQLPORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// --- RUTA DE REGISTRO (Simplificada para tu HTML) ---
app.post('/registro', (req, res) => {
    // El HTML envía: { user, email, pass }
    const { user, email, pass } = req.body;

    if (!user || !email || !pass) {
        return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    const query = "INSERT INTO usuarios (username, email, password) VALUES (?, ?, ?)";
    
    db.query(query, [user, email, pass], (err, result) => {
        if (err) {
            console.error("Error en DB:", err);
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ message: "El usuario o email ya existe" });
            }
            return res.status(500).json({ message: "Error al registrar en la base de datos" });
        }
        res.json({ success: true, message: "Usuario creado correctamente" });
    });
});

// --- RUTA DE LOGIN (Simplificada para tu HTML) ---
app.post('/login', (req, res) => {
    const { email, pass } = req.body;

    if (!email || !pass) {
        return res.status(400).json({ message: "Email y contraseña requeridos" });
    }

    const query = "SELECT username, email FROM usuarios WHERE email = ? AND password = ?";
    
    db.query(query, [email, pass], (err, result) => {
        if (err) {
            console.error("Error en Login:", err);
            return res.status(500).json({ message: "Error en el servidor" });
        }
        
        if (result.length > 0) {
            res.json({ success: true, user: result[0] });
        } else {
            res.status(401).json({ message: "Correo o contraseña incorrectos" });
        }
    });
});

// Configuración del Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor funcionando en puerto ${PORT}`);
});
