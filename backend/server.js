const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'] }
});

app.use(cors());
app.use(helmet());
app.use(express.json());

// Attach `io` to request so controllers can emit
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/appointments', require('./routes/appointments'));

// WebSockets
require('./sockets/notifications')(io);

// Database
mongoose.connect(process.env.MONGO_URI).then(() => {
  server.listen(process.env.PORT || 5000, () =>
    console.log('Appointix backend server running ')
  );
}).catch(err => console.error('MongoDB connection error:', err.message));
