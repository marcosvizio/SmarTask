import { Router } from 'express';
import passport from '../config/passport.js';
import jwt from 'jsonwebtoken';


const SECRET = process.env.JWT_SECRET || 'dev-secret';
const router = Router();

// Paso 1: enviar a Google
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email', 'https://www.googleapis.com/auth/calendar.readonly'] })
);

// Paso 2: callback
router.get('/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: '/login'
    }),
    (req, res) => {

        const token = jwt.sign({ sub: req.user.id, role: req.user.role, googleAccessToken: req.user.accessToken  }, SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.redirect(`/home?token=${token}`);
    }
);

router.get('/api/config', (req, res) => {
  res.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID
  });
});

router.get('/calendar', async (req, res) => {

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No token' });
  }

  const token = authHeader.split(' ')[1];
  const decoded = jwt.verify(token, SECRET);

  // 🔥 VALIDACIÓN CLAVE
  if (!decoded.googleAccessToken) {
    return res.status(403).json({
      error: 'Calendar disponible solo para usuarios Google'
    });
  }

  const response = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    {
      headers: {
        Authorization: `Bearer ${decoded.googleAccessToken}`
      }
    }
  );

  const data = await response.json();
  res.json(data);
});

export default router;