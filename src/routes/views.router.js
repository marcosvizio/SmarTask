import { Router } from 'express';
import path from 'path';
import __dirname from '../utils.js';

const router = Router();

/* HOME PAGE */
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/* LOGIN */
router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages/login.html'));
});

/* REGISTER */
router.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages/register.html'));
});

export default router;