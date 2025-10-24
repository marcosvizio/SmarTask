import jwt from 'jsonwebtoken';
const SECRET = process.env.JWT_SECRET;

//El middleware auth funciona para verificar el token que esta enviando el usuario exista y asi pasar a la funcion que sigue en la API correspondiente.
//Este se usa para rutas que requieren usuario autenticado.
export default function auth(req, res, next) {
    const h = req.headers.authorization || '';
    const token = h.startsWith('Bearer ') ? h.slice(7) : null;

    if (!token) return res.status(401).json({ 
        error: 'no token' 
    });

    try { 
        req.user = jwt.verify(token, SECRET); 
        next(); 
    }
    catch { 
        return res.status(401).json({error: 'invalid token'}); 
    }
}
