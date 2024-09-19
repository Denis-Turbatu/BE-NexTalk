const Message = require('../models/message');

// Creazione di un nuovo messaggio
exports.createMessage = async (req, res) => {
    const { chatId, senderId, receiverId, message } = req.body; // Estraggo i dati dal corpo della richiesta
    const newMessage = new Message({ chatId, senderId, receiverId, message }); // Creo un nuovo messaggio
    await newMessage.save();
    res.status(201).json(newMessage);
};

// Recupero di tutti i messaggi tra due utenti
exports.getMessagesBetweenUsers = async (req, res) => {
    const messages = await Message.find({
        $or: [
            { senderId: req.params.userId1, receiverId: req.params.userId2 },
            { senderId: req.params.userId2, receiverId: req.params.userId1 }
        ]
    });
    res.status(200).json(messages);
};

// Aggiornamento di un messaggio
exports.updateMessage = async (req, res) => {
    const updatedMessage = await Message.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedMessage) return res.status(404).send('Messaggio non trovato'); // Controllo se il messaggio esiste
    res.status(200).json(updatedMessage);
};

// Cancellazione di un messaggio
exports.deleteMessage = async (req, res) => {
    const deletedMessage = await Message.findByIdAndDelete(req.params.id);
    if (!deletedMessage) return res.status(404).send('Messaggio non trovato'); // Controllo se il messaggio esiste
    res.status(204).send();
};
