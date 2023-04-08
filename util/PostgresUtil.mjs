import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "postgres",
    password: "password",
    port: 5432
});

const SELECT_QUERY_TAMPLTE = {
    NOTIFICATION: `
        SELECT NT.NOTI_KEY, NT.NOTI_ID, NT.CONTENT, TO_CHAR(NT.EXPIRED, 'YYYY-MM-DD HH:mm:ss') EXPIRED, IS_DANGER
        FROM NOTIFICATION NT
        WHERE 1=1
    `,
    BLOCKED_ACTION: `
        SELECT BA.FIX_VERSION "fixVersion", BA.ACTION
        FROM BLOCKED_ACTION BA
        WHERE 1=1
    `,
}

export const getNotification = async () => {
    try {
        await pool.connect();

        const result = await pool.query(SELECT_QUERY_TAMPLTE.NOTIFICATION);

        return result.rows;
    } catch (err) {
        console.log(err);

        throw err;
    } finally {
        await pool.end();
    }
}

export const getNotificationWhere = async (filterList = []) => {
    try {
        await pool.connect();

        const where = filterList.map(filter => {
            return `  AND ${filter}`;
        });
    
        const queryString = `
            ${SELECT_QUERY_TAMPLTE.NOTIFICATION}
            ${where}
        `;
        const result = await pool.query(queryString)
    
        return result.rows;
    } catch (err) {
        console.log(err);

        throw err;
    } finally {
        await pool.end();
    }
}

export const getNotExpiredNotification = async () => {
    return await getNotificationWhere(['NT.EXPIRED >= NOW()']);
}

export const getBlockActionWhere = async (filterList = []) => {
    try {
        await pool.connect();
     
        const where = filterList.map(filter => {
            return `  AND ${filter}`;
        });
    
        const queryString = `
            ${SELECT_QUERY_TAMPLTE.BLOCKED_ACTION}
            ${where}
        `;
    
        const result = await pool.query(queryString);
    
        return result.rows;
    } catch (err) {
        console.log(err);

        throw err;
    } finally {
        await pool.end();
    }
}

export const getBlockActionFromNotiKey = async (notiKey) => {
    return await getBlockActionWhere([`BA.NOTI_KEY = ${notiKey}`]);
}

export const deleteAllNotification = async () => {
    const queryString = `
        DELETE FROM NOTIFICATION WHERE 1=1
    `;

    await pool.query(queryString);   
}

export const appendErrorLog = async (functionName, message, isDanger) => {
    try {
        await pool.connect();

        const queryString = `
            INSERT INTO ERROR_LOG
            (FUN_NAME, FIRE_DATE, MESSAGE, IS_DANGER) 
            VALUES (${functionName}, NOW(), ${message}, ${isDanger});
        `;

        await pool.query(queryString);
    } catch (e) {
        console.log(e);
    } finally {
        await pool.end();
    }
}