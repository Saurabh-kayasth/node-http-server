import { PORT } from './config/ServerConfig';
import Router from './core/Router';
import TCPServer from './core/TCPServer';

const router = new Router();

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

const server = new TCPServer(PORT, router);
server.start();
