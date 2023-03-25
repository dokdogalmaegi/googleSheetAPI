import express from 'express';

import sheetInfo from './config/sheetInfo.json' assert { type: 'json' };

import { GoogleSheet } from './googleSheetUtil/GoogleSheet.mjs';
import { isCell } from './util/ExcelUtil.mjs';
import { SuccessResponseData, FailResponseData } from './util/ResponseUtil.mjs';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded( {extended: false} ));

app.post('/', async (req, res) => {
    const { start, end } = req.body;
    
    if (!isCell(start) || !isCell(end)) {
        const notCellLocationValue = new FailResponseData('Must be start or end variable is cell location\nEx) A34', new Error('Must be start or end variable is cell location'));
        return res.json(notCellLocationValue.json);
    }

    const googleSheet = new GoogleSheet(sheetInfo.spreadSheetId);
    const returnCellValue = new SuccessResponseData(`Success select ${start}:${end}`, await googleSheet.getValuesOf(start, end));
    return res.json(returnCellValue.json);
});

const server = app.listen(port, () => {
    console.log(`server on ${port}`);
});