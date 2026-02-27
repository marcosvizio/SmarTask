import sql from 'mssql';

const config = {
    user: 'smartask_user',
    password: '4783',
    server: '127.0.0.1',
    port: 1433,
    database: 'SmarTaskDB',
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

export const getConnection = async () => {
    try {
        const pool = await sql.connect(config);
        console.log("✅ Conectado a SQL Server");
        return pool;
    } catch (error) {
        console.error("❌ Error DB:", error);
    }
};

export { sql };