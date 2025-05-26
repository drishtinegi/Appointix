module.exports = io => {
  io.on('connection', socket => {
    socket.on('send-invite', data => io.emit('receive-invite', data));
    socket.on('disconnect', () => console.log('User disconnected'));
  });
};