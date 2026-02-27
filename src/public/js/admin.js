import { getToken, getUsers, updateUser, deleteUser, deleteTaskAdmin, deleteNotificationAdmin } from './api.js';

(async () => {
    const token = getToken();
    if (!token) {
        location.replace('/login');
        return;
    }

    let editingUserId = null;

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


    // LISTAR USUARIOS
    const users = await getUsers();
    users.forEach(user => {
    const card = document.createElement('div');
    card.className = 'admin-card';

    card.innerHTML = `
        <h3>${user.first_name} ${user.last_name}</h3>
        <button class="edit-btn" data-id="${user.id}">Editar</button>
        <button class="delete-user" data-id="${user.id}">Eliminar Usuario</button>

        <h4>Tareas</h4>
        <ul>
        ${user.tasks.map(t => `
            <li>
            ${t.title}
            <button class="delete-task" data-id="${t.taskId}">X</button>
            </li>
        `).join('')}
        </ul>

        <h4>Notificaciones</h4>
        <ul>
        ${user.notifications.map(n => `
            <li>
            ${n.asunto}
            <button class="delete-notif" data-id="${n.notificationId}">X</button>
            </li>
        `).join('')}
        </ul>
    `;

    document.getElementById('adminContainer').appendChild(card);
    });

    
    document.addEventListener('click', async (e) => {

        // EDITAR USUARIO
        if (e.target.classList.contains('edit-btn')) {
            const id = e.target.dataset.id;
            openEditModal(id);
        }

        // ELIMINAR USUARIO
        if (e.target.classList.contains('delete-user')) {
            const id = e.target.dataset.id;

            const confirmDelete = confirm("¿Eliminar usuario?");
            if (!confirmDelete) return;

            console.log("Eliminar usuario:", id);
            await deleteUser(id)
            location.reload();
        }

        if (e.target.classList.contains('delete-task')) {
            const id = e.target.dataset.id;

            const confirmDelete = confirm("¿Eliminar tarea?");
            if (!confirmDelete) return;

            console.log("Eliminar tarea:", id);
            await deleteTaskAdmin(id)
            location.reload();
        }

        if (e.target.classList.contains('delete-notif')) {
            const id = e.target.dataset.id;

            const confirmDelete = confirm("¿Eliminar notificacion?");
            if (!confirmDelete) return;

            console.log("Eliminar notificacion:", id);
            await deleteNotificationAdmin(id)
            location.reload();
        }
    });

    const modal = document.getElementById('editModal');

    function openEditModal(id) {
        const user = users.find(u => String(u.id) === String(id));

        editingUserId = id;
        
        document.getElementById('first_name').value = user.first_name;
        document.getElementById('last_name').value = user.last_name;
        document.getElementById('email').value = user.email;
        document.getElementById("birthday").value = user.birthday;
        document.getElementById("phone_number").value = user.phone_number;

        modal.classList.remove('hidden');
    }

    const form = document.getElementById('editUserForm');
    const errorMsg = document.getElementById('formError');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const first_name = form.first_name.value.trim();
        const last_name = form.last_name.value.trim();
        const birthday = form.birthday.value;
        const email = form.email.value.trim().toLowerCase();
        const phone_number = form.phone_number.value;
        const password = form.password.value;
        

        try {
            await updateUser(editingUserId, { first_name, last_name, birthday, email, phone_number, password });
            modal.classList.add('hidden');
            location.reload();
          } catch (err) {
            errorMsg.textContent = err.message;
          }
    });

    document.getElementById('closeModal').addEventListener('click', closeModal);

    function closeModal() {
        modal.classList.add('hidden');
    }


})();