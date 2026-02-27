// public/js/login.js
import { login, setToken } from './api.js';

const form = document.querySelector('form');
const msg  = document.getElementById('msg');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = form.email.value.trim().toLowerCase();
  const password = form.password.value;


  try {
    const data = await login(email, password);
    setToken(data.token);

    if (data.user.role == 'admin') {
      location.href = '/admin';
    } else {
      location.href = '/home';
    }

  } catch (err) {
      mostrarPopup();
    }
  }
);

const popup = document.getElementById("errorPopup");
const cerrarBtn = document.getElementById("cerrarBtn");

function mostrarPopup() {
  popup.style.display = "flex";
}

function cerrarPopup() {
  popup.style.display = "none";
}

// conectar el botón con la función
cerrarBtn.addEventListener("click", cerrarPopup);

popup.addEventListener("click", function(e) {
  if (e.target === popup) {
    cerrarPopup();
  }
});