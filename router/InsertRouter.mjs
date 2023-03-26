import express from "express";

import sheetInfo from '../config/sheetInfo.json' assert { type: 'json' };

import { GoogleSheet } from '../googleSheetUtil/GoogleSheet.mjs';
import { isCell } from '../util/ExcelUtil.mjs';
import { SuccessResponseData, FailResponseData } from '../util/ResponseUtil.mjs';

const router = express.Router();

router.post('/one', async (req, res) => {
    const { location, value } = req.body.data;

    if (!isCell(location)) {
        const notCellLocationValue = new FailResponseData('Must be location variable is cell location\nEx) A34', new Error('Must be location variable is cell location'));
        return res.json(notCellLocationValue.json);
    }

    const googleSheet = new GoogleSheet(sheetInfo.spreadSheetId);
    try {
        await googleSheet.insertValueToCell(location, value);

        const returnSuccessValue = new SuccessResponseData(`Success insert ${value} to ${location}`, 'Success');
        return res.json(returnSuccessValue.json);
    } catch(error) {
        const retrunFailValue = new FailResponseData(`Fail insert ${location}`, error);

        console.log(error);
        return res.json(retrunFailValue.json);
    }
});

export default router;