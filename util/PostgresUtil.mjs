import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "postgres",
    password: "password",
    port: 5432
});

pool.connect();

const SELECT_QUERY_TAMPLTE = {
    NOTIFICATION: `
        SELECT NT.NOTI_KEY, NT.NOTI_ID, NT.CONTENT, TO_CHAR(NT.EXPIRED, 'YYYY-MM-DD HH:mm:ss'), IS_DANGER
        FROM NOTIFICATION NT
        WHERE 1=1
    `,
    BLOCKED_ACTION: `
        SELECT BA.NOTI_KEY, BA.FIX_VERSION, BA.ACTION
        FROM BLOCKED_ACTION BA
        WHERE 1=1
    `
}

export const getNotification = async () => {
    const result = await pool.query(SELECT_QUERY_TAMPLTE.NOTIFICATION);
    
    return result.rows;
}

export const getNotificationWhere = async (filterList = []) => {
    const where = filterList.map(filter => {
        return `  AND ${filter}`;
    });

    const queryString = `
        ${SELECT_QUERY_TAMPLTE.NOTIFICATION}
        ${where}
    `;
    const result = await pool.query(queryString)

    return result.rows;
}

export const getNotExpiredNotification = async () => {
    return await getNotificationWhere(['NT.EXPIRED >= NOW()']);
}

export const getBlockAction = async () => {
    const result = await pool.query(SELECT_QUERY_TAMPLTE.BLOCKED_ACTION);

    return result.rows;
}