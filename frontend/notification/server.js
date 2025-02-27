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

  // Joindre une salle spécifique pour chaque police
  socket.on('joinPoliceRoom', (policeId) => {
    socket.join(policeId);
  });
});

// Endpoint pour envoyer une notification lors d'une nouvelle infraction
app.post('/send-notification', (req, res) => {
  const notification = req.body;
  io.emit('newNotification', notification); // Diffuser à tous les clients
  res.status(200).json({ message: 'Notification envoyée' });
});

// Endpoint pour envoyer une notification à une police spécifique
app.post('/send-notification-to-police', (req, res) => {
  const { police_id, message, conducteur, plaque, vitesse, date, heure } = req.body;
  const notification = { message, conducteur, plaque, vitesse, date, heure };

  // Envoyer la notification aux agents de la police spécifique
  io.to(police_id).emit('newNotification', notification);

  res.status(200).json({ message: 'Notification envoyée à la police' });
});


const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Serveur en écoute sur le port ${PORT}`);
});
