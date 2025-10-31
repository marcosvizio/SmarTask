import { getToken, clearToken, listTasks, createTask, updateTask, deleteTask, getNotification, createNotification, updateNotification, deleteNotification } from './api.js';

(async () => {
  const token = getToken();
  if (!token) {
    location.replace('/login');
    return;
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


  //* ============== NOTIFICACIONES JS ============== */
  const notifModal = document.getElementById('notif-modal');
  const notifForm = document.getElementById('notif-form');
  const nfTaskId = document.getElementById('notif-taskId');
  const nfAsunto = document.getElementById('notif-asunto');
  const nfMensaje = document.getElementById('notif-mensaje');
  const nfFecha = document.getElementById('notif-fecha');
  const nfCanal = document.getElementById('notif-canal');

  const notifList = document.getElementById('notif-list'); // contenedor de la columna izquierda (poné este id)

  // Cache local de tareas para refrescar notificaciones
  let TASKS_CACHE = [];

  // Funciones de Notificaciones para el abrir y cerrar del modal
  function openNotifModal(task, existingNotif = null) {
    nfTaskId.value = task.taskId;
    nfAsunto.value = existingNotif?.asunto || `Recordatorio: ${task.title}`;
    nfMensaje.value = existingNotif?.mensaje || `La tarea "${task.title}" vence pronto.`;
    nfCanal.value = existingNotif?.canal || 'APP';
    nfFecha.value = existingNotif?.fecha_envio || task.fecha_vencimiento || new Date();

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
      fecha_envio: nfFecha.value,
      canal: nfCanal.value
    };

    try {
      let exists = false;
      try { 
        await getNotification(taskId); 
        exists = true; 
      } catch {

      }

      if (exists) await updateNotification(taskId, payload);
      else await createNotification(payload);

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
      div.className = 'notif-pill';
      div.innerHTML = `
        <span class="dot ${n.cancelada ? 'off' : 'on'}"></span>
        <button class="pill-btn" data-goto="${n.id_tarea}">${n.asunto || '(sin asunto)'} ▷</button>
      `;
      div.querySelector('.pill-btn').addEventListener('click', () => {
        const card = document.querySelector(`[data-id="${n.id_tarea}"]`);
        if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      notifList.appendChild(div);
    }
  }

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

  /* EVENTOS BOTONES FOOTER */
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
    } else {
      openNoti();
    }
    isOpenNoti = !isOpenNoti; // alterna el estado
  });

  btnCalendario.addEventListener('click', ()=>{
    if (isOpenCalendario) {
      closeCalendario();
    } else {
      openCalendario();
    }
    isOpenCalendario = !isOpenCalendario; // alterna el estado
  });

  btnTablero.addEventListener('click', ()=>{
    if (isOpenTablero) {
      closeTablero();
    } else {
      openTablero();
    }
    isOpenTablero = !isOpenTablero; // alterna el estado
  });



  // === EVENTOS MODAL ===
  btnNew.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-backdrop')) closeModal();
  });

  // === CARGAR TAREAS ===
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
    } catch (e) {
      clearToken();
      location.replace('/login');
    }
  }

  // === TEMPLATE TARJETA ===
  function cardTemplate(t) {
    return `
        <article class="card ${t.status === 'Hecho' ? 'card-ok' : ''}" data-id="${t.taskId}">
          <header class="card-head">
            <h3>${t.title}</h3>
            <div class="head-actions">
              <button class="btn-ghost cfg-notif" type="button" title="Configurar notificación" data-id="${t.taskId}">🔔</button>
              <span class="pin" aria-hidden="true"></span>
            </div>
          </header>

          <p class="card-text">${t.description || 'Sin descripción!'}</p>
          <p class="card-text">Fecha de Inicio: ${t.fecha_inicio}</p>
          <p class="card-text">Fecha de Vencimiento: ${t.fecha_vencimiento}</p>

          <p class="${t.prioridad === 'Alta' ? 'p-red' : ''} ${t.prioridad === 'Media' ? 'p-yellow' : ''} ${t.prioridad === 'Baja' ? 'p-green' : ''}">
            Prioridad: ${t.prioridad}
          </p>

          <div class="status ${t.status === 'Hecho' ? 'ok' : 'info'}">
            <span class="icon"></span>
            <div class="status-text">
              <strong>Estado</strong><br>
              <small>${t.status || 'Pendiente'}</small>
            </div>
          </div>

          <div class="actions">
            <button class="btn mark" type="button">${t.status === 'Hecho' ? 'Desmarcar' : 'Completada'}</button>
            <button class="btn del" type="button">Eliminar</button>
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

    if (!title) return;
    await createTask(title, description, fecha_inicio, fecha_vencimiento, prioridad);
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
      const task = TASKS_CACHE.find(t => Number(t.taskId) === id);
      if (!task) return;

      let existing = null;
      try { existing = await getNotification(id); } catch {}
      openNotifModal(task, existing);
      return;
    }

  });

  load();

})();
