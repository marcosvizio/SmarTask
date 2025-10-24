import { Router } from 'express';
import auth from '../middlewares/auth.js';
import { listByUser, create, update, remove } from '../dao/manager/taskManager.js';

const router = Router();

// Todas las rutas de /api/tasks requieren estar logueado
router.use(auth);

// GET /api/tasks  → lista mis tareas
router.get('/', async (req, res) => {
    const tasks = await listByUser(req.user.sub);
    res.status(200).json(tasks);
});

// POST /api/tasks  → crea tarea { title, status? }
router.post('/', async (req, res) => {
    const title = (req.body?.title || '').trim();
    const status = (req.body?.status || '').trim();

    if (!title) return res.status(400).json({ error: 'title required' });

    const created = await create(req.user.sub, { title, status });

    res.status(200).json(created);
});

// PUT /api/tasks/:id  → update tarea (title?, status?)
router.put('/:id', async (req, res) => {
    const id = Number(req.params.id);
    const patch = {};
    if (typeof req.body?.title === 'string') patch.title = req.body.title.trim();
    if (typeof req.body?.status === 'string') patch.status = req.body.status.trim();

    const ok = await update(req.user.sub, id, patch);
    if (!ok) return res.status(404).json({ error: 'not found' });
    res.json({ ok: true });
});

// DELETE /api/tasks/:id
router.delete('/:id', async (req, res) => {
    const id = Number(req.params.id);
    const ok = await remove(req.user.sub, id);
    if (!ok) return res.status(404).json({ error: 'not found' });
    res.json({ ok: true });
});

export default router;