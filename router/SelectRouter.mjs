import express from 'express';

import sheetInfo from '../config/sheetInfo.json' assert { type: 'json' };

import { GoogleSheet } from '../googleSheetUtil/GoogleSheet.mjs';
import { isCell } from '../util/ExcelUtil.mjs';
import { SuccessResponseData, FailResponseData } from '../util/ResponseUtil.mjs';

const router = express.Router();

router.post('/', async (req, res) => {
    const { start, end } = req.body.data;
    if (!isCell(start) || !isCell(end)) {
        const notCellLocationValue = new FailResponseData('Must be start or end variable is cell location\nEx) A34', new Error('Must be start or end variable is cell location'));
        return res.json(notCellLocationValue.json);
    }

    const googleSheet = new GoogleSheet(sheetInfo.spreadSheetId);
    try {
        const returnCellValue = new SuccessResponseData(`Success select ${start}:${end}`, await googleSheet.getValuesOf(start, end));

        return res.json(returnCellValue.json);
    } catch(error) {
        const retrunFailValue = new FailResponseData(`Fail select ${start}:${end}`, error);

        console.log(error);
        return res.json(retrunFailValue.json);
    }
});

router.post('/getBy/:sheetId', async (req, res) => {
    const { params: { sheetId }, body: { start, end } } = req;
    if (!isCell(start) || !isCell(end)) {
        const notCellLocationValue = new FailResponseData('Must be start or end variable is cell location\nEx) A34', new Error('Must be start or end variable is cell location'));

        return res.json(notCellLocationValue.json);
    }

    const googleSheet = new GoogleSheet(sheetInfo.spreadSheetId);
    try {
        const returnCellValue = new SuccessResponseData(`Success select ${start}:${end}`, await googleSheet.getValuesOf(start, end, sheetId));

        return res.json(returnCellValue.json);
    } catch(error) {
        const retrunFailValue = new FailResponseData(`Fail select ${sheetId}!${start}:${end}`, error);

        console.log(error);
        return res.json(retrunFailValue.json);
    } 
});

router.post('/getAllRows', async (req, res) => {
    const { headerRows: { startCell, endAlphabet } } = req.body.data;
    if (!isCell(startCell) || !isCell(`${endAlphabet}1`)) {
        const notCellLocationValue = new FailResponseData('Must be start or end variable is cell location\nEx) A34', new Error('Must be start or end variable is cell location'));

        return res.json(notCellLocationValue.json);
    }

    const googleSheet = new GoogleSheet(sheetInfo.spreadSheetId);
    try {        
        const headerColumn = await googleSheet.getHeaderColumnFromTwoRows();
        
        const filterHeaderColumn = [];
        headerColumn.forEach((header) => {
            if (header.childs.length > 0) {
                header.childs.forEach((child) => {
                    filterHeaderColumn.push(header.value+child);
                });
            } else {
                for (let i = 0; i < header.colSpan; i++) {
                    filterHeaderColumn.push(header.value);
                }
            }
        });
        console.log(filterHeaderColumn);

        const allCellValues = await googleSheet.getValuesOf(startCell, endAlphabet);
        const rows =  allCellValues.map((row) => {
            row = row.map((cell, cellIdx) => {
                return {
                    value: cell,
                    id: filterHeaderColumn[cellIdx]
                }
            });
            return row;
        });
        
        const returnCellValue = new SuccessResponseData(`Success select allRows}`, rows);
        return res.json(returnCellValue.json);
    } catch(error) {
        const retrunFailValue = new FailResponseData(`Fail select allRows`, error);

        console.log(error);
        return res.json(retrunFailValue.json);
    } 
})

export default router;