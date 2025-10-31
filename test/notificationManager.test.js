import { resetDb } from './setup/resetDb.js';

/* Importamos todas las funciones que tenemos en userManager y lo guardamos como users */
import * as notifications from '../src/dao/manager/notificationManager.js';

import { expect, jest } from '@jest/globals';


describe('notificationManager', () => {
  beforeAll(() => {
    // Aca dice que antes de todos los tests, congele el tiempo y hace que el sistema crea que hoy es el 30 de octubre de 2025 a las 12:00 (UTC).
    jest.useFakeTimers().setSystemTime(new Date('2025-10-30T12:00:00Z'));
  });
  afterAll(() => jest.useRealTimers());

  beforeEach(() => {
    resetDb();
    /* Aca determinamos un valor a la funcion Date.now() = 1730292222222 que es la que se ejecuta cuando se crea la notificacion y le asigna un ID */
    jest.spyOn(Date, 'now').mockReturnValue(1730292222222);
  });
  afterEach(() => jest.restoreAllMocks());

  /* El test este es para programar una notificacion, crea si no existe y actualiza si ya existe (1:1 por tarea) */
  test('programarNotificacion', async () => {

    /* Aca creamos al taskId y le asignamos el valor de 101 */
    const taskId = 101;

    // Aca en la constante "n1", llamamos a la funcion "programarNotificacion" para crear una notificacion.
    const n1 = await notifications.programarNotificacion({
      taskId,
      asunto: 'Recordatorio',
      mensaje: 'Vence pronto',
      fecha_envio: '2025-10-31T10:00:00Z',
      canal: 'APP'
    });

    /* Aca se hacemos las validaciones para ver si todos los datos llegaron como deberian, desde el "notificationId" sea igual a 1730292222222 */
    expect(n1.notificationId).toBe(1730292222222);

    /* Aca se espera que el "taskId" sea igual a la constante que de la linea 27 "const taskId = 101;" */
    expect(n1.taskId).toBe(taskId);

    /* Aca se espera que la propiedad de cancelada siga en false como cuando se crea */
    expect(n1.cancelada).toBe(false);

    // Aca creamos a la constante "n2" que va a llamar a la funcion "programarNotificacion" y esta actualiza/reprograma a la misma notificación
    const n2 = await notifications.programarNotificacion({
      taskId,
      asunto: 'Recordatorio actualizado',
      mensaje: 'Cambia hora',
      fecha_envio: '2025-10-31T12:00:00Z',
      canal: 'APP'
    });

    /* Aca se hacemos las validaciones para ver si todos los datos llegaron como deberian, desde el "notificationId" sea igual a 1730292222222 */
    expect(n2.notificationId).toBe(1730292222222);
    /* PERO el asunto cambio como tambien la hora de la propiedad fecha_envio */
    expect(n2.asunto).toBe('Recordatorio actualizado');
  });

  /* El test este es para cancelar una notificacion: true si existe, false si no */
  test('cancelarNotificacion', async () => {
    /* Aca creamos al taskId y le asignamos el valor de 202 */
    const taskId = 202;

    /* Aca llamamos a la funcion programarNotificacion y le creamos una notificacion a la tarea con taskId: 202 */
    await notifications.programarNotificacion({
      taskId,
      asunto: 'R',
      mensaje: 'M',
      fecha_envio: '2025-10-31T10:00:00Z'
    });

    /* Aca llamamos a la funcion cancelarNotificacion, le enviamos como parametro el taskId, una vez que encuentra a la notifacion con la propiedad taskId: 202, lo agarra y borra */
    const ok = await notifications.cancelarNotificacion(taskId);
    expect(ok).toBe(true);

    /* Aca hacemos lo mismo que arriba pero como resultado nos va a dar false ya que no hay ninguna notificacion con ese taskId */
    const again = await notifications.cancelarNotificacion(999);
    expect(again).toBe(false);
  });


  /* El test este es para devolver una notificacion: devuelve la notificación asociada (o null) */
  test('getNotificacionByTask', async () => {

    /* Aca creamos al taskId y le asignamos el valor de 303 */
    const taskId = 303;

    /* Aca llamamos a la funcion programarNotificacion y le creamos una notificacion a la tarea con taskId: 303 */
    await notifications.programarNotificacion({
      taskId,
      asunto: 'Algo',
      mensaje: 'Mensaje',
      fecha_envio: '2025-11-01T09:00:00Z'
    });

    /* Aca en la constante "n", se llama a la funcion getNotificacionByTask y se envia como parametro el taskId: 303*/
    const n = notifications.getNotificacionByTask(taskId);
    /* Se espera que de igual a true, no null ni false */
    expect(n).toBeTruthy();
    /* Y se espera que la notificacion que agarramos la propiedad taskId: 303 sea igual a la constante que le pasamos taskId */
    expect(n.taskId).toBe(taskId);

    const none = notifications.getNotificacionByTask(999);
    expect(none).toBeNull();
  });

  /* El test este es para probar la funcion venceProntoNotificacion: true si la fecha está dentro de 24h, false si ya pasó o está lejos */
  test('venceProntoNotificacion', () => {
    // ahora = 2025-10-30T12:00Z
    expect(notifications.venceProntoNotificacion('2025-10-31T06:00:00Z', 24)).toBe(true);  // faltan 18h
    expect(notifications.venceProntoNotificacion('2025-10-30T10:00:00Z', 24)).toBe(false); // ya pasó
    expect(notifications.venceProntoNotificacion('2025-11-02T12:00:00Z', 24)).toBe(false); // lejos
  });

  /* El test este es para probar la funcion RecordatorioNotificacion: sarma mensaje de texto*/
  test('recordatorioNotificacion', () => {
    const msg = notifications.recordatorioNotificacion('Marcos', 'Entregar TFI', '2025-10-31T15:30:00Z');
    expect(msg).toContain('Marcos');
    expect(msg).toContain('Entregar TFI');
    expect(msg).toMatch(/\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}/);
  });
});
