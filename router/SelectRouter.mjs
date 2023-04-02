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
                    filterHeaderColumn.push({id: header.value+child, type: 'check'});
                });
            } else {
                for (let i = 0; i < header.colSpan; i++) {
                    filterHeaderColumn.push({id: header.value, type: 'text'});
                }
            }
        });

        const allCellValues = await googleSheet.getValuesOf(startCell, endAlphabet);
        const rows =  allCellValues.map((row, rowIdx) => {
            row = row.map((cell, cellIdx) => {
                const ALAPABET_A_ASCII = 'A'.charCodeAt(0);
                const ALAPABET_Z_ASCII = 'Z'.charCodeAt(0);

                const cellColumnIdAlapabetASCII = ALAPABET_A_ASCII + cellIdx;
                let cellColumnIdAlapabet = '';
                if (cellColumnIdAlapabetASCII > ALAPABET_Z_ASCII) {
                    cellColumnIdAlapabet = `A${String.fromCharCode(ALAPABET_A_ASCII + (cellColumnIdAlapabetASCII - ALAPABET_Z_ASCII - 1))}`
                } else {
                    cellColumnIdAlapabet = String.fromCharCode(cellColumnIdAlapabetASCII);
                }

                return {
                    value: cell,
                    id: filterHeaderColumn[cellIdx].id,
                    type: filterHeaderColumn[cellIdx].type,
                    cellId: `${cellColumnIdAlapabet}${rowIdx+3}`
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