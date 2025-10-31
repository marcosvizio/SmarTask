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

// === LOGIN Y REGISTER ===
export const login = (email, password) => api('/api/users/login', { method: 'POST', body: { email, password } });
export const register = (first_name, last_name, birthday, email, phone_number, password) => api('/api/users/register', { method: 'POST', body: { first_name, last_name, birthday, email, phone_number, password } });
export const me = () => api('/api/users/me');

// === TASKS ===
export const listTasks = () => api('/api/tasks/');
export const createTask = (title, description, fecha_inicio, fecha_vencimiento, prioridad) => api('/api/tasks/', { method: 'POST', body: { title, description, fecha_inicio, fecha_vencimiento, prioridad } });
export const updateTask = (id, patch) => api(`/api/tasks/${id}`, { method: 'PUT', body: patch });
export const deleteTask = (id) => api(`/api/tasks/${id}`, { method: 'DELETE' });

// === NOTIFICATIONS ===
export const getNotification = (taskId) => api(`/api/notifications/${taskId}`, {method: 'GET'});
export const createNotification = (taskId, asunto, mensaje, fecha_envio, canal) => api(`/api/notifications/`, {method: 'POST', body: {taskId, asunto, mensaje, fecha_envio, canal}});

export const updateNotification = (taskId, {asunto, mensaje, fecha_envio, canal}) => api(`/api/notifications/${taskId}`, {method: 'POST', body: {asunto, mensaje, fecha_envio, canal} });
export const deleteNotification = (taskId) => api(`/api/notifications/${taskId}`, {method: 'DELETE'})