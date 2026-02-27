import { db } from '../db/memory.js';
import { getTid } from '../utils/idUtils.js'
import { enviarMail } from '../../mailer.js'


export async function listNotificationsByUser(userId){
    return db.notifications.filter(n => Number(n.userId) === Number(userId));
}

/* Obtener notificación por tarea */
export async function getNotificacionByTask(target) {

    const tid = getTid(target);
    if (!Number.isFinite(tid)) return null;

    return db.notifications.find(n => Number(n.taskId) === tid) || null;
}

//Función para crear una notificacion en base a una tarea en especifico.
export async function programarNotificacion({taskId, id_tarea, tarea, asunto, mensaje, fecha_envio, canal = 'MAIL' }) {

    //Utilizamos para buscar el ID de la tarea a la que le vamos a crear la notificacion
    //taskId o id_tarea o tarea
    //Obtenemos el ID de la tarea y validamos que sea un numero y finitos
    const tid = getTid(id_tarea ?? taskId ?? tarea);
    if (!Number.isFinite(tid)) throw new Error('ID_TAREA_REQUIRED');

    const when = new Date(fecha_envio);

    if (Number.isNaN(when.getTime())) throw new Error('FECHA_ENVIO_INVALID');

    const task = db.tasks.find(t => Number(t.taskId) === tid);
    if (!task) throw new Error('TASK_NOT_FOUND');

    const userId = task.userId;

    const user = db.users.find(u => Number(u.id) === Number(userId));
    if (!user) throw new Error('USER_NOT_FOUND');

    //Se valida si ya existe esta notificación y si existe reemplaza los valores
    const existente = db.notifications.find(n => Number(n.taskId) === tid);
    if (existente) {
        existente.asunto = asunto;
        existente.mensaje = mensaje;
        existente.fecha_envio = when;
        existente.canal = canal;
        existente.cancelada = false;
        existente.enviada = false;
        return existente;
    }

    //En el caso que no existe avanza por la funcion y crea la notificacion como objeto
    const nueva = {
        notificationId: Date.now(),
        taskId: tid,
        userId: userId,
        asunto,
        mensaje,
        fecha_envio: when,
        canal,
        cancelada: false,
        enviada: false
    };
    
    //Pusheamos la notificacion en memoria (mas adelante en SQL)
    db.notifications.push(nueva);

    programarEnvio(nueva, user.email);

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

//Funcion para borrar una notificación por ID
export async function removeNotification(id) {

  const nid = Number(id);
  if (!Number.isFinite(nid)) return false;

  const before = db.notifications.length;

  const filtered = db.notifications.filter(
    n => Number(n.notificationId) !== nid
  );

  db.notifications.splice(0, db.notifications.length, ...filtered);

  return db.notifications.length !== before;
}


function programarEnvio(notificacion, email) {

  const delay = new Date(notificacion.fecha_envio).getTime() - Date.now();

  console.log("Delay calculado:", delay);

  if (delay > 0) {
    setTimeout(async () => {

      if (notificacion.cancelada || notificacion.enviada) return;

      console.log("⏰ Ejecutando recordatorio...");

      try {
        await enviarMail({
          to: email,
          subject: notificacion.asunto,
          text: notificacion.mensaje
        });

        notificacion.enviada = true;

        console.log("📧 Mail enviado correctamente");
      } catch (error) {
        console.error("❌ Error enviando mail:", error.message);
      }

    }, delay);
  } else {
    console.log("⚠️ La fecha ya pasó, no se programa envío");
  }
}