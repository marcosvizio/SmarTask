import { db } from '../db/memory.js';

//Función para encontrar (find) usuarios ingresando los emails
export async function findByEmail(email) {
    return db.users.find(u => u.email === email) || null;
}

//Funcion para crear usuarios ingresando nombre, email y contraseña
export async function create({ name, email, password_hash }) {
    const user = { 
        id: Date.now(), 
        name, 
        email, 
        password_hash
    };
    db.users.push(user);
    return user;
}
