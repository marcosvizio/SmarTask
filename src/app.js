import express from 'express';
import 'dotenv/config';

import viewsRouter from './routes/views.router.js';
import tasksRouter from './routes/tasks.router.js';
import usersRouter from './routes/users.router.js';

import __dirname from './utils.js';

const app = express();

app.use(express.json());
app.use(express.static(`${__dirname}/public`))

//Rutas para el manejo de las views
app.use('/', viewsRouter);

//Rutas API que se veran en las direcciones de dominio
app.use('/api/tasks', tasksRouter);
app.use('/api/users', usersRouter);

export default app; 