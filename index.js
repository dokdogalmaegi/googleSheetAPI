import express from 'express';

import { getSheet } from './googleSheetUtil/GoogleSheet.mjs';
import { SuccessResponseData, FailResponseData } from './util/ResponseUtil.mjs';

const app = express();
const port = process.env.PORT || 3000;

app.post('/', (req, res) => {
    const googleSheet = getSheet();

    res.json(new SuccessResponseData('test', {a: 1}).json);
});

const server = app.listen(port, () => {
    console.log(`server on ${port}`);
});