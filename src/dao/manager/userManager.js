import { db } from '../db/memory.js';

//Función para encontrar (find) usuarios ingresando los emails
export async function findByEmail(email) {
    return db.users.find(u => u.email === email) || null;
};

//Funcion para crear usuarios ingresando nombre, apellido, fecha de nacimiento, email, numero de telefono y contraseña
export async function create({ first_name, last_name, birthday, email, phone_number, password_hash }) {
    const user = { 
        id: Date.now(), 
        first_name,
        last_name,
        birthday,
        email,
        phone_number,
        password_hash
    };
    db.users.push(user);
    return user;
};
