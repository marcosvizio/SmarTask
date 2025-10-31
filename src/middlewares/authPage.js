// src/middlewares/authPage.js
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET;

//El middleware auth funciona para verificar el token que esta enviando el usuario exista y asi pasar pagina que corresponde, por ejemplo /home no puede estar abierta al usuario sin token.
//Este se usa para paginas que requieren usuario autenticado.
export default function authPage(req, res, next) {
  const token = req.cookies?.token;
  if (!token) return res.redirect('/login');

  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.clearCookie('token');
    return res.redirect('/login');
  }
}
