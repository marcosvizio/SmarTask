import { resetDb } from './setup/resetDb.js';
import { db } from '../src/dao/db/memory.js';

/* Importamos todas las funciones que tenemos en taskManager y lo guardamos como tasks */
import * as tasks from '../src/dao/manager/taskManager.js';

import { expect, jest } from '@jest/globals';

describe('taskManager', () => {
  beforeEach(() => {
    resetDb();
    // Aca determinamos un valor a la funcion Date.now() = 1730290000000 que es la que se ejecuta cuando se crea la tarea y le asigna un ID
    jest.spyOn(Date, 'now').mockReturnValue(1730290000000);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  /* Aca empieza el test que nombramos Create y ListByUser, tal cual como las funciones que vamos a testear */
  test('Create y ListByUser', async () => {
    
    /* Aca creamos al user1 y le asignamos el id = 10 */
    const user1 = 10;

    /* Aca en la constante task1 llamamos a la funcion create y le pasamos los parametros correspondientes, sin que falte ninguno */
    const task1 = await tasks.create(user1, {
        title: 'Tarea A',
        description: 'desc A',
        fecha_inicio: '2025-10-30',
        fecha_vencimiento: '2025-11-01',
        prioridad: 'Alta',
        status: 'Pendiente'
    });

    /* Aca en la constante task1 llamamos a la funcion create y le pasamos los parametros incompletos faltando prioridad */
    const task2 = await tasks.create(user1, {
        title: 'Tarea A',
        description: 'desc A',
        fecha_inicio: '2025-10-30',
        fecha_vencimiento: '2025-11-01',
        status: 'Pendiente'
    });

    /* Aca en la constante task1 llamamos a la funcion create y le pasamos los parametros correspondientes, sin que falte ninguno */
    const task3 = await tasks.create(user1, {
        title: 'Tarea A',
        description: 'desc A',
        fecha_inicio: '2025-10-30',
        fecha_vencimiento: '2025-11-01',
        prioridad: 'Alta',
        status: 'Pendiente'
    });

    /* Aca nosotros creamos la constante listU1 y dentro de ella llamamos a la funcion listByUser y le pasamos como parametro user1 = 10 */
    const listU1 = await tasks.listByUser(user1);

    /* Aca el codigo espera que la longitud de la lista de tareas del user1 sea igual a 1 */
    expect(listU1).toHaveLength(1);

    /* Aca el codigo mapea la lista de tareas del user1 y espera que haya una tarea que su TITLE sea igual a 'Tarea A' */
    expect(listU1.map(t => t.title)).toEqual(expect.arrayContaining(['Tarea A']));

    /* Se espera que task1.taskUd sea igual a 1730290000000, que nosotros lo asignamos anteriormente en la linea 11 */
    expect(task1.taskId).toBe(1730290000000);
  });



  /* Aca empieza el test que nombramos Update y Remove, las funciones que queremos testear en principal son update y remove */
  test('update y remove', async () => {

    /* Aca creamos al user y le asignamos el id = 99 */
    const u = 99;

    /* Aca en la constante task1 llamamos a la funcion create y le pasamos los parametros correspondientes, sin que falte ninguno */
    const t = await tasks.create(u, {
      title: 'Original',
      description: 'desc',
      fecha_inicio: '2025-10-30',
      fecha_vencimiento: '2025-11-01',
      prioridad: 'Media',
      status: 'Pendiente'
    });
    

    /* Aca en la constante okUpdate, llamamos a la funcion update y pasamos el id del user, el id de la tarea y en body, pasamos el nuevo titulo y estado*/
    const okUpdate = await tasks.update(u, t.taskId, { title: 'Editada', status: 'Hecho' });

    /* Aca se espera que la constante okUpdate donde llamamos la funciones y se updatea todo ok y da igual a "true"  */
    expect(okUpdate).toBe(true);

    /* Aca en la constante after, se busca en el array de tareas, la tarea que modificamos segun si ID y queda guardada como objeto {title:"",etc...} */
    const after = db.tasks.find(x => x.taskId === t.taskId);

    /* Aca se espera que la constante after, tenga en la propiedad de title:"Editada" y en la propiedad de status:"Hecho" */
    expect(after.title).toBe('Editada');
    expect(after.status).toBe('Hecho');

    /* Aca se crea la constante okRemove, se llama a la funcion remove, y le pasamos como parametro el ID de usuario y el ID de la tarea */
    const okRemove = await tasks.remove(u, t.taskId);

    /* Se espera que se haya podido remover la tarea y cuando lo buscas con el ID de la tarea, sea igual a Undefined ya que fue borrada */
    expect(okRemove).toBe(true);
    expect(db.tasks.find(x => x.taskId === t.taskId)).toBeUndefined();
  });
});
