const express = require('express');
const router = express.Router();
const friendshipController = require('../controllers/friendshipController');
const User = require('../models/user');
const Friendship = require('../models/friendship');

// Invia una richiesta di amicizia
router.post('/request', friendshipController.sendFriendRequest);

// Recupera le richieste di amicizia
router.get('/requests/:userId', friendshipController.getFriendRequests);

// Accetta una richiesta di amicizia
router.put('/accept/:friendshipId', friendshipController.acceptFriendRequest);

// Rifiuta una richiesta di amicizia
router.put('/decline/:friendshipId', friendshipController.declineFriendRequest);

// Recupera gli amici confermati
router.get('/friends/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const friendships = await Friendship.find({
            $or: [
                { requesterId: userId, status: 'accepted' },
                { recipientId: userId, status: 'accepted' }
            ]
        }).populate('requesterId recipientId', 'username nickname');

        const friends = friendships.map(friendship => {
            const friend = friendship.requesterId._id.toString() === userId 
                ? friendship.recipientId 
                : friendship.requesterId;
            return {
                id: friend._id,
                username: friend.username,
                nickname: friend.nickname
            };
        });

        res.json(friends);
    } catch (error) {
        console.error('Errore nel recupero degli amici:', error);
        res.status(500).json({ error: 'Errore nel recupero degli amici' });
    }
});

// Accetta una richiesta di amicizia con log dettagliati
router.post('/accept-friend-request', async (req, res) => {
    try {
        const { requestId } = req.body;
        const userId = req.user.id;

        console.log(`Accettazione richiesta di amicizia: ${requestId} per l'utente ${userId}`);

        // Logica per accettare la richiesta di amicizia
        // ...

        console.log('Amicizia accettata, aggiornamento database...');

        // Aggiornamento del database
        // ...

        console.log('Database aggiornato con successo');

        res.status(200).json({ message: 'Richiesta di amicizia accettata' });
    } catch (error) {
        console.error('Errore nell\'accettazione della richiesta di amicizia:', error);
        res.status(500).json({ message: 'Errore del server' });
    }
});

// Recupera gli amici con log dettagliati
router.get('/friends', async (req, res) => {
    try {
        const userId = req.user.id;
        console.log(`Recupero amici per l'utente ${userId}`);

        // Query per recuperare gli amici
        const friends = await User.find({ /* query appropriata */ });

        console.log(`Amici recuperati: ${friends.length}`);
        console.log('Lista amici:', friends.map(f => f.username));

        res.status(200).json(friends);
    } catch (error) {
        console.error('Errore nel recupero degli amici:', error);
        res.status(500).json({ message: 'Errore del server' });
    }
});

console.log("Rotte di amicizia caricate");

module.exports = router;
