import 'dotenv/config';

import express from 'express';
import cors from 'cors';

import allowsOrigin from './config/allowsOrigin';

//import authMiddleware from './app/middlewares/auth';

import routes from './routes';

import './database';

class App {
  constructor() {
    this.server = express();
    this.middlewares();
    this.allowCORS();
    this.routes();
  }

  middlewares() {
    this.server.use(express.json());
    //this.server.use(authMiddleware);
  }

  allowCORS() {
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

    this.server.use((req, res, next) => {
      res.setHeader(
        'Access-Control-Allow-Origin',
        'https://mygallery-m4nd.onrender.com',
      );
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
      res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization',
      );
      next();
    });
  }

  routes() {
    this.server.use(routes);
  }
}

export default new App().server;
