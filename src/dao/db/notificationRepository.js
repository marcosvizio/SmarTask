import { getConnection } from './db.js';
import sql from 'mssql';
import { enviarMail } from '../../mailer.js';

/* Listar notificaciones de un usuario */
export async function listNotificationsByUser(userId) {
    const pool = await getConnection();
    const result = await pool.request()
        .input('userId', sql.Int, userId)
        .query(`
            SELECT n.*
            FROM Notifications n
            JOIN Tasks t
              ON t.task_id = n.task_id
             AND (
                  t.user_id = @userId
                  OR EXISTS (
                      SELECT 1 FROM OPENJSON(t.members) WHERE value = @userId
                  )
             )
        `);
    return result.recordset;
}

/* Obtener notificación por tarea */
export async function getNotificacionByTask(target) {
    const tid = Number(target);
    if (!Number.isFinite(tid)) return null;

    const pool = await getConnection();
    const result = await pool.request()
        .input('taskId', sql.Int, tid)
        .query(`
            SELECT *
            FROM Notifications
            WHERE task_id = @taskId
        `);

    return result.recordset[0] || null;
}

/* Crear o actualizar notificación */
export async function programarNotificacion({ taskId, id_tarea, tarea, asunto, mensaje, fecha_envio, canal = 'MAIL' }) {
    const tid = Number(id_tarea ?? taskId ?? tarea);
    if (!Number.isFinite(tid)) throw new Error('ID_TAREA_REQUIRED');

    const when = new Date(fecha_envio);
    if (isNaN(when.getTime())) throw new Error('FECHA_ENVIO_INVALID');

    const pool = await getConnection();

    // --- 1️⃣ Traemos la tarea ---
    const taskResult = await pool.request()
        .input('taskId', sql.Int, tid)
        .query(`SELECT * FROM Tasks WHERE task_id = @taskId`);

    const task = taskResult.recordset[0];
    if (!task) throw new Error('TASK_NOT_FOUND');

    const userId = task.user_id;

    // --- 2️⃣ Traemos el email del usuario dueño de la tarea ---
    const userResult = await pool.request()
        .input('userId', sql.Int, userId)
        .query(`SELECT * FROM Users WHERE id = @userId`);

    const user = userResult.recordset[0];
    if (!user) throw new Error('USER_NOT_FOUND');

    // --- 3️⃣ Revisamos si ya existe notificación ---
    const existingResult = await pool.request()
        .input('taskId', sql.Int, tid)
        .query(`SELECT * FROM Notifications WHERE task_id = @taskId`);

    if (existingResult.recordset.length) {
        const n = existingResult.recordset[0];

        await pool.request()
            .input('nid', sql.Int, n.notification_id)
            .input('asunto', sql.NVarChar, asunto)
            .input('mensaje', sql.NVarChar, mensaje)
            .input('fecha_envio', sql.DateTime, when)
            .input('canal', sql.NVarChar, canal)
            .query(`
                UPDATE Notifications
                SET asunto = @asunto,
                    mensaje = @mensaje,
                    fecha_envio = @fecha_envio,
                    canal = @canal,
                    cancelada = 0,
                    enviada = 0
                WHERE notification_id = @nid
            `);

        // --- 4️⃣ Programamos el envío usando el email del usuario ---
        programarEnvio({ ...n, asunto, mensaje, fecha_envio: when }, user.email);

        return { ...n, asunto, mensaje, fecha_envio: when, canal, cancelada: 0, enviada: 0 };
    }

    // --- 5️⃣ Crear nueva notificación ---
    const insertResult = await pool.request()
        .input('taskId', sql.Int, tid)
        .input('userId', sql.Int, userId)
        .input('asunto', sql.NVarChar, asunto)
        .input('mensaje', sql.NVarChar, mensaje)
        .input('fecha_envio', sql.DateTime, when)
        .input('canal', sql.NVarChar, canal)
        .query(`
            INSERT INTO Notifications (task_id, user_id, asunto, mensaje, fecha_envio, canal, cancelada, enviada)
            OUTPUT INSERTED.*
            VALUES (@taskId, @userId, @asunto, @mensaje, @fecha_envio, @canal, 0, 0)
        `);

    const nueva = insertResult.recordset[0];

    // --- 6️⃣ Programamos el envío del mail ---
    programarEnvio(nueva, user.email);

    return nueva;
}

/* Borra la notificación de una tarea (si existe) */
export async function cancelarNotificacion(target) {
    const tid = Number(target);
    if (!Number.isFinite(tid)) throw new Error('ID_TAREA_REQUIRED');

    const pool = await getConnection();

    // Borra la notificación de esa tarea, si existe
    const result = await pool.request()
        .input('taskId', sql.Int, tid)
        .query(`
            DELETE FROM Notifications
            OUTPUT DELETED.*
            WHERE task_id = @taskId
        `);

    // Retorna true si encontró y borró la notificación
    return result.recordset.length > 0;
}

export async function removeNotification(id) {
    const nid = Number(id);
    if (!Number.isFinite(nid)) return false;

    const pool = await getConnection();

    const result = await pool.request()
        .input('nid', sql.Int, nid)
        .query(`
            DELETE FROM Notifications
            OUTPUT DELETED.*
            WHERE notification_id = @nid
        `);

    return result.recordset.length > 0;
}

/* ============================ */
/* Funciones auxiliares (igual que antes) */
export function venceProntoNotificacion(fecha_vencimiento, withinHours = 24) {
    const due = new Date(fecha_vencimiento);
    const now = new Date();
    const diff = due - now;
    return diff > 0 && diff <= withinHours * 60 * 60 * 1000;
}

export function recordatorioNotificacion(firstName, titulo, fecha_vencimiento) {
    const d = new Date(fecha_vencimiento);
    const pad = n => String(n).padStart(2, '0');
    const stamp = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    return `Hola ${firstName}, recordatorio: "${titulo}" vence el ${stamp}.`;
}

function programarEnvio(notificacion, email) {
    const delay = new Date(notificacion.fecha_envio).getTime() - Date.now();

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