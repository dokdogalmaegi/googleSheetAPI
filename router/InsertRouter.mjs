import express from "express";

import sheetInfo from '../config/sheetInfo.json' assert { type: 'json' };

import { GoogleSheet } from '../googleSheetUtil/GoogleSheet.mjs';
import { isCell } from '../util/ExcelUtil.mjs';
import { SuccessResponseData, FailResponseData } from '../util/ResponseUtil.mjs';

import { appendErrorLog } from "../util/PostgresUtil.mjs"; 

const router = express.Router();

router.post('/one', async (req, res) => {
    try {
        const { location, value } = req.body.data;

        if (!isCell(location)) {
            const notCellLocationValue = new FailResponseData('Must be location variable is cell location\nEx) A34', new Error('Must be location variable is cell location'));
            return res.json(notCellLocationValue.json);
        }

        const googleSheet = new GoogleSheet(sheetInfo.spreadSheetId);
        await googleSheet.insertValueToCell(location, value);

        const returnSuccessValue = new SuccessResponseData(`Success insert ${value} to ${location}`, 'Success');
        return res.json(returnSuccessValue.json);
    } catch(error) {
        console.log(error);
        await appendErrorLog('insert/one', error.message, false);

        const retrunFailValue = new FailResponseData(`Fail insert ${location}`, error);
        return res.json(retrunFailValue.json);
    }
});

router.post('/many', async (req, res) => {
    try {
        const { start: startAlapabet, end: endAlapabet, values } = req.body.data;
    
        if (!isCell(startAlapabet) || !isCell(endAlapabet)) {
            const notCellLocationValue = new FailResponseData('Must be start or end variable is cell location\nEx) A34', new Error('Must be start or end variable is cell location'));
            return res.json(notCellLocationValue.json);
        }
    
        const googleSheet = new GoogleSheet(sheetInfo.spreadSheetId);
        await googleSheet.insertValuesToRow(startAlapabet, endAlapabet, values);

        const returnSuccessValue = new SuccessResponseData(`Success insert ${values} to ${startAlapabet}:${endAlapabet}`, 'Success');
        return res.json(returnSuccessValue.json);
    } catch(error) {
        console.log(error);
        await appendErrorLog('insert/many', error.message, true);

        const retrunFailValue = new FailResponseData(`Fail insert ${startAlapabet}:${endAlapabet}`, error);
        return res.json(retrunFailValue.json);
    }
});

export default router;