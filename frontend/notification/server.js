const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
  }
});

app.use(cors());
app.use(express.json());

io.on('connection', (socket) => {
  console.log('Un utilisateur s\'est connecté');

  socket.on('disconnect', () => {
    console.log('Un utilisateur s\'est déconnecté');
  });
});

// Endpoint pour envoyer une notification lors d'une nouvelle infraction
app.post('/send-notification', (req, res) => {
  const notification = req.body;
  io.emit('newNotification', notification); // Diffuser à tous les clients
  res.status(200).json({ message: 'Notification envoyée' });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Serveur en écoute sur le port ${PORT}`);
});
