// public/js/password.js
import { password as resetPassword } from './api.js';

document.addEventListener('DOMContentLoaded', () => {

  const form = document.querySelector('form');
  const msg  = document.getElementById('msg');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = form.email.value.trim().toLowerCase();
    const newPassword = form.password.value;

    try {
      await resetPassword(email, newPassword);
      location.href = '/login';
    } catch (err) {
      mostrarPopup();
    }
  });

});

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