import express from 'express';

import viewsRouter from './routes/views.router.js';

import __dirname from './utils.js';

const app = express();

app.use(express.json());
app.use(express.static(`${__dirname}/public`))


//Rutas para el manejo de las views
app.use('/', viewsRouter);

//Rutas API que se veran en las direcciones de dominio
/* app.use('/api/users', usersRouter);
app.use('/api/tasks', tasksRouter); */

export default app; 