const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  maxHttpBufferSize: 15 * 1024 * 1024 // Autorise l'envoi de fichiers jusqu'à 15MB
});

// Dossier public contenant index.html et admin.html
app.use(express.static(path.join(__dirname, 'public')));

// Route explicite pour l'admin
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

io.on('connection', (socket) => {
  console.log('Nouvelle connexion établie :', socket.id);

  // Lorsqu'un client envoie un message, on l'envoie à tout le monde (notamment l'admin)
  socket.on('clientMessage', (data) => {
    io.emit('clientMessage', data);
  });

  // Lorsqu'un admin envoie un message, on l'envoie à tout le monde (notamment le client)
  socket.on('adminMessage', (data) => {
    io.emit('privateMessage', data);
  });

  socket.on('disconnect', () => {
    console.log('Utilisateur déconnecté :', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
