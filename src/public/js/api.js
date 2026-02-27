// Guarda y lee el token
export function setToken(t) { localStorage.setItem('token', t); }
export function getToken() { return localStorage.getItem('token'); }
export function clearToken() { localStorage.removeItem('token'); }

// Wrapper fetch con Authorization si hay token
export async function api(path, { method='GET', headers={}, body } = {}) {
  const token = getToken();
  const opts = { method, headers: { ...headers }, body: undefined };

  if (token) opts.headers['Authorization'] = `Bearer ${token}`;
  if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }

  const res = await fetch(path, opts);
  if (!res.ok) {
    // Intenta parsear error
    let err = {};
    try { err = await res.json(); } catch {}
    throw new Error(err.error || `${res.status} ${res.statusText}`);
  }
  // si no hay contenido, devuelve null
  try { 
    return await res.json(); 
  } 
  catch { 
    return null; 
  }
}

// === USERS ===
export const login = (email, password) => api('/api/users/login', { method: 'POST', body: { email, password } });
export const register = (first_name, last_name, birthday, email, phone_number, password) => api('/api/users/register', { method: 'POST', body: { first_name, last_name, birthday, email, phone_number, password }});
export const password = (email, password) => api('/api/users/password', { method: 'POST', body: { email, password } });
export const me_profile = () => api('/api/users/me_profile');
export const update = (first_name, last_name, birthday, email, phone_number, password) => api('/api/users/update', { method: 'PUT', body: { first_name, last_name, birthday, email, phone_number, password }});
export const getUsersHome = () => api('/api/users');

// === TASKS ===
export const listTasks = () => api('/api/tasks/');
export const createTask = (title, members, description, fecha_inicio, fecha_vencimiento, prioridad) => api('/api/tasks/', { method: 'POST', body: { title, members, description, fecha_inicio, fecha_vencimiento, prioridad } });
export const updateTask = (id, patch) => api(`/api/tasks/${id}`, { method: 'PUT', body: patch });
export const deleteTask = (id) => api(`/api/tasks/${id}`, { method: 'DELETE' });

// === NOTIFICATIONS ===
export const listNotifications = () => api('/api/notifications/');
export const getNotification = (taskId) => api(`/api/notifications/${taskId}`, {method: 'GET'});
export const createNotification = (taskId, asunto, mensaje, fecha_envio) => api(`/api/notifications`, {method: 'POST', body: {taskId, asunto, mensaje, fecha_envio}});
export const updateNotification = (taskId, {asunto, mensaje, fecha_envio}) => api(`/api/notifications/${taskId}`, {method: 'PUT', body: {asunto, mensaje, fecha_envio}});
export const deleteNotification = (taskId) => api(`/api/notifications/${taskId}`, {method: 'DELETE'})

// === ADMIN ===
export const getUsers = () => api('/api/admin/users');
export const updateUser = (id, {first_name, last_name, birthday, email, phone_number, password }) => api(`/api/admin/user/${id}`, { method: 'PUT', body: { first_name, last_name, birthday, email, phone_number, password }});
export const deleteUser = (id) => api(`/api/admin/user/${id}`, {method: 'DELETE'})
export const deleteTaskAdmin = (id) => api(`/api/admin/task/${id}`, {method: 'DELETE'})
export const deleteNotificationAdmin = (id) => api(`/api/admin/notification/${id}`, {method: 'DELETE'})