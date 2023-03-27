import express from "express";
import fs from 'fs';
import path from 'path';
const __dirname = path.resolve();

import sheetInfo from '../config/sheetInfo.json' assert { type: 'json' };

import { GoogleSheet } from '../googleSheetUtil/GoogleSheet.mjs';
import { isCell } from "../util/ExcelUtil.mjs";
import { SuccessResponseData, FailResponseData } from '../util/ResponseUtil.mjs';

const router = express.Router();

router.post('/spreadSheet', (req, res) => {
    const { value } = req.body.data;
    sheetInfo.spreadSheetId = value;

    try {
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
    const { start: startOfHeaderCell, end: endOfHeaderCell } = req.body.data;

    if (!isCell(startOfHeaderCell) || !isCell(endOfHeaderCell)) {
        const notCellLocationValue = new FailResponseData('Must be start or end variable is cell location\nEx) A34', new Error('Must be start or end variable is cell location'));
        return res.json(notCellLocationValue.json);
    }

    try {
        const googleSheet = new GoogleSheet(sheetInfo.spreadSheetId);
        await googleSheet.getHeaderColumnFromTwoRows(startOfHeaderCell, endOfHeaderCell);

        const returnSuccessData = new SuccessResponseData(`Success select header column list`, 'Success');
        return res.json(returnSuccessData.json);
    } catch(error) {
        const retrunFailValue = new FailResponseData(`Fail select header column list`, error);

        console.log(error);
        return res.json(retrunFailValue.json);
    }
})

export default router;