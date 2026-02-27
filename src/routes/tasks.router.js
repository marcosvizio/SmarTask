import { Router } from 'express';
import auth from '../middlewares/auth.js';
import { listByUser, create, update, remove } from '../dao/db/taskRepository.js';

const router = Router();

// Todas las rutas requieren estar logueado
router.use(auth);

// GET /api/tasks → lista mis tareas
router.get('/', async (req, res) => {
  try {
    const tasks = await listByUser(req.user.sub);

    // Mapear fechas a string "YYYY-MM-DD"
    const tasksSafe = tasks.map(t => ({
      ...t,
      fecha_inicio: t.fecha_inicio ? t.fecha_inicio.toISOString().split('T')[0] : null,
      fecha_vencimiento: t.fecha_vencimiento ? t.fecha_vencimiento.toISOString().split('T')[0] : null
    }));

    res.status(200).json(tasksSafe);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching tasks' });
  }
});

// POST /api/tasks → crea tarea
router.post('/', async (req, res) => {
    try {
        const userId = Number(req.user.sub);

        const title = (req.body?.title || '').trim();
        if (!title) return res.status(400).json({ error: 'title required' });

        const description = req.body?.description?.trim() || null;
        const prioridad = req.body?.prioridad?.trim() || null;
        const status = req.body?.status?.trim() || 'Pendiente';

        // Convertimos fechas a null si vienen vacías
        const fecha_inicio = req.body?.fecha_inicio ? new Date(req.body.fecha_inicio) : null;
        const fecha_vencimiento = req.body?.fecha_vencimiento ? new Date(req.body.fecha_vencimiento) : null;

        // Members
        const members = Array.isArray(req.body?.members)
            ? req.body.members.map(Number)
            : [];

        const task = await create(userId, { title, members, description, fecha_inicio, fecha_vencimiento, prioridad, status });

        res.status(200).json(task);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error creating task' });
    }
});

// PUT /api/tasks/:id → update tarea
router.put('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const userId = Number(req.user.sub);

        const patch = {};
        if (typeof req.body?.title === 'string') patch.title = req.body.title.trim();
        if (typeof req.body?.status === 'string') patch.status = req.body.status.trim();
        if (typeof req.body?.description === 'string') patch.description = req.body.description.trim();
        if (Array.isArray(req.body?.members)) patch.members = req.body.members.map(Number);
        if (req.body?.fecha_inicio) patch.fecha_inicio = new Date(req.body.fecha_inicio);
        if (req.body?.fecha_vencimiento) patch.fecha_vencimiento = new Date(req.body.fecha_vencimiento);
        if (typeof req.body?.prioridad === 'string') patch.prioridad = req.body.prioridad.trim();

        const task = await update(userId, id, patch);
        if (!task) return res.status(404).json({ error: 'Task not found' });

        res.status(200).json(task);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error updating task' });
    }
});

// DELETE /api/tasks/:id → borrar tarea
router.delete('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const userId = Number(req.user.sub);

        const ok = await remove(userId, id);
        if (!ok) return res.status(404).json({ error: 'Task not found' });

        res.status(200).json({ ok: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error deleting task' });
    }
});

export default router;