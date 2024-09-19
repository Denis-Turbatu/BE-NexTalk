const express = require("express");
const router = express.Router();
const { registerUser, getUserBySlug } = require("../controllers/userController");
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Aggiungi questo middleware di logging
router.use((req, res, next) => {
  console.log(`Richiesta ricevuta: ${req.method} ${req.url}`);
  console.log('Body:', req.body);
  next();
});

// Rotta di login
router.post('/login', async (req, res) => {
    console.log('Rotta di login chiamata');
    const { username, password } = req.body;
    console.log('Dati ricevuti:', { username, password });

    if (!username || !password) {
        console.log('Username/email o password mancanti');
        return res.status(400).json({ error: 'Username/email e password sono richiesti.' });
    }

    try {
        console.log('Tentativo di login per:', username);
        const user = await User.findOne({
            $or: [
                { username: username },
                { email: username }
            ]
        });
        if (!user) {
            console.log('Utente non trovato');
            return res.status(400).json({ error: 'Credenziali non valide.' });
        }

        console.log('Utente trovato, confronto password');
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('Password non corrisponde');
            return res.status(400).json({ error: 'Credenziali non valide.' });
        }

        console.log('Password corretta, generazione token');
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            console.error('JWT_SECRET non definito');
            console.log('Valore di process.env.JWT_SECRET:', process.env.JWT_SECRET);
            return res.status(500).json({ error: 'Errore di configurazione del server.' });
        }
        const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: '1h' });
        console.log('Token generato con successo');
        res.json({ token, userId: user._id });
    } catch (error) {
        console.error('Errore del server:', error);
        res.status(500).json({ error: 'Errore del server.' });
    }
});

router.post("/registrazione", registerUser);
router.get("/users/:slug", getUserBySlug);

// Rotta di test
router.get('/test', (req, res) => {
  res.json({ message: 'Rotta di test funzionante' });
});

module.exports = router;
