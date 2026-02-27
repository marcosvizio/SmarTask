import { setToken,getToken, clearToken, listTasks, createTask, updateTask, deleteTask, getNotification, createNotification, updateNotification, listNotifications, deleteNotification, getUsersHome, me_profile } from './api.js';

(async () => {
  // --- 1️⃣ Capturamos token de URL si viene de Google login ---
  const params = new URLSearchParams(window.location.search);
  const tokenFromUrl = params.get('token');
  if (tokenFromUrl) {
    setToken(tokenFromUrl);
    window.history.replaceState({}, '', '/home'); // limpiamos la URL
  }

  // --- 2️⃣ Validamos token en localStorage como antes ---
  const token = getToken();
  if (!token) {
    location.replace('/login');
    return;
  }


  let allUsers = [];

  async function loadUsers() {
    allUsers = await getUsersHome();
    renderUsers(allUsers);
  }

  function renderUsers(users) {
    const select = document.getElementById('taskMembers');
    select.innerHTML = '';

    users.forEach(user => {
      const option = document.createElement('option');
      option.value = user.id;
      option.textContent = `${user.first_name} ${user.last_name}`;
      select.appendChild(option);
    });
  }
  

  // ELEMENTOS
  const cards = document.getElementById('cards');
  const btnNew = document.getElementById('btnNewTask');
  const modal = document.getElementById('taskModal');
  const closeBtn = document.getElementById('closeModal');
  const cancelBtn = document.getElementById('cancelModal');
  const form = document.getElementById('taskForm');
  const titleInput = document.getElementById('taskTitle');
  const descInput = document.getElementById('taskDesc');
  const startInput = document.getElementById('taskStartDate');
  const dueInput = document.getElementById('taskDueDate');
  const priorityInput = document.getElementById('taskPriority');
  const btnNoti = document.getElementById('btn-noti');
  const btnCalendario = document.getElementById('btn-calend');
  const btnTablero = document.getElementById('btn-tablero');
  const secNoti = document.getElementById('sec-noti');
  const secCalendario = document.getElementById('sec-calendario');
  const secTablero = document.getElementById('sec-tablero')

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

  const user = await me_profile();
  
  document.getElementById("userName").textContent =
  `${user.first_name} ${user.last_name}`;

  document.getElementById("userEmail").textContent =
    user.email;

  // MOBILE FOOTER getElementById
  const btnNotiMobile = document.getElementById('btn-noti_mobile')
  const btnCalendarioMobile = document.getElementById('btn-calend_mobile')
  const btnTableroMobile = document.getElementById('btn-tablero_mobile')


  // NOTIFICACIONES JS
  const notifModal = document.getElementById('notif-modal');
  const notifForm = document.getElementById('notif-form');
  const nfTaskId = document.getElementById('notif-taskId');
  const nfAsunto = document.getElementById('notif-asunto');
  const nfMensaje = document.getElementById('notif-mensaje');
  const nfFecha = document.getElementById('notif-fecha');
  const closeBtnNotif = document.getElementById('notif-close');
  const cancelBtnNotif = document.getElementById('cancelModalNotif')

  const notifList = document.getElementById('notif-list'); // contenedor de la columna izquierda (poné este id)


  // EVENTOS MODAL NOTIFICACIONES

  closeBtnNotif.addEventListener('click', closeModalNoti);
  cancelBtnNotif.addEventListener('click', closeModalNoti);

  function closeModalNoti() {
    notifModal.classList.add('hidden');
    form.reset();
  }

  // Cache local de tareas para refrescar notificaciones
  let TASKS_CACHE = [];

  // Funciones de Notificaciones para el abrir y cerrar del modal
  function openNotifModal(task, existingNotif = null) {
    nfTaskId.value = task.task_id;
    nfAsunto.value = existingNotif?.asunto || `Recordatorio: ${task.title}`;
    nfMensaje.value = existingNotif?.mensaje || `La tarea "${task.title}" vence pronto.`;
    nfFecha.value = existingNotif?.fecha_envio;

    notifModal.classList.remove('hidden');
  }

  function closeNotifModal() { 
    notifModal.classList.add('hidden'); 
  }
  
  // Crear o actualizar notificacion de la tarea
  notifForm.addEventListener('submit', async (e) => {

    e.preventDefault();
    const taskId = Number(nfTaskId.value);
    
    const payload = {
      taskId,
      asunto: nfAsunto.value.trim(),
      mensaje: nfMensaje.value.trim(),
      fecha_envio: nfFecha.value
    };

    try {
      let exists = false;
      try { 
        await getNotification(task_id); 
        exists = true; 
      } catch {
      }

      if (exists) await updateNotification(taskId, payload);
      else  await createNotification(
        payload.taskId,
        payload.asunto,
        payload.mensaje,
        payload.fecha_envio
       );
       
      await loadNotifications();
      closeNotifModal();

    } catch (err) {
      alert(`Error guardando notificación: ${err.message}`);
    }

  });

  // render de “píldoras” en lista de notificaciones (columna izq)
  function renderNotifList(notifs) {
    if (!notifList) return;
    notifList.innerHTML = '';
    if (!notifs.length) {
      notifList.innerHTML = `<div class="muted">Sin notificaciones</div>`;
      return;
    }
    for (const n of notifs) {
      const div = document.createElement('div');
      div.className = "cards"
      div.innerHTML = `
        <article class="cards-noti" data-goto="${n.task_id}">
          <header class="cards-noti_header">
            <h3>${n.asunto}</h3>
          </header>

          <p class="cards-noti_texto">${n.mensaje || 'Sin mensaje!'}</p>
          <p class="cards-noti_texto">Fecha de envio: ${n.fecha_envio}</p>

          <div class="actions">
            <button class="btn secondary" type="button" data-id="${n.task_id}">Eliminar</button>
          </div>
        </article>
      `;
      notifList.appendChild(div);
    }
  }

  async function loadNotifications() {
    const notifs = await listNotifications();
    renderNotifList(notifs);
  }

  // === EVENTO CLICK EN LA LISTA DE NOTIFICACIONES ===
  notifList.addEventListener('click', async (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    if (btn.textContent === 'Eliminar') {
      const taskId = Number(btn.dataset.id);
      if (!Number.isFinite(taskId)) return;

      try {
        // Usamos la función de tu api.js
        const ok = await deleteNotification(taskId);

        if (ok) {
          // Removemos la tarjeta del DOM
          const card = btn.closest('.cards');
          if (card) card.remove();

          // Si ya no quedan notificaciones, mostramos mensaje
          if (!notifList.querySelector('.cards')) {
            notifList.innerHTML = `<div class="muted">Sin notificaciones</div>`;
          }
        } else {
          alert('No se encontró la notificación.');
        }
      } catch (err) {
        alert(`Error borrando notificación: ${err.message}`);
      }
    }
});



  /* ============== FIN NOTIFICACIONES JS ============== */



  // Si no está el contenedor, no seguir
  if (!cards) return;

  // === MODAL ===
  function openModal() {
    modal.classList.remove('hidden');
    titleInput.focus();
  }

  function closeModal() {
    modal.classList.add('hidden');
    form.reset();
  }

  /* EVENTOS BOTONES FOOTER DESKTOP */
  let isOpenNoti = false;
  let isOpenCalendario = false;
  let isOpenTablero = false;

  function openTablero() {
    secTablero.classList.remove('hidden');
  }

  function closeTablero() {
    secTablero.classList.add('hidden');
  }

  function openCalendario() {
    secCalendario.classList.remove('hidden');
  }

  function closeCalendario() {
    secCalendario.classList.add('hidden');
  }

  function openNoti() {
    secNoti.classList.remove('hidden');
  }

  function closeNoti() {
    secNoti.classList.add('hidden');
  }

  btnNoti.addEventListener('click', ()=>{
    if (isOpenNoti) {
      closeNoti();
      btnNoti.classList.remove('active');
    } else {
      openNoti();
      btnNoti.classList.add('active');
    }
    isOpenNoti = !isOpenNoti; // alterna el estado
  });

  btnTablero.addEventListener('click', ()=>{
    if (isOpenTablero) {
      closeTablero();
      btnTablero.classList.remove('active');
    } else {
      openTablero();
      btnTablero.classList.add('active');
    }
    isOpenTablero = !isOpenTablero; // alterna el estado
  });

  btnCalendario.addEventListener('click', ()=>{
    if (isOpenCalendario) {
      closeCalendario();
      btnCalendario.classList.remove('active');
    } else {
      openCalendario();
      btnCalendario.classList.add('active');
    }
    isOpenCalendario = !isOpenCalendario;
  });


  // === EVENTOS BOTONES FOOTER MOBILE

  function resetMobileTabs() {
  // Ocultar todas las secciones
  secNoti.classList.add('hidden');
  secCalendario.classList.add('hidden');
  secTablero.classList.add('hidden');

  // Quitar active de todos los botones
  btnNotiMobile.classList.remove('active');
  btnCalendarioMobile.classList.remove('active');
  btnTableroMobile.classList.remove('active');
}

// NOTIFICACIONES
btnNotiMobile.addEventListener('click', () => {
  resetMobileTabs();
  secNoti.classList.remove('hidden');
  btnNotiMobile.classList.add('active');
});

// CALENDARIO
btnCalendarioMobile.addEventListener('click', () => {
  resetMobileTabs();
  secCalendario.classList.remove('hidden');
  btnCalendarioMobile.classList.add('active');
});

// TABLERO
btnTableroMobile.addEventListener('click', () => {
  resetMobileTabs();
  secTablero.classList.remove('hidden');
  btnTableroMobile.classList.add('active');
});

  // === EVENTOS MODAL ===
  btnNew.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-backdrop')) closeModal();
  });

    // === CARGAR TAREAS Y NOTIFICACIONES ===
    async function load() {
      try {
        const tasks = await listTasks();

        TASKS_CACHE = tasks;

        if (!tasks.length) {
          cards.innerHTML = `<p style="opacity:.7">No hay tareas aún. Creá la primera con “Nueva tarea”.</p>`;
          renderNotifList([]);
          return;
        }

        cards.innerHTML = tasks.map(cardTemplate).join('');
        await loadNotifications();
      } catch (e) {
        clearToken();
        location.replace('/login');
      }
    }

    // === TEMPLATE TARJETA ===
    function cardTemplate(t) {
      return `
          <article class="card ${t.status === 'Hecho' ? 'card-ok' : ''}" data-id="${t.task_id}">
            <div class="card-pad">

              <header class="card-head">
                <h3>${t.title}</h3>
                <div class="head-actions">
                  <button class="btn-ghost cfg-notif" type="button" title="Configurar notificación" data-id="${t.task_id}">🔔</button>
                </div>
              </header>

              <p class="card-text description">${t.description || 'Sin descripción!'}</p>
              <p class="card-text">Fecha de Inicio: ${t.fecha_inicio}</p>
              <p class="card-text">Fecha de Vencimiento: ${t.fecha_vencimiento}</p>

              <p class="${t.prioridad === 'Alta' ? 'p-red' : ''} ${t.prioridad === 'Media' ? 'p-yellow' : ''} ${t.prioridad === 'Baja' ? 'p-green' : ''}">
                Prioridad: ${t.prioridad}
              </p>

              <div class="actions">
                <button class="btn mark" type="button">${t.status === 'Hecho' ? 'Desmarcar' : 'Completada'}</button>
                <button class="btn del" type="button">Eliminar</button>
              </div>

            </div>

            <div class="status ${t.status === 'Hecho' ? 'ok' : 'info'}">
              <span class="icon"></span>
              <div class="status-text">
                <strong>Estado</strong><br>
                <small>${t.status || 'Pendiente'}</small>
              </div>
            </div>


          </article>
      `;
    }

    // === FORMULARIO NUEVA TAREA ===
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const title = titleInput.value.trim();
      const description = descInput.value.trim();
      const fecha_inicio = startInput.value;
      const fecha_vencimiento = dueInput.value;
      const prioridad = priorityInput.value;

      const select = document.getElementById('taskMembers');

      const selectedMembers = Array.from(select.selectedOptions)
        .map(option => Number(option.value));

      if (!title) return;
      await createTask(title, selectedMembers, description, fecha_inicio, fecha_vencimiento, prioridad);
      closeModal();
      await load();
    });

    // === EVENTOS EN TARJETAS ===
    cards.addEventListener('click', async (e) => {
      const target = e.target.closest('[data-id]');

      if (!target) return;

      const id = Number(target.dataset.id);

      if (e.target.classList.contains('mark')) {
        const isDone = target.classList.contains('card-ok');
        await updateTask(id, { status: isDone ? 'Pendiente' : 'Hecho' });
        await load();
      }
      
      if (e.target.classList.contains('del')) {
        await deleteTask(id);
        target.remove();
        if (!cards.querySelector('[data-id]')) load();
      }

      if (e.target.classList.contains('cfg-notif')) {
        const id = Number(target.dataset.id);
        const task = TASKS_CACHE.find(t => Number(t.task_id) === id);
        if (!task) return;

        let existing = null;
        try { existing = await getNotification(id); } catch {}
        openNotifModal(task, existing);
        return;
      }

    });
  
    loadUsers();

    const searchInput = document.getElementById('memberSearch');

    searchInput.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase();

      const filtered = allUsers.filter(u =>
        `${u.first_name} ${u.last_name}`
          .toLowerCase()
          .includes(term)
      );

      renderUsers(filtered);
    });

  load();

})();
