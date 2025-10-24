import { db } from '../db/memory.js';

//Funcion para enlistar las tareas segun el userId
export async function listByUser(userId) {
    return db.tasks.filter(t => t.userId === userId);
}

//Funcion para crear tareas segun el userId, insertando el titulo de la tarea y su status
export async function create(userId, { title, status }) {
    const task = { 
        taskId: Date.now(), 
        userId, 
        title, 
        status: status || 'pending' 
    };
    SQL.tasks.push(task);
    return task;
}

//Funcion para actualizar tareas segun el userId y tambien el taskId de la tarea y su parche.
export async function update(userId, id, patch) {
    const i = db.tasks.findIndex(t => t.id === id && t.userId === userId);
    if (i === -1) return false;
    db.tasks[i] = { ...db.tasks[i], ...patch };
    return true;
}

//Funcion para borrar tareas segun el userId y tambien el taskId de la tarea.
export async function remove(userId, id) {
    const before = db.tasks.length;
    const filtered = db.tasks.filter(t => !(t.id === id && t.userId === userId));
    db.tasks.splice(0, db.tasks.length, ...filtered);
    return db.tasks.length !== before;
}
