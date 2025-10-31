import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { findByEmail, create } from '../dao/manager/userManager.js';
import auth from '../middlewares/auth.js';

const router = Router();
const SECRET = process.env.JWT_SECRET || 'dev-secret';

// POST /api/users/register  → registar un usuario
router.post('/register', async (req, res) => {

    //Normalizamos los datos de entrada, asi evitamos errores y duplicados.
    const first_name = (req.body?.first_name || '').trim();
    const last_name = (req.body?.last_name || '').trim();
    const birthday = (req.body?.birthday || '').trim();
    const email = (req.body?.email || '').toLowerCase().trim();
    const phone_number = (req.body?.phone_number || '').trim();
    const password = req.body?.password || '';

    // En el caso, que no hayan ingresado un dato y no fue chequeado en front, saldra el error aqui.
    if (!first_name || !email || !password || !last_name || !birthday || !phone_number) return res.status(400).json({ 
        error: 'missing fields' 
    });

    //Usamos la funcion para que busque por email y enviamos el email con el que se quiere registrar, en caso que sea igual, el error "email in use".
    if (await findByEmail(email)) return res.status(409).json({ 
        error: 'Email ya registrado!' 
    });

    //Hasheamos la contraseña para que se guarde encriptada y no tal cual como la envio el usuario.
    const password_hash = await bcrypt.hash(password, 10);

    //Una vez hecho todos los chequeos y hasheada la contraseña, usamos la funcion de create del userManager.
    const user = await create({ 
        first_name,
        last_name,
        birthday,
        email, 
        phone_number,
        password_hash 
    });

    const token = jwt.sign({ sub: user.id }, SECRET, { expiresIn: '7d' });

    res.cookie('token', token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
    
    res.status(200).json({
        id: user.id,
        token,
        first_name: user.first_name,
        last_name: user.last_name,
        birthday: user.birthday,
        email: user.email,
        phone_number: user.phone_number,
        message: "OK Register"
    });

});

// POST /api/users/login  → login de un usuario
router.post('/login', async (req, res) => {

    // Normalizamos y validamos
    const email = (req.body?.email || '').toLowerCase().trim();
    const password = req.body?.password || '';

    // En el caso, que no hayan ingresado un dato y no fue chequeado en front, saldra el error aqui.
    if (!email || !password) {
        return res.status(400).json({ error: 'missing fields' });
    }

    // Buscamos si hay un usuario creado con ese mail, usando la funcion findByEmail del userManager, en el caso que no exista, informara el error.
    const user = await findByEmail(email);
    if (!user) {
        return res.status(401).json({ error: 'invalid credentials' });
    }

    // Se compara la contraseña ingresada con la del usuario ya hasheada cuando se registro.
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
        return res.status(401).json({ error: 'invalid credentials' });
    }

    // Si todo esta ok, le genera un token para despues acceder a funcion que soliciten AUTH, y poder firmar esas acciones.
    const token = jwt.sign({ sub: user.id }, SECRET, { expiresIn: '7d' });
    
    res.cookie('token', token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
        token,
        user: {
        id: user.id,
        email: user.email,
        message: "OK Login"
        }
    });

});

router.get('/me', auth, async (req, res) => {
  try {
    const user = await findByEmail(req.user.email); // si guardás email en token
    res.json({ id: req.user.sub, email: user?.email });
  } catch (err) {
    res.status(500).json({ error: 'error retrieving user info' });
  }
});

export default router;