import { Server, Socket } from 'socket.io';

export default function registerRootEvent(_io: Server, socket: Socket) {
  socket.on('root:event', (data: any) => {
    socket.emit('root:event', data);
  });
}
