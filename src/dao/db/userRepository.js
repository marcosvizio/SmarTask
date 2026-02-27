import { getConnection, sql } from './db.js';

export async function findByEmail(email) {
    const pool = await getConnection();

    const result = await pool.request()
        .input('email', sql.NVarChar, email)
        .query('SELECT * FROM Users WHERE email = @email');

    return result.recordset[0] || null;
}

export async function create({ first_name, last_name, birthday, email, phone_number, password_hash }) {
    const pool = await getConnection();

    const result = await pool.request()
        .input('first_name', sql.NVarChar, first_name)
        .input('last_name', sql.NVarChar, last_name)
        .input('birthday', sql.Date, birthday)
        .input('email', sql.NVarChar, email)
        .input('phone_number', sql.NVarChar, phone_number)
        .input('password_hash', sql.NVarChar, password_hash)
        .query(`
            INSERT INTO Users (first_name, last_name, birthday, email, phone_number, password_hash)
            OUTPUT INSERTED.*
            VALUES (@first_name, @last_name, @birthday, @email, @phone_number, @password_hash)
        `);

    return result.recordset[0];
}

export async function findById(id) {
    const pool = await getConnection();

    const result = await pool.request()
        .input('id', sql.Int, id)
        .query('SELECT * FROM Users WHERE id = @id');

    return result.recordset[0] || null;
}

export async function findByIdAndUpdate({ id, first_name, last_name, birthday, email, phone_number, password_hash }) {
    const pool = await getConnection();
    const request = pool.request()
        .input('id', sql.Int, id)
        .input('first_name', sql.NVarChar, first_name)
        .input('last_name', sql.NVarChar, last_name)
        .input('email', sql.NVarChar, email);

    let query = `
        UPDATE Users
        SET first_name = @first_name,
            last_name = @last_name,
            email = @email
    `;

    if (birthday) {
        request.input('birthday', sql.Date, birthday);
        query += `,
            birthday = @birthday
        `;
    }

    if (phone_number) {
        request.input('phone_number', sql.NVarChar, phone_number);
        query += `,
            phone_number = @phone_number
        `;
    }

    if (password_hash) {
        request.input('password_hash', sql.NVarChar, password_hash);
        query += `,
            password_hash = @password_hash
        `;
    }

    query += `
        OUTPUT INSERTED.*
        WHERE id = @id
    `;

    const result = await request.query(query);

    if (result.recordset.length === 0) {
        throw new Error("User not found");
    }

    return result.recordset[0];
}

export async function findByIdAndDelete(id) {
    const pool = await getConnection();

    const result = await pool.request()
        .input('id', sql.Int, id)
        .query(`
            DELETE FROM Users
            OUTPUT DELETED.*
            WHERE id = @id
        `);

    if (result.recordset.length === 0) {
        throw new Error("User not found");
    }

    return result.recordset[0];
}


export async function getAllUsersWithRelations() {
    const pool = await getConnection();

    const result = await pool.request().query(`
        SELECT 
            u.id,
            u.first_name,
            u.last_name,
            u.birthday,
            u.email,
            u.phone_number,
            u.role,
            t.task_id,
            t.title,
            n.notification_id,
            n.asunto
        FROM Users u
        LEFT JOIN Tasks t ON t.user_id = u.id
        LEFT JOIN Notifications n ON n.user_id = u.id
        ORDER BY u.id
    `);

    const rows = result.recordset;

    const usersMap = {};

    for (const row of rows) {

        if (!usersMap[row.id]) {
            usersMap[row.id] = {
                id: row.id,
                first_name: row.first_name,
                last_name: row.last_name,
                birthday: row.birthday,
                email: row.email,
                phone_number: row.phone_number,
                role: row.role,
                tasks: [],
                notifications: []
            };
        }

        // Agregar tarea si existe
        if (row.task_id) {
            if (!usersMap[row.id].tasks.some(t => t.taskId === row.task_id)) {
                usersMap[row.id].tasks.push({
                    taskId: row.task_id,
                    title: row.title
                });
            }
        }

        if (row.notification_id) {
            if (!usersMap[row.id].notifications.some(n => n.notificationId === row.notification_id)) {
                usersMap[row.id].notifications.push({
                    notificationId: row.notification_id,
                    asunto: row.asunto
                });
            }
        }
    }

    return Object.values(usersMap);
}


export async function updateUserPassword(userId, password) {
    const pool = await getConnection();

    await pool.request()
        .input("userId", sql.Int, userId)
        .input("password", sql.NVarChar, password)
        .query(`
            UPDATE Users
            SET password_hash = @password
            WHERE id = @userId
        `);
}
