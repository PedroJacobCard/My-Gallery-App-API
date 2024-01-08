import 'dotenv/config';

import express from 'express';
import cors from 'cors';

import allowsOrigin from './config/allowsOrigin';

import routes from './routes';

import './database';

class App {
  constructor() {
    this.server = express();
    this.middlewares();
    this.routes();
  }

  middlewares() {
    this.server.use(
      cors({
        origin: (origin, callback) => {
          if (allowsOrigin.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
          } else {
            callback(new Error('Not allowed by CORS'));
          }
        },
        credentials: true,
        optionsSuccessStatus: 200,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      }),
    );

    this.server.use(express.json());
  }

  routes() {
    this.server.use(routes);
  }
}

export default new App().server;
