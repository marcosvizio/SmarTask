import { Router } from 'express';
import auth from '../middlewares/auth.js';
import {
  programarNotificacion,
  cancelarNotificacion,
  getNotificacionByTask,
  venceProntoNotificacion,
  recordatorioNotificacion,
  listNotificationsByUser
} from '../dao/db/notificationRepository.js';


const router = Router();


// Todas las rutas de /api/notifications requieren estar logueado
router.use(auth);


/* GET /api/notifications/ → Devuelve todas las notificaciones del usuario */
router.get('/', async (req, res) => {
  try {
    const userId = req.user.sub;
    
    const notifications = await listNotificationsByUser(userId);
    
    res.status(200).json(notifications)
  } catch (error) {
    res.status(500).json({ error: err.message });
  }
});


/* GET /api/notifications/check/:fecha_vencimiento → Ejemplo para probar isDueSoon desde el front */
router.get('/check/:fecha_vencimiento', (req, res) => {
  const { fecha_vencimiento } = req.params;

  const soon = venceProntoNotificacion(fecha_vencimiento);

  res.json({ fecha_vencimiento, soon });
});


/* GET /api/notifications/reminder → Devuelve un mensaje de recordatorio personalizado */
router.get('/reminder', (req, res) => {
  const { nombre, titulo, fecha } = req.query;
  const msg = recordatorioNotificacion(nombre, titulo, fecha);
  res.json({ message: msg });
});


/* POST /api/notifications → Crea o reprograma una notificación */
router.post('/', async (req, res) => {
  try {
    const { taskId, asunto, mensaje, fecha_envio, canal } = req.body;

    const notif = await programarNotificacion({ taskId, asunto, mensaje, fecha_envio, canal });

    res.status(201).json({ ok: true, notificacion: notif });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});



/* GET /api/notifications/:taskId → Devuelve la notificación asociada a una tarea */
router.get('/:taskId', async (req, res) => {
    try {
        const notif = await getNotificacionByTask(req.params.taskId);
        
        if (!notif) return res.status(404).json({ error: 'No existe notificación para esa tarea' });

        res.json(notif);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


/* PUT /api/notifications/:taskId → Reprograma (actualiza) una notificación existente */
router.put('/:taskId', async (req, res) => {
  try {
    const { asunto, mensaje, fecha_envio, canal } = req.body;
    const notif = await programarNotificacion({
      taskId: req.params.taskId,
      asunto,
      mensaje,
      fecha_envio,
      canal
    });
    res.json({ ok: true, notificacion: notif });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


/* DELETE /api/notifications/:taskId → Cancela o elimina la notificación de una tarea */
router.delete('/:taskId', async (req, res) => {
  try {
    const ok = await cancelarNotificacion(req.params.taskId);
    if (!ok) return res.status(404).json({ error: 'No existe notificación para esa tarea' });
    res.json({ ok: true, message: 'Notificación cancelada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


export default router;