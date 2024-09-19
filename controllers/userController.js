const crypto = require("crypto");
const User = require("../models/user");
const bcrypt = require("bcrypt");

// Funzione per generare uno slug univoco
const generateUniqueSlug = async () => {
    const uniqueIdentifier = crypto.randomBytes(3).toString("hex"); // Genera un identificatore unico
    let uniqueSlug = `user-${uniqueIdentifier}`; // Usa "user" e l'identificatore unico
    let exists = await User.findOne({ slug: uniqueSlug });

    // Aggiungi un numero al slug se non è unico
    while (exists) {
        const newIdentifier = crypto.randomBytes(3).toString("hex");
        uniqueSlug = `user-${newIdentifier}`;
        exists = await User.findOne({ slug: uniqueSlug });
    }

    return uniqueSlug;
};

const registerUser = async (req, res) => {
    const { username, email, password, nickname } = req.body; // Aggiunto nickname

    // Controllo se il nickname è fornito
    if (!nickname) {
        return res.status(400).json({ error: "Il nickname è obbligatorio." });
    }

    function containSpecialChar(password) {
        // Definizione della regex per i caratteri speciali
        const regex = /[!@#$%^&*(),.?":{}|<>]/g;

        // Verifica se la password contiene almeno un carattere speciale
        return regex.test(password);
    }

    if (!containSpecialChar(password)) {
        // Se la password non contiene caratteri speciali, invia una risposta di errore
        return res.status(400).json({
            error: "La password deve contenere almeno un carattere speciale."
        });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        // Genera uno slug unico basato sul nome utente
        const slug = await generateUniqueSlug(username);

        const newUser = new User({
            username,
            email,
            password: hashPassword,
            slug,
            nickname // Aggiunto nickname al documento utente
        });

        await newUser.save();
        res.status(201).json({ message: "Utente registrato con successo", slug });
    } catch (error) {
        console.error("Errore durante la registrazione:", error);
        res.status(500).json({ error: "Errore del server" });
    }
};

const loginUser = async (req, res) => {
    const { identifier, password } = req.body;

    try {
        // Cerca l'utente usando l'identifier (può essere username o email)
        const user = await User.findOne({
            $or: [{ username: identifier }, { email: identifier }]
        });

        if (!user) {
            return res.status(400).json({ error: "Credenziali non valide" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: "Credenziali non valide" });
        }

        res.status(200).json({ 
            message: "Login effettuato con successo", 
            userId: user._id,  // Aggiungiamo l'ID dell'utente
            slug: user.slug 
        });
    } catch (error) {
        console.error("Errore durante il login:", error);
        res.status(500).json({ error: "Errore del server" });
    }
};

const getUserBySlug = async (req, res) => {
    const { slug } = req.params;
    try {
        const user = await User.findOne({ slug });
        if (!user) {
            return res.status(404).json({ error: 'Utente non trovato' });
        }
        res.json(user);
    } catch (error) {
        console.error('Errore nel recupero dell\'utente:', error);
        res.status(500).json({ error: 'Errore del server' });
    }
};

module.exports = { registerUser, loginUser, getUserBySlug };
