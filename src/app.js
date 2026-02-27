import express from 'express';
import 'dotenv/config';
import cookieParser from 'cookie-parser';

import session from 'express-session';
import { getConnection } from './dao/db/db.js';
import passport from './config/passport.js';

import viewsRouter from './routes/views.router.js';
import tasksRouter from './routes/tasks.router.js';
import usersRouter from './routes/users.router.js';
import notificationsRouter from './routes/notifications.router.js';
import adminRouter from './routes/admin.router.js';
import googleRouter from './routes/google.router.js';

import __dirname from './utils.js';

const app = express();
app.use(cookieParser());

async function startServer() {
    await getConnection();
    console.log("Base de datos conectada");

    app.listen(3000, () => {
        console.log("Servidor en puerto 3001");
    });
}

startServer();

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());
app.use(express.static(`${__dirname}/public`));


//Rutas para el manejo de las views
app.use('/', viewsRouter);

//Rutas API que se veran en las direcciones de dominio
app.use('/api/tasks', tasksRouter);
app.use('/api/users', usersRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/admin', adminRouter);
app.use('/auth', googleRouter);

export default app;