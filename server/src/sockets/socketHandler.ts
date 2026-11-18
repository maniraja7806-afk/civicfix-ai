import { Server, Socket } from 'socket.io';
import { logger } from '../utils/logger';

let ioInstance: Server | null = null;

export const initSocketServer = (server: any, clientUrl: string): Server => {
  const io = new Server(server, {
    cors: {
      origin: [clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
      credentials: true
    }
  });

  ioInstance = io;

  io.on('connection', (socket: Socket) => {
    logger.info(`Socket client connected: ${socket.id}`);

    // Join user's personal notification room
    socket.on('join:user', (userId: string) => {
      if (userId) {
        socket.join(`user:${userId}`);
        logger.debug(`Socket ${socket.id} joined user:${userId}`);
      }
    });

    // Join officer's department room
    socket.on('join:department', (departmentId: string) => {
      if (departmentId) {
        socket.join(`dept:${departmentId}`);
        logger.debug(`Socket ${socket.id} joined dept:${departmentId}`);
      }
    });

    // Join admin stream
    socket.on('join:admin', () => {
      socket.join('admin:all');
      logger.debug(`Socket ${socket.id} joined admin:all`);
    });

    // Join specific complaint room for live tracking updates
    socket.on('join:complaint', (complaintId: string) => {
      if (complaintId) {
        socket.join(`complaint:${complaintId}`);
        logger.debug(`Socket ${socket.id} joined complaint:${complaintId}`);
      }
    });

    socket.on('leave:complaint', (complaintId: string) => {
      if (complaintId) {
        socket.leave(`complaint:${complaintId}`);
      }
    });

    socket.on('disconnect', () => {
      logger.info(`Socket client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!ioInstance) {
    throw new Error('Socket.IO has not been initialized yet.');
  }
  return ioInstance;
};

// Safe helper to emit events even if sockets are disabled/mocked
export const emitSocketEvent = (roomOrEvent: string, eventName?: string, data?: any) => {
  if (!ioInstance) return;
  try {
    if (eventName) {
      ioInstance.to(roomOrEvent).emit(eventName, data);
    } else {
      ioInstance.emit(roomOrEvent, data);
    }
  } catch (err: any) {
    logger.warn('Failed to emit socket event:', err.message);
  }
};
