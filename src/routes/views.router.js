import { Router } from 'express';
import path from 'path';
import __dirname from '../utils.js';
import authPage from '../middlewares/authPage.js';
import adminOnly from '../middlewares/adminOnly.js';

const router = Router();

/* HOME PAGE */
router.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/* LOGIN */
router.get('/login', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages/login.html'));
});

/* REGISTER */
router.get('/register', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages/register.html'));
});

/* PASSWORD */
router.get('/password', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages/password.html'));
})

/* HOME */
router.get('/home', authPage, (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages/home.html'));
})

/* PROFILE */
router.get('/profile', authPage, (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages/profile.html'));
})

/* ADMIN */
router.get('/admin', authPage, adminOnly, (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages/admin.html'));
})

export default router;