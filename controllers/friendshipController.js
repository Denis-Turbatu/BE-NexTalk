const Friendship = require('../models/friendship');
const User = require('../models/user');

// Richiesta di amicizia
exports.sendFriendRequest = async (req, res) => {
    const { requesterId, recipientNickname } = req.body;
    console.log("Ricerca utente con nickname:", recipientNickname);

    try {
        const recipient = await User.findOne({ 
            $or: [
                { nickname: recipientNickname },
                { nickname: new RegExp('^' + recipientNickname + '$', 'i') }
            ]
        });
        console.log("Utente trovato:", recipient);

        if (!recipient) {
            return res.status(404).json({ error: "Utente non trovato" });
        }

        const friendship = new Friendship({
            requesterId,
            recipientId: recipient._id
        });

        await friendship.save();
        res.status(201).json({ message: "Richiesta di amicizia inviata" });
    } catch (error) {
        console.error("Errore durante l'invio della richiesta di amicizia:", error);
        res.status(500).json({ error: "Errore del server" });
    }
};

// Accettazione della richiesta di amicizia
exports.acceptFriendRequest = async (req, res) => {
    const { friendshipId } = req.params;

    try {
        const friendship = await Friendship.findByIdAndUpdate(friendshipId, { status: "accepted" }, { new: true });
        if (!friendship) {
            return res.status(404).json({ error: "Richiesta di amicizia non trovata" });
        }
        res.status(200).json({ message: "Richiesta di amicizia accettata" });
    } catch (error) {
        console.error("Errore durante l'accettazione della richiesta di amicizia:", error);
        res.status(500).json({ error: "Errore del server" });
    }
};

// Rifiuto della richiesta di amicizia
exports.declineFriendRequest = async (req, res) => {
    const { friendshipId } = req.params;

    try {
        const friendship = await Friendship.findByIdAndUpdate(friendshipId, { status: "declined" }, { new: true });
        if (!friendship) {
            return res.status(404).json({ error: "Richiesta di amicizia non trovata" });
        }
        res.status(200).json({ message: "Richiesta di amicizia rifiutata" });
    } catch (error) {
        console.error("Errore durante il rifiuto della richiesta di amicizia:", error);
        res.status(500).json({ error: "Errore del server" });
    }
};

// Recupero delle richieste di amicizia
exports.getFriendRequests = async (req, res) => {
    const { userId } = req.params;
    try {
        const requests = await Friendship.find({ recipientId: userId, status: 'pending' })
            .populate('requesterId', 'nickname') // Popola i dati del richiedente
            .lean();

        const formattedRequests = requests.map(request => ({
            id: request._id,
            nickname: request.requesterId.nickname,
            requesterId: request.requesterId._id
        }));

        res.json(formattedRequests);
    } catch (error) {
        console.error('Errore nel recupero delle richieste di amicizia:', error);
        res.status(500).json({ error: 'Errore del server' });
    }
};

// Recupero degli amici confermati
exports.getConfirmedFriends = async (req, res) => {
  const { userId } = req.params;
  try {
    const friendships = await Friendship.find({
      $or: [{ requesterId: userId }, { recipientId: userId }],
      status: 'accepted'
    }).populate('requesterId recipientId', 'nickname slug');

    const friends = friendships.map(friendship => {
      const friend = friendship.requesterId._id.toString() === userId ? friendship.recipientId : friendship.requesterId;
      return {
        id: friend._id,
        nickname: friend.nickname,
        slug: friend.slug
      };
    });

    res.json(friends);
  } catch (error) {
    console.error('Errore nel recupero degli amici:', error);
    res.status(500).json({ error: 'Errore del server' });
  }
};
