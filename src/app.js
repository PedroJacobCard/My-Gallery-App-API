import 'dotenv/config';

import express from 'express';
import cors from 'cors';

//import authMiddleware from './app/middlewares/auth';

import routes from './routes';

import './database';

class App {
  constructor() {
    this.server = express();
    this.middlewares();
    this.allowDev();
    this.routes();
  }

  middlewares() {
    this.server.use(express.json());
    //this.server.use(authMiddleware);
  }

  allowDev() {
    this.server.use(
      cors({
        origin: 'https://mygallery-m4nd.onrender.com',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      }),
    );
  }

  routes() {
    this.server.use(routes);
  }
}

export default new App().server;
