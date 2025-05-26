module.exports = io => {
  io.on('connection', socket => {
    console.log('User connected:', socket.id);

    socket.on('send-invite', data => {
      io.emit('receive-invite', data);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });
};
