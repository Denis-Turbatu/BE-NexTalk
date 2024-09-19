const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

// Creazione di un nuovo messaggio
router.post('/', messageController.createMessage);

// Recupero di tutti i messaggi tra due utenti
router.get('/:userId1/:userId2', messageController.getMessagesBetweenUsers);

// Aggiornamento di un messaggio
router.put('/:id', messageController.updateMessage);

// Cancellazione di un messaggio
router.delete('/:id', messageController.deleteMessage);

module.exports = router;
