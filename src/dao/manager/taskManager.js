import { db } from '../db/memory.js';
import { getTid } from '../utils/idUtils.js'

//Funcion para enlistar las tareas segun el userId
export async function listByUser(userId /* 10 */) {
    return db.tasks.filter(t => t.userId === userId);
};

//Funcion para crear tareas segun el userId, insertando el titulo de la tarea y su status
export async function create(userId, { title, description, fecha_inicio, fecha_vencimiento, prioridad, status }) {

    if (!title || !description || !fecha_inicio || !fecha_vencimiento || !prioridad || !status) {
        console.log("Faltó completar un dato!");
        return null; 
    }

    const task = { 
        taskId: Date.now(),
        userId,
        title,
        description,
        fecha_inicio,
        fecha_vencimiento,
        prioridad,
        fecha_creacion: new Date(),
        status: status || 'Pendiente'
    };

    db.tasks.push(task);
    return task;

};


//Funcion para actualizar tareas segun el userId y tambien el taskId de la tarea y su parche.
export async function update(userId, id, patch) {
    const uid = Number(userId);
    const tid = Number(id);

    let changed = false;
    db.tasks = db.tasks.map(t => {
        if (getTid(t) === tid && Number(t.userId) === uid) {
        changed = true;
        return { ...t, ...patch };
        }
        return t;
    });
    return changed;
};


//Funcion para borrar tareas segun el userId y tambien el taskId de la tarea.
export async function remove(userId, id) {
  const uid = Number(userId);
  const tid = Number(id);

  const before = db.tasks.length;
  const filtered = db.tasks.filter(t => !(getTid(t) === tid && Number(t.userId) === uid));
  db.tasks.splice(0, db.tasks.length, ...filtered);
  return db.tasks.length !== before;
};

