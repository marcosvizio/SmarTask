import { getToken, me_profile, update } from './api.js';

(async () => {
    const token = getToken();
    if (!token) {
        location.replace('/login');
        return;
    }

    // DROPDOWN MENU
    const btnLogout = document.getElementById('logoutBtn')

    btnLogout.addEventListener('click', () => {
        localStorage.removeItem("token");
        window.location.href = "/login";
    });

    const profileMenu = document.querySelector(".perfil");

    profileMenu.addEventListener("click", () => {
        document.querySelector(".dropdown-menu").classList.toggle("show");
    });

    // DATOS FORMULARIO CARGADOS
    
    const user = await me_profile();

    document.getElementById("first_name").value = user.first_name;
    document.getElementById("last_name").value = user.last_name;
    document.getElementById("email").value = user.email;
    document.getElementById("birthday").value = user.birthday;
    document.getElementById("phone_number").value = user.phone_number;

    // UPDATEAR DATOS DEL USUARIO

    const form = document.querySelector('form');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
    
      const first_name = form.first_name.value.trim();
      const last_name = form.last_name.value.trim();
      const birthday = form.birthday.value;
      const email = form.email.value.trim().toLowerCase();
      const phone_number = form.phone_number.value;
      const password = form.password.value;
    
      try {
        await update(first_name, last_name, birthday, email, phone_number, password);
        location.href = '/home';
      } catch (err) {
        msg.textContent = err;
      }
    });

    // BOTON "ATRAS"

    const btnAtras = document.getElementById('btn-atras')

    btnAtras.addEventListener('click', () => {
        window.location.href = "/home";
    })

})();