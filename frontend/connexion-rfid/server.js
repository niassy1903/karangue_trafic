const express = require('express');
const cors = require('cors');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const port = 3002;

app.use(cors());
app.use(express.json());

// Déclaration anticipée
let arduinoPort;
let parser;

// Variable pour stocker l'UID RFID
let rfidUID = '';

// Liste des clients connectés via SSE
let sseClients = [];

// Créer le serveur HTTP pour Express et WebSocket
const server = http.createServer(app);

// Créer le serveur WebSocket
const wss = new WebSocket.Server({ server });


// Gérer les connexions WebSocket
wss.on('connection', (ws) => {
  console.log('Nouvelle connexion WebSocket');
  ws.send(JSON.stringify({ message: 'Connexion WebSocket établie' }));

  ws.on('message', (message) => {
    console.log('Message reçu du client :', message.toString());
  });

  ws.on('close', () => {
    console.log('Connexion WebSocket fermée');
  });
});

// Connexion au port série avec gestion d'erreur
try {
  arduinoPort = new SerialPort({ path: '/dev/ttyUSB0', baudRate: 9600 });
  parser = arduinoPort.pipe(new ReadlineParser({ delimiter: '\n' }));

  arduinoPort.on('open', () => {
    console.log('Port série ouvert : /dev/ttyUSB0');
  });

  arduinoPort.on('error', (err) => {
    console.error('Erreur du port série :', err.message);
  });

  parser.on('data', (data) => {
    rfidUID = data.trim();
    console.log('UID reçu :', rfidUID);

    // Envoyer l'UID à tous les clients SSE
    sseClients.forEach((client) => {
      client.res.write(`data: ${JSON.stringify({ uid: rfidUID })}\n\n`);
    });

    // Envoyer l'UID à tous les clients WebSocket
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ uid: rfidUID }));
      }
    });
  });

} catch (err) {
  console.error('Erreur de connexion au port série :', err.message);
}

// Route SSE pour la connexion des clients
app.get('/sse', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const clientId = Date.now();
  const newClient = { id: clientId, res };
  sseClients.push(newClient);

  res.write(`data: ${JSON.stringify({ message: 'Connexion SSE établie' })}\n\n`);

  req.on('close', () => {
    console.log(`Client SSE ${clientId} déconnecté`);
    sseClients = sseClients.filter((client) => client.id !== clientId);
  });
});

// Démarrer le serveur HTTP
server.listen(port, () => {
  console.log(`Serveur en écoute sur http://localhost:${port}`);
});
