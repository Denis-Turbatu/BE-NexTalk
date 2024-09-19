const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const generateSlug = require('../utils/slugGenerator');

// Funzione per la registrazione
const registerUser = async (req, res) => {
    const { username, email, password, confirm_password, nickname } = req.body;

    try {
        // Verifica se l'utente esiste già
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ error: 'Username o email già in uso.' });
        }

        // Verifica che le password corrispondano
        if (password !== confirm_password) {
            return res.status(400).json({ error: 'Le password non corrispondono.' });
        }

        // Crea un nuovo utente
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        console.log('Password originale:', password);
        console.log('Password hashata:', hashedPassword);
        const slug = generateSlug(username);
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            nickname,
            slug
        });

        await newUser.save();

        res.status(201).json({ message: 'Utente registrato con successo.' });
    } catch (error) {
        console.error('Errore durante la registrazione:', error);
        res.status(500).json({ error: 'Errore durante la registrazione.', details: error.message });
    }
};

// Rotta per la registrazione
router.post('/register', registerUser);

// Rotta per il login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        console.log(`Tentativo di login per: ${username}`);
        const user = await User.findOne({ username });

        if (!user) {
            console.log('Utente non trovato');
            return res.status(400).json({ error: 'Credenziali non valide.' });
        }

        console.log('Utente trovato, confronto password');
        console.log('Password fornita:', password);
        console.log('Hash memorizzato:', user.password);

        const isMatch = await bcrypt.compare(password, user.password);

        console.log('Risultato del confronto:', isMatch);

        if (!isMatch) {
            console.log('Password non corrisponde');
            return res.status(400).json({ error: 'Credenziali non valide.' });
        }

        console.log('Login riuscito');
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, userId: user._id });
    } catch (error) {
        console.error('Errore durante il login:', error);
        res.status(500).json({ error: 'Errore del server.' });
    }
});

module.exports = router;
