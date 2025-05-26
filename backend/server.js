const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'] } });

dotenv.config();
app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/appointments', require('./routes/appointments'));

require('./sockets/notifications')(io);

mongoose.connect(process.env.MONGO_URI).then(() => {
  server.listen(process.env.PORT || 5000, () => console.log('Server ready'));
}).catch(err => console.error('DB error:', err.message));
