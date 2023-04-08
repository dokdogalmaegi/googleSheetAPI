import express from "express";
import fs from 'fs';
import path from 'path';
import moment from "moment";
const __dirname = path.resolve();

import sheetInfo from '../config/sheetInfo.json' assert { type: 'json' };
import ipWhiteList from '../config/ipWhiteList.json' assert { type: 'json' };
import notification from '../config/notification.json' assert { type: 'json' };

import { GoogleSheet } from '../googleSheetUtil/GoogleSheet.mjs';
import { getNotExpiredNotification, getBlockAction } from "../util/PostgresUtil.mjs";
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

router.post('/alive', (req, res) => {
    const returnSuccessData = new SuccessResponseData(`Success`, `Alive`);
    return res.json(returnSuccessData.json);
});


router.post('/notification', async (req, res) => {
    try {
        console.log(await getNotExpiredNotification());

        console.log(await getBlockAction());

        const validList = notification.list.filter(noti => moment(noti.date).isBefore(moment().format('YYYY-MM-DD HH:mm:ss')));

        const returnSuccessData = new SuccessResponseData(`Success get notification`, notification.list);
        return res.json(returnSuccessData.json);
    } catch(error) {
        console.log(error);

        const returnFailData = new FailResponseData(`Internal server error`, error);
        return res.json(returnFailData.json);
    }
});

router.post('/emptyNotification', (req, res) => {
    try {
        const { password } = req.body.data;

        if (password !== notification.password) {
            throw Error('Password is not correct');
        }

        notification.list = [];
        fs.writeFile(`${__dirname}/config/notification.json`, JSON.stringify(notification), (err) => {
            if (err) {
                throw err;
            }
        });

        const returnSuccessData = new SuccessResponseData(`Success empty notification`, notification.list);
        return res.json(returnSuccessData.json);
    } catch(error) {
        console.log(error);

        const returnFailData = new FailResponseData(`Fail empty notification`, error);
        return res.json(returnFailData.json);
    }
});

router.post('/addNotification', (req, res) => {
    try {
        const { value, date, isDanger, blockAction, password } = req.body.data;

        if (password !== notification.password) {
            throw Error('Password is not correct');
        }

        if (Array.isArray(blockAction)) {
            blockAction.forEach(({element, _}) => {
                if (!ACTION_TYPE[element] && element !== 'all') {
                    throw Error('Block action is not correct');
                }    
            })
        }

        notification.list.push({
            value, date: moment(date).format('YYYY-MM-DD HH:mm:ss'), isDanger, blockAction
        });
        fs.writeFile(`${__dirname}/config/notification.json`, JSON.stringify(notification), (err) => {
            if (err) {
                throw err;
            }
        });

        const returnSuccessData = new SuccessResponseData(`Success set up new notification`, value);
        return res.json(returnSuccessData.json);
    } catch(error) {
        console.log(error);

        const returnFailData = new FailResponseData(`Fail set up new notification`, error);
        return res.json(returnFailData.json);
    }
});

router.post('/addWhiteList', (req, res) => {
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

        const returnFailData = new FailResponseData(`Fail set up new white list`, error);
        return res.json(returnFailData.json);
    }
});

router.post('/spreadSheet', (req, res) => {
    try {
        const { value } = req.body.data;
        sheetInfo.spreadSheetId = value;

        fs.writeFile(`${__dirname}/config/sheetInfo.json`, JSON.stringify(sheetInfo), (err) => {
            if (err) {
                throw err;
            }
        });
        
        const returnSuccessData = new SuccessResponseData(`Success set up spread sheet id`, value);
        return res.json(returnSuccessData.json);
    } catch(error) {
        console.log(error);

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
        const retrunFailValue = new FailResponseData(`Fail select header column list`, error);

        console.log(error);
        return res.json(retrunFailValue.json);
    }
})

export default router;