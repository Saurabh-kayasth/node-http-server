import { PORT } from './config/ServerConfig';
import Router from './core/Router';
import TCPServer from './core/TCPServer';

const router = new Router();
const server = new TCPServer(PORT, router);

router.use((req, res, next) => {
  if (req.method === 'GET') {
    return next();
  }

  const authHeader = req.headers['Authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    next();
  } else {
    res.writeHead(401, { 'Content-Type': 'text/plain' });
    res.end('Unauthorized');
  }
  next();
});

router.get('/users/:id', async (req, res) => {
  const { id } = req.params;
  res.end(`User ${id} get`);
});

router.post('/users', async (req, res) => {
  res.end(`User post`);
});

router.patch('/users/:id', async (req, res) => {
  const { id } = req.params;
  res.end(`User ${id} patch`);
});

router.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  res.end(`User ${id} delete`);
});

router.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  res.end(`User ${id} put`);
});

server.start();
