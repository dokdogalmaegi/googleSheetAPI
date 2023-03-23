import express from 'express';

import sheetInfo from './config/sheetInfo.json' assert { type: 'json' };

import { GoogleSheet } from './googleSheetUtil/GoogleSheet.mjs';
import { SuccessResponseData, FailResponseData } from './util/ResponseUtil.mjs';

const app = express();
const port = process.env.PORT || 3000;

app.post('/', async (req, res) => {
    const googleSheet = new GoogleSheet(sheetInfo.spreadSheetId);

    res.json(new SuccessResponseData('Success select A1:A3', await googleSheet.getValuesOf('A1', 'A3')).json);
});

const server = app.listen(port, () => {
    console.log(`server on ${port}`);
});