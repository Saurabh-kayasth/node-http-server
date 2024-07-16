import { PORT } from './config/ServerConfig';
import TCPServer from './core/httpServer';

const server = new TCPServer(PORT);
server.start();
