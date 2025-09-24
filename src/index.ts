import http from 'http';
import app from './app';
import env from './config/env';
import { initSocket } from './ws/socket';
import { AppDataSource } from './config/data-source';
import { seed } from './seeds';

const server = http.createServer(app);

AppDataSource.initialize()
  .then(async () => {
    console.log('Database connected');

    await seed();

    initSocket(server);

    server.listen(env.PORT, () => {
      console.log(`Server running on http://localhost:${env.PORT} [${env.NODE_ENV}]`);
    });
  })
  .catch((error) => {
    console.error('Database connection failed:', error);
    process.exit(1);
  });
