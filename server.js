require('dotenv').config();

const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const { connectToDb } = require("./database.js"); // Importa la connessione al DB
const userRoutes = require("./routes/userRoutes"); // Importa le rotte utente
const friendshipRoutes = require("./routes/friendshipRoutes"); // Importa le rotte amicizia
const messageRoutes = require("./routes/messageRoutes"); // Importa le rotte messaggi
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');

// Aggiungi questa linea per importare il modello user
require('./models/user');
require('./models/friendship');

const app = express();

// Middleware per il parsing del JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());  // Configura il CORS

// Connetti al database
connectToDb();

// Usa le rotte
app.use("/auth", userRoutes); // Assicurati che la rotta sia corretta
app.use("/friendship", friendshipRoutes);
app.use("/messages", messageRoutes);
app.use('/auth', authRoutes);

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000", // Assicurati che questo sia l'URL del tuo frontend
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("Un client si è connesso");

  socket.on("join", (userId) => {
    console.log(`Utente ${userId} si è unito`);
    socket.join(userId);
  });

  socket.on("sendMessage", (message) => {
    console.log('Nuovo messaggio ricevuto:', message);
    // Emetti al destinatario
    io.to(message.receiverId).emit("newMessage", message);
    // Emetti anche al mittente
    io.to(message.senderId).emit("newMessage", message);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnesso");
  });
});

server.listen(5000, () => {
  console.log("Server running on port 5000");
});

console.log('JWT_SECRET:', process.env.JWT_SECRET);
console.log('MONGO_URI:', process.env.MONGO_URI);

const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connesso'))
  .catch(err => console.error('Errore di connessione MongoDB:', err));
