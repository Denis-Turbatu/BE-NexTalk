const fs = require('fs');
const crypto = require('crypto');
require('dotenv').config();

const generateSecret = () => {
    const secret = crypto.randomBytes(64).toString('hex');
    const envContent = `JWT_SECRET=${secret}\n`;

    // Controlla se il file .env esiste già
    if (fs.existsSync('.env')) {
        // Aggiungi o aggiorna la chiave JWT_SECRET
        const envFile = fs.readFileSync('.env', 'utf8');
        if (envFile.includes('JWT_SECRET=')) {
            const updatedEnvFile = envFile.replace(/JWT_SECRET=.*/g, envContent);
            fs.writeFileSync('.env', updatedEnvFile);
        } else {
            fs.appendFileSync('.env', envContent);
        }
    } else {
        // Crea un nuovo file .env
        fs.writeFileSync('.env', envContent);
    }

    console.log('Chiave segreta generata e salvata in .env:', secret);
};

generateSecret();
