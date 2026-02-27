import { getConnection, sql } from './db.js';

export async function listByUser(userId) {
    const pool = await getConnection();

    const result = await pool.request()
        .input('userId', sql.Int, userId)
        .query(`
            SELECT *
            FROM Tasks
            WHERE user_id = @userId
               OR EXISTS (
                    SELECT 1
                    FROM OPENJSON(members) 
                    WHERE value = @userId
               )
        `);

    return result.recordset;
}


// Crear tarea
export async function create(userId, { title, members = [], description, fecha_inicio, fecha_vencimiento, prioridad, status }) {
    const pool = await getConnection();

    // Guardamos members como JSON
    const membersJson = JSON.stringify([...new Set([userId, ...members])]);

    const result = await pool.request()
        .input('userId', sql.Int, userId)
        .input('title', sql.NVarChar, title)
        .input('members', sql.NVarChar, membersJson)
        .input('description', sql.NVarChar, description || null)
        .input('fecha_inicio', sql.Date, fecha_inicio || null)
        .input('fecha_vencimiento', sql.Date, fecha_vencimiento || null)
        .input('prioridad', sql.NVarChar, prioridad || null)
        .input('status', sql.NVarChar, status || 'Pendiente')
        .query(`
            INSERT INTO Tasks (user_id, title, members, description, fecha_inicio, fecha_vencimiento, prioridad, status)
            OUTPUT INSERTED.*
            VALUES (@userId, @title, @members, @description, @fecha_inicio, @fecha_vencimiento, @prioridad, @status)
        `);

    const task = result.recordset[0];
    // Convertimos members de JSON a array para mantener compatibilidad con tu código anterior
    if (task.members) task.members = JSON.parse(task.members);
    return task;
}

// Actualizar tarea (puede hacerlo el creador o un miembro)
export async function update(userId, taskId, patch) {
    const pool = await getConnection();
    const request = pool.request()
        .input('userId', sql.Int, userId)
        .input('taskId', sql.Int, taskId);

    let query = `UPDATE Tasks SET `;
    const updates = [];

    // Preparamos solo los campos que vienen en patch
    if (patch.title) {
        request.input('title', sql.NVarChar, patch.title);
        updates.push('title = @title');
    }

    if (patch.description !== undefined) {
        request.input('description', sql.NVarChar, patch.description);
        updates.push('description = @description');
    }

    if (patch.members) {
        const membersJson = JSON.stringify([...new Set([userId, ...patch.members])]);
        request.input('members', sql.NVarChar, membersJson);
        updates.push('members = @members');
    }

    if (patch.fecha_inicio) {
        request.input('fecha_inicio', sql.Date, patch.fecha_inicio);
        updates.push('fecha_inicio = @fecha_inicio');
    }

    if (patch.fecha_vencimiento) {
        request.input('fecha_vencimiento', sql.Date, patch.fecha_vencimiento);
        updates.push('fecha_vencimiento = @fecha_vencimiento');
    }

    if (patch.prioridad) {
        request.input('prioridad', sql.NVarChar, patch.prioridad);
        updates.push('prioridad = @prioridad');
    }

    if (patch.status) {
        request.input('status', sql.NVarChar, patch.status);
        updates.push('status = @status');
    }

    if (updates.length === 0) {
        return false; // Nada que actualizar
    }

    query += updates.join(', ');

    // ✅ Aquí cambiamos la condición para permitir creador o miembros
    query += `
        OUTPUT INSERTED.* 
        WHERE task_id = @taskId 
          AND (
               user_id = @userId
               OR EXISTS (
                   SELECT 1
                   FROM OPENJSON(members)
                   WHERE value = @userId
               )
          )
    `;

    const result = await request.query(query);

    if (result.recordset.length === 0) return false;

    const task = result.recordset[0];
    if (task.members) task.members = JSON.parse(task.members);

    return task;
}

export async function getTaskById(taskId) {
    const pool = await getConnection();

    const result = await pool.request()
        .input('taskId', sql.Int, taskId)
        .query(`
            SELECT task_id, user_id
            FROM Tasks
            WHERE task_id = @taskId
        `);

    return result.recordset[0] || null;
}

// Eliminar tarea (puede hacerlo el creador o un miembro)
export async function remove(userId, taskId) {
    const pool = await getConnection();
    const request = pool.request()
        .input('userId', sql.Int, userId)
        .input('taskId', sql.Int, taskId);

    const result = await request.query(`
        DELETE FROM Tasks
        OUTPUT DELETED.*
        WHERE task_id = @taskId
          AND (
               user_id = @userId
               OR EXISTS (
                   SELECT 1
                   FROM OPENJSON(members)
                   WHERE value = @userId
               )
          )
    `);

    // Retornamos true si se eliminó alguna tarea
    return result.recordset.length > 0;
}
