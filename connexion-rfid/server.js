const express = require('express');
const cors = require('cors');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const http = require('http'); // Importer le module HTTP
const WebSocket = require('ws'); // Importer la bibliothèque WebSocket

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Configuration du port série (remplace '/dev/ttyUSB0' par le port de ton Arduino)
const arduinoPort = new SerialPort({ path: '/dev/ttyUSB0', baudRate: 9600 });
const parser = arduinoPort.pipe(new ReadlineParser({ delimiter: '\n' }));

// Variable pour stocker l'UID
let rfidUID = '';

// Liste des clients connectés via SSE
let sseClients = [];

// Créer un serveur HTTP pour Express et WebSocket
const server = http.createServer(app);

// Créer un serveur WebSocket
const wss = new WebSocket.Server({ server });

// Gérer les connexions WebSocket
wss.on('connection', (ws) => {
  console.log('Nouvelle connexion WebSocket');

  // Envoyer un message de bienvenue au client
  ws.send(JSON.stringify({ message: 'Connexion WebSocket établie' }));

  // Écouter les messages du client
  ws.on('message', (message) => {
    console.log('Message reçu du client :', message.toString());
  });

  // Gérer la fermeture de la connexion
  ws.on('close', () => {
    console.log('Connexion WebSocket fermée');
  });
});

// Écouter les données du port série
parser.on('data', (data) => {
  rfidUID = data.trim(); // Supprime les espaces et sauts de ligne
  console.log('UID reçu :', rfidUID);

  // Envoyer l'UID à tous les clients SSE connectés
  sseClients.forEach((client) => {
    client.res.write(`data: ${JSON.stringify({ uid: rfidUID })}\n\n`);
  });

  // Envoyer l'UID à tous les clients WebSocket connectés
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ uid: rfidUID }));
    }
  });
});

// Route pour établir une connexion SSE
app.get('/sse', (req, res) => {
  // Configurer les en-têtes pour SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Ajouter le client à la liste des clients SSE
  const clientId = Date.now();
  const newClient = {
    id: clientId,
    res,
  };
  sseClients.push(newClient);

  // Envoyer un message initial pour établir la connexion
  res.write(`data: ${JSON.stringify({ message: 'Connexion SSE établie' })}\n\n`);

  // Supprimer le client lorsqu'il se déconnecte
  req.on('close', () => {
    console.log(`Client SSE ${clientId} déconnecté`);
    sseClients = sseClients.filter((client) => client.id !== clientId);
  });
});

// Démarrer le serveur HTTP
server.listen(port, () => {
  console.log(`Serveur en écoute sur http://localhost:${port}`);
});