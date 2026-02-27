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
        password_hash,
        role: 'user'
    };
    db.users.push(user);
    return user;
};

//Funcion para buscar usuarios desde su ID
export async function findById(id) {
    return db.users.find(u => u.id === id) || null;
}

//Funcion para buscar usuarios desde su ID y updateamos sus datos
export async function findByIdAndUpdate({ id, first_name, last_name, birthday, email, phone_number, password_hash}) {

    const user = db.users.find(u => u.id == id);

    if (!user) {
        throw new Error("User not found");
    }

    user.first_name = first_name;
    user.last_name = last_name;
    user.birthday = birthday;
    user.email = email;
    user.phone_number = phone_number;
    user.password_hash = password_hash;

    return user;
}

// Funcion para admin pueda solicitar todos los usuarios en su vista
export async function getAllUsersWithRelations() {

  return db.users.map(user => {

    const tasks = db.tasks.filter(t => t.userId === user.id);
    const notifications = db.notifications.filter(n => n.userId === user.id);

    const { password_hash, ...safeUser } = user;

    return {
      ...safeUser,
      tasks,
      notifications
    };
  });
  
}

// Funcion para eliminar usuario por ID
export async function findByIdAndDelete(id) {

    const index = db.users.findIndex(u => u.id === id);

    if (index === -1) {
        throw new Error("User not found");
    }

    // guardamos el usuario antes de eliminarlo
    const deletedUser = db.users[index];

    // lo eliminamos del array
    db.users.splice(index, 1);

    return deletedUser;
}