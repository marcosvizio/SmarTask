// public/js/login.js
import { login, setToken } from '/js/api.js';

const form = document.querySelector('form');
const msg  = document.getElementById('msg');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = form.email.value.trim().toLowerCase();
  const password = form.password.value;

  try {
    const data = await login(email, password);
    setToken(data.token);
    location.href = '/home'; 
  } catch (err) {
    msg.textContent = 'Credenciales inválidas';
  }
});
