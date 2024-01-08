import { Router } from 'express';

import authMiddleware from './app/middlewares/auth';

import sessions from './app/Controllers/SessionsController';
import users from './app/Controllers/UsersController';
import fotos from './app/Controllers/FotosController';

const routes = new Router();

//Sessions
routes.post('/sessions', sessions.create);

//create an user
routes.post('/users', users.create);

//contoll the access
routes.use(authMiddleware);

//Users
routes.get('/users', users.index);
routes.post('/users/login', users.show);
routes.put('/users/:id', users.update);
routes.delete('/users/:id', users.destroy);

//Fotos
routes.get('/users/:userId/fotos', fotos.index);
routes.get('/users/:userId/fotos/:id', fotos.show);
routes.post('/fotos', fotos.create);
routes.put('/fotos/:id', fotos.update);
routes.delete('/fotos/:id', fotos.destroy);
routes.delete('/fotos/:userId', fotos.destroyAll);

export default routes;
