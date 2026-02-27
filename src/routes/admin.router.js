import adminOnly from '../middlewares/adminOnly.js';
import { getAllUsersWithRelations, findByIdAndUpdate, findByIdAndDelete } from '../dao/db/userRepository.js';
import { remove, getTaskById } from '../dao/db/taskRepository.js';
import { removeNotification } from '../dao/db/notificationRepository.js';
import { Router } from 'express';
import auth from '../middlewares/auth.js';
import bcrypt from 'bcrypt';

const router = Router();

router.get('/users', auth, adminOnly, async (_req, res) => {
  const users = await getAllUsersWithRelations();
  res.json(users);
});

// PUT /api/admin/user/:id
router.put('/user/:id', auth, adminOnly, async (req, res) => {
  try {

    const { id } = req.params;

    const first_name = (req.body?.first_name || '').trim();
    const last_name = (req.body?.last_name || '').trim();
    const birthday = (req.body?.birthday || '').trim();
    const email = (req.body?.email || '').toLowerCase().trim();
    const phone_number = (req.body?.phone_number || '').trim();
    const password = req.body?.password || '';

    if (!first_name || !last_name || !email) {
      return res.status(400).json({ error: 'missing fields' });
    }

    const updateData = {
      id,
      first_name,
      last_name,
      birthday,
      email,
      phone_number
    };

    if (password) {
      const password_hash = await bcrypt.hash(password, 10);
      updateData.password_hash = password_hash;
    }

    const user = await findByIdAndUpdate(updateData);

    res.status(200).json(user);

  } catch (err) {
    res.status(500).json({ error: 'error updating user' });
  }
});

// DELETE /api/admin/user/:id
router.delete('/user/:id', auth, adminOnly, async (req, res) => {
  try {

    const id = Number(req.params.id);

    const deletedUser = await findByIdAndDelete(id);

    res.status(200).json({
      message: "User deleted",
      user: deletedUser
    });

  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.delete('/task/:id', auth, adminOnly, async (req, res) => {
  try {
    const taskId = Number(req.params.id);

    if (!Number.isFinite(taskId)) {
      return res.status(400).json({ error: "INVALID_TASK_ID" });
    }

    // Primero buscamos la tarea en la DB para obtener el userId
    const task = await getTaskById(taskId);

    if (!task) {
      return res.status(404).json({ error: "TASK_NOT_FOUND" });
    }

    const deleted = await remove(task.user_id, taskId);

    if (!deleted) {
      return res.status(404).json({ error: "TASK_NOT_DELETED" });
    }

    res.status(200).json({ message: "Task deleted successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/notification/:id', auth, adminOnly, async (req, res) => {
  try {

    const notificationId = Number(req.params.id);

    if (!Number.isFinite(notificationId)) {
      return res.status(400).json({ error: "INVALID_NOTIFICATION_ID" });
    }

    const deleted = await removeNotification(notificationId);

    if (!deleted) {
      return res.status(404).json({ error: "NOTIFICATION_NOT_FOUND" });
    }

    res.status(200).json({ message: "Notification deleted successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



export default router;