const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user'); // Assicurati di avere un modello User

const JWT_SECRET = process.env.JWT_SECRET || 'una_chiave_segreta_molto_lunga_e_complessa';

// Funzione per registrare un nuovo utente
const register = async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();
        
        res.status(201).send({ message: 'Utente registrato con successo' });
    } catch (error) {
        res.status(500).send({ error: 'Errore durante la registrazione' });
    }
};

// Funzione per il login
const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).send({ error: 'Credenziali non valide' });
        }

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
        res.send({ token });
    } catch (error) {
        res.status(500).send({ error: 'Errore durante il login' });
    }
};

const authenticate = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ error: "Accesso negato. Token mancante." });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(403).json({ error: "Token non valido." });
    }
};

const generateToken = (user) => {
    const payload = {
        id: user._id,
        username: user.username,
        email: user.email,
    };

    const options = {
        expiresIn: '1h', // Il token scade in 1 ora
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, options);
    return token;
};

module.exports = { register, login, authenticate, generateToken };
