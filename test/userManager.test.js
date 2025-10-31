import { resetDb } from './setup/resetDb.js';

/* Importamos todas las funciones que tenemos en userManager y lo guardamos como users */
import * as users from '../src/dao/manager/userManager.js';

import { expect, jest } from '@jest/globals';

describe('userManager', () => {
  beforeEach(() => {
    resetDb();

    // Aca determinamos un valor a la funcion Date.now() = 1730291111111 que es la que se ejecuta cuando se crea el usuario y le asigna un ID
    jest.spyOn(Date, 'now').mockReturnValue(1730291111111);
  });
  afterEach(() => jest.restoreAllMocks());

  /* Aca empieza el test que nombramos Create y FindByEmail, tal cual como las funciones que vamos a testear */
  test('create y findByEmail', async () => {

    /* Aca en la constante "u" llamamos a la funcion create y le pasamos los parametros correspondientes, sin que falte ninguno */
    const u = await users.create({
      first_name: 'Marcos',
      last_name: 'Vizio',
      birthday: '1995-01-01',
      email: 'marcos@test.com',
      phone_number: '123',
      password_hash: 'hashdemo'
    });

    /* Aca se espera que la propiedad ID de la constante que es un objeto, "u.id", sea igual a 1730291111111 */
    expect(u.id).toBe(1730291111111);

    /* Aca la constante "found", llama a la funcion findByEmail y se ingresa el email que queremos corroborar */
    const found = await users.findByEmail('marcos@test.com');

    /* Aca se espera que la constante found que tiene el objeto que encontramos segun el email que encontramos, que no sea NULL */
    expect(found).not.toBeNull();

    /* Aca se espera que el objeto que encontramos segun el email, su primer nombre sea "Marcos" */
    expect(found.first_name).toBe('Marcos');

    /* Aca la constante notFound, llama a la funcion findByEmail y no encuentra ningun usuario con ese email */
    const notFound = await users.findByEmail('otro@test.com');

    /* Aca se espera que la constante notFound sea igual a NULL */
    expect(notFound).toBeNull();
  });
});
