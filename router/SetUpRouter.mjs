import express from "express";
import fs from 'fs';
import path from 'path';
import moment from "moment";
const __dirname = path.resolve();

import sheetInfo from '../config/sheetInfo.json' assert { type: 'json' };
import ipWhiteList from '../config/ipWhiteList.json' assert { type: 'json' };
import notificationConfig from '../config/notification.json' assert { type: 'json' };

import { GoogleSheet } from '../googleSheetUtil/GoogleSheet.mjs';
import { getNotExpiredNotification, getBlockActionFromNotiKey, deleteAllNotification, appendNotification ,appendErrorLog, appendBlockActionList, getTodayError, setSpreadSheet } from "../util/PostgresUtil.mjs";
import { isCell } from "../util/ExcelUtil.mjs";
import { SuccessResponseData, FailResponseData } from '../util/ResponseUtil.mjs';

const ACTION_TYPE = {
    RELOAD: 'RELOAD',
    BATCH_INSERT: 'BATCH_INSERT',
    NEW_ROW: 'NEW_ROW',
    DELETE_NEW_ROW: 'DELETE_NEW_ROW',
    DELETE_ROW: 'DELETE_ROW',
    CHANGE_EDITOR: 'CHANGE_EDITOR',
};

const router = express.Router();

/**
 * @swagger
 * tags:
 *  name: SetUp
 *  description: sever setting & server config setting
 */

/**
 * @swagger
 * /setUp/alive:
 *  post:
 *      tags: [SetUp]
 *      summary: check server is alive
 *      description: check server is alive
 *      responses:
 *          200:
 *          description: Success
 */
router.post('/alive', (req, res) => {
    const returnSuccessData = new SuccessResponseData(`Success`, `Alive`);
    return res.json(returnSuccessData.json);
});

router.post('/notification', async (req, res) => {
    try {
        const selectNotification = await getNotExpiredNotification();

        const notification = await Promise.all(selectNotification.map(async notification => {
            const { noti_key: notiKey, content, is_danger: isDanger } = notification;
            const blockAction = await getBlockActionFromNotiKey(notiKey);
            
            return {
                value: content,
                isDanger: isDanger,
                blockAction
            };
        }));

        const returnSuccessData = new SuccessResponseData(`Success get notification`, notification);
        return res.json(returnSuccessData.json);
    } catch(error) {
        console.log(error);
        await appendErrorLog('/notification', error.message, false);

        const returnFailData = new FailResponseData(`Internal server error`, error);
        return res.json(returnFailData.json);
    }
});

router.post('/emptyNotification', async (req, res) => {
    try {
        const { password } = req.body.data;

        if (password !== notificationConfig.password) {
            throw Error('Password is not correct');
        }

        await deleteAllNotification();

        const returnSuccessData = new SuccessResponseData(`Success empty notification`, []);
        return res.json(returnSuccessData.json);
    } catch(error) {
        console.log(error);
        await appendErrorLog('/emptyNotification', error.message, false);

        const returnFailData = new FailResponseData(`Fail empty notification`, error);
        return res.json(returnFailData.json);
    }
});

router.post('/addNotification', async (req, res) => {
    try {
        const { id, value, expired, isDanger, blockAction, password } = req.body.data;

        if (password !== notificationConfig.password) {
            throw Error('Password is not correct');
        }

        if (Array.isArray(blockAction)) {
            blockAction.forEach(({action, _}) => {
                if (!ACTION_TYPE[action] && action !== 'ALL') {
                    throw Error('Block action is not correct');
                }    
            })
        }

        await appendNotification(id, value, expired, isDanger);

        await appendBlockActionList(id, blockAction);

        const returnSuccessData = new SuccessResponseData(`Success set up new notification`, value);
        return res.json(returnSuccessData.json);
    } catch(error) {
        console.log(error);
        await appendErrorLog('/addNotification', error.message, false);

        const returnFailData = new FailResponseData(`Fail set up new notification`, error);
        return res.json(returnFailData.json);
    }
});

router.post('/toDayError', async (req, res) => {
    try {
        const { password } = req.body.data;

        if (password !== notificationConfig.password) {
            throw Error('Password is not correct');
        }

        const errorList = await getTodayError();

        const returnSuccessData = new SuccessResponseData(`Success get toDay error`, errorList);
        return res.json(returnSuccessData.json);
    } catch (error) {
        console.log(error);
        await appendErrorLog('/addNotification', error.message, false);

        const returnFailData = new FailResponseData(`Fail get to day error`, error);
        return res.json(returnFailData.json);
    }
});

router.post('/addWhiteList', async (req, res) => {
    try {
        const { value } = req.body.data;

        const isExistsIp = ipWhiteList.whiteList.filter(whiteIp => whiteIp === value);
        if (isExistsIp.length > 0) {
            throw Error('Exists ip in white list');
        } 

        ipWhiteList.whiteList.push(value);
        fs.writeFile(`${__dirname}/config/ipWhiteList.json`, JSON.stringify(ipWhiteList), (err) => {
            if (err) {
                throw err;
            }
        });
        
        const returnSuccessData = new SuccessResponseData(`Success set up new white list`, value);
        return res.json(returnSuccessData.json);
    } catch(error) {
        console.log(error);
        await appendErrorLog('/addWhiteList', error.message, false);

        const returnFailData = new FailResponseData(`Fail set up new white list`, error);
        return res.json(returnFailData.json);
    }
});

router.post('/spreadSheet', async (req, res) => {
    try {
        const { value } = req.body.data;
        await setSpreadSheet(value);
        
        const returnSuccessData = new SuccessResponseData(`Success set up spread sheet id`, value);
        return res.json(returnSuccessData.json);
    } catch(error) {
        console.log(error);
        await appendErrorLog('/spreadSheet', error.message, false);

        const returnFailData = new FailResponseData(`Fail set up spread sheet id`, error);
        return res.json(returnFailData.json);
    }
});

router.post('/header', async (req, res) => {
    try {
        const { start: startOfHeaderCell, end: endOfHeaderCell } = req.body.data;

        if (!isCell(startOfHeaderCell) || !isCell(endOfHeaderCell)) {
            const notCellLocationValue = new FailResponseData('Must be start or end variable is cell location\nEx) A34', new Error('Must be start or end variable is cell location'));
            return res.json(notCellLocationValue.json);
        }

        const googleSheet = new GoogleSheet(sheetInfo.spreadSheetId);
        const returnSuccessData = new SuccessResponseData(`Success select header column list`, await googleSheet.getHeaderColumnFromTwoRows(startOfHeaderCell, endOfHeaderCell));

        return res.json(returnSuccessData.json);
    } catch(error) {
        console.log(error);
        await appendErrorLog('/header', error.message, true);

        const retrunFailValue = new FailResponseData(`Fail select header column list`, error);
        return res.json(retrunFailValue.json);
    }
})

export default router;