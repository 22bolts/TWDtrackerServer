// import express, { Request, Response } from 'express';
// import { createServer } from 'http';
// import { Server as SocketIOServer, Socket } from 'socket.io';
// import { ExpressPeerServer } from 'peer';
// import { ExpressPeerServerOptions } from 'peer';

// const app = express();
// const server = createServer(app);
// const io = new SocketIOServer(server);

// // PeerJS server setup
// const peerServerOptions: ExpressPeerServerOptions = {};
// const peerServer = ExpressPeerServer(server, peerServerOptions);

// app.use('/peerjs', peerServer);

// io.on('connection', (socket: Socket) => {
//   socket.on('join-room', (roomId: string, userId: string) => {
//     socket.join(roomId);
//     socket.to(roomId).emit('user-connected', userId);

//     socket.on('disconnect', () => {
//       socket.to(roomId).emit('user-disconnected', userId);
//     });
//   });
// });

// export default server;
