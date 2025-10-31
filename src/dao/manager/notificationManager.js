import { db } from '../db/memory.js';
import { getTid } from '../utils/idUtils.js'

//Función para crear una notificacion en base a una tarea en especifico.
export async function programarNotificacion({taskId, id_tarea, tarea, asunto, mensaje, fecha_envio, canal = 'APP' }) {

    //Utilizamos para buscar el ID de la tarea a la que le vamos a crear la notificacion
    //taskId o id_tarea o tarea
    //Obtenemos el ID de la tarea y validamos que sea un numero y finitos
    const tid = getTid(id_tarea ?? taskId ?? tarea);
    if (!Number.isFinite(tid)) throw new Error('ID_TAREA_REQUIRED');

    const when = new Date(fecha_envio);

    console.log(when);
    if (Number.isNaN(when.getTime())) throw new Error('FECHA_ENVIO_INVALID');

    //Se valida si ya existe esta notificación y si existe reemplaza los valores
    const existente = db.notifications.find(n => Number(n.taskId) === tid);
    if (existente) {
        existente.asunto = asunto;
        existente.mensaje = mensaje;
        existente.fecha_envio = when;
        existente.canal = canal;
        existente.cancelada = false;
        return existente;
    }

    //En el caso que no existe avanza por la funcion y crea la notificacion como objeto
    const nueva = {
        notificationId: Date.now(),
        taskId: tid,
        asunto,
        mensaje,
        fecha_envio: when,
        canal,
        cancelada: false
    };

    //Pusheamos la notificacion en memoria (mas adelante en SQL)
    db.notifications.push(nueva);
    return nueva;
}

/* Marca como cancelada la notificación de una tarea (si existe) */
export async function cancelarNotificacion(target) {

    const tid = getTid(target);
    if (!Number.isFinite(tid)) throw new Error('ID_TAREA_REQUIRED');

    const n = db.notifications.find(n => Number(n.taskId) === tid);
    if (!n) return false;

    n.cancelada = true;
    return true;
}

/* ¿La fecha de vencimiento está dentro de N horas (y aún no pasó)? */
export function venceProntoNotificacion(fecha_vencimiento, withinHours = 24) {
    const due = new Date(fecha_vencimiento);

    const now = new Date();

    const diff = due - now;

    return diff > 0 && diff <= withinHours * 60 * 60 * 1000;
}

/* Construye un mensaje corto de recordatorio para UI / envío */
export function recordatorioNotificacion(firstName, titulo, fecha_vencimiento) {
  const d = new Date(fecha_vencimiento);
  const pad = n => String(n).padStart(2, '0');
  const stamp = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  return `Hola ${firstName}, recordatorio: "${titulo}" vence el ${stamp}.`;
}

/* Obtener notificación por tarea */
export function getNotificacionByTask(target) {
  const tid = getTid(target);
  if (!Number.isFinite(tid)) return null;
  return db.notifications.find(n => Number(n.taskId) === tid) || null;
}