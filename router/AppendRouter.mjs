import express from "express";

import sheetInfo from '../config/sheetInfo.json' assert { type: 'json' };

import { GoogleSheet } from '../googleSheetUtil/GoogleSheet.mjs';
import { isCell } from '../util/ExcelUtil.mjs';
import { SuccessResponseData, FailResponseData } from '../util/ResponseUtil.mjs';

const router = express.Router();

router.post('/one', async (req, res) => {
    const { cell, value } = req.body.data;

    if (!isCell(`${cell}1`)) {
        const notCellLocationValue = new FailResponseData('Must be cell variable is cell alphabet\nEx) A', new Error('Must be cell variable is cell alphabet'));
        return res.json(notCellLocationValue.json);
    }

    const googleSheet = new GoogleSheet(sheetInfo.spreadSheetId);
    try {
        await googleSheet.appendValueToCell(cell, value);

        const returnSuccessValue = new SuccessResponseData(`Success append ${value}`, 'Success');
        return res.json(returnSuccessValue.json);
    } catch(error) {
        const retrunFailValue = new FailResponseData(`Fail append`, error);

        console.log(error);
        return res.json(retrunFailValue.json);
    }
});

export default router;