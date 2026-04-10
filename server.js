const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path'); // Necesario para las rutas de archivos
const app = express();

app.use(cors());
app.use(express.json());

// Servir archivos estáticos (HTML, CSS, JS del frontend)
// Esto hará que index.html y registro.html sean visibles
app.use(express.static(path.join(__dirname, '/')));

const db = mysql.createConnection({
    host: 'mainline.proxy.rlwy.net',
    user: 'root',
    password: 'bAfFDUKvFhJjCvUiXsXyhYtYmyvCOmpX',
    database: 'railway',
    port: 47759
});

// RUTA PARA LA RAÍZ (Para que no salga "Cannot GET /")
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Tu ruta de registro existente
app.post('/api/trpc/registration.register', (req, res) => {
    const { username, email, password } = req.body.json;
    const query = "INSERT INTO usuarios (username, email, password) VALUES (?, ?, ?)";
    
    db.query(query, [username, email, password], (err, result) => {
        if (err) {
            console.error("Error en DB:", err);
            if (err.code === 'ER_DUP_ENTRY') {
                return res.json({ error: { data: { code: 'CONFLICT' } } });
            }
            return res.json({ error: { message: "Error al registrar" } });
        }
        res.json({ result: { data: { success: true } } });
    });
});

// IMPORTANTE PARA VERCEL: Exportar la app
module.exports = app;

// Solo corre el listen si no estamos en Vercel
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Servidor local en http://localhost:${PORT}`);
    });
}