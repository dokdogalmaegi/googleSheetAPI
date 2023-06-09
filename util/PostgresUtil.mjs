import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
    user: "postgres",
    host: "10.98.20.240",
    database: "postgres",
    password: "password",
    port: 5432
});

pool.connect();

const SELECT_QUERY_TAMPLTE = {
    NOTIFICATION: `
        SELECT NT.NOTI_KEY, NT.NOTI_ID, NT.CONTENT, TO_CHAR(NT.EXPIRED, 'YYYY-MM-DD HH24:MI:ss') EXPIRED, IS_DANGER
        FROM NOTIFICATION NT
        WHERE 1=1
    `,
    BLOCKED_ACTION: `
        SELECT BA.FIX_VERSION "fixVersion", BA.ACTION
        FROM BLOCKED_ACTION BA
        WHERE 1=1
    `,
};

export const getSpreadSheet = async () => {
    const queryString = `
        SELECT VALUE
        FROM CONFIG
        WHERE CONF_ID = 'SHEET_ID'
    `;

    const result = await pool.query(queryString);

    return result?.rows[0]?.value;
};

export const setSpreadSheet = async (spreadSheetId) => {
    const currentSheetId = await getSpreadSheet();

    if (currentSheetId === spreadSheetId) {
        throw Error('Same sheet id');
    }

    const queryString = `
        UPDATE CONFIG 
        SET 
            VALUE = '${spreadSheetId}' 
        WHERE CONF_ID = 'SHEET_ID';
    `;

    await pool.query(queryString);
}

export const getNotification = async () => {
    const result = await pool.query(SELECT_QUERY_TAMPLTE.NOTIFICATION);

    return result.rows;
};

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
};

export const getNotExpiredNotification = async () => {
    return await getNotificationWhere(['NT.EXPIRED >= NOW()']);
};

export const getBlockActionWhere = async (filterList = []) => {
    const where = filterList.map(filter => {
        return `  AND ${filter}`;
    });

    const queryString = `
        ${SELECT_QUERY_TAMPLTE.BLOCKED_ACTION}
        ${where}
    `;

    const result = await pool.query(queryString);

    return result.rows;
};

export const getBlockActionFromNotiKey = async (notiKey) => {
    return await getBlockActionWhere([`BA.NOTI_KEY = ${notiKey}`]);
};

export const deleteAllNotification = async () => {
    const queryString = `
        DELETE FROM NOTIFICATION WHERE 1=1
    `;

    await pool.query(queryString);   
};

export const appendErrorLog = async (functionName, message, isDanger) => {
    const queryString = `
        INSERT INTO ERROR_LOG
        (FUN_NAME, FIRE_DATE, MESSAGE, IS_DANGER) 
        VALUES ('${functionName}', NOW(), '${message.substring(0, 3999)}', '${isDanger}');
    `;

    await pool.query(queryString);
};

export const appendNotification = async (notiId, value, expiredDate, isDanger) => {
    const queryString = `
        INSERT INTO NOTIFICATION 
        (NOTI_ID, CONTENT, EXPIRED, IS_DANGER) 
        VALUES ('${notiId}', '${value}', '${expiredDate}', ${isDanger})
    `;

    await pool.query(queryString);
};

export const appendBlockAction = async (notiId, fixVersion, action) => {
    const notification = await getNotificationWhere([`NT.NOTI_ID = ${notiId}`]);
    const notiKey = notification.rows.noti_key;

    const queryString = `
        INSERT INTO BLOCKED_ACTION 
        (NOTI_KEY, FIX_VERSION, ACTION) 
        VALUES (${notiKey}, '${fixVersion}', '${action}')
    `;

    await pool.query(queryString);
}

export const appendBlockActionList = async (notiId, blockActionList) => {
    const notification = await getNotificationWhere([`NT.NOTI_ID = '${notiId}'`]);
    const notiKey = notification[0].noti_key;

    let appendValues = 'VALUES '
    blockActionList.forEach(({fixVersion, action}, idx) => {
        let blockActionValue = `(${notiKey}, '${fixVersion}', '${action}')`;
        if (blockActionList.length - 1 !== idx) {
            blockActionValue = `${blockActionValue},`;
        }

        appendValues = `${appendValues} ${blockActionValue}`;
    });

    const queryString = `
        INSERT INTO BLOCKED_ACTION 
        (NOTI_KEY, FIX_VERSION, ACTION)
        ${appendValues}
    `;

    console.log(queryString);

    await pool.query(queryString);
}

export const getTodayError = async () => {
    const queryString = `
        SELECT EL.FUN_NAME, TO_CHAR(EL.FIRE_DATE, 'YYYY-MM-DD HH24:MI:ss') FIRE_DATE, EL.MESSAGE, EL.IS_DANGER
        FROM ERROR_LOG EL
        WHERE TO_CHAR(EL.FIRE_DATE, 'YYYY-MM-DD') = TO_CHAR(NOW(), 'YYYY-MM-DD')
        ORDER BY FIRE_DATE DESC
    `;

    const result = await pool.query(queryString);

    return result.rows
}