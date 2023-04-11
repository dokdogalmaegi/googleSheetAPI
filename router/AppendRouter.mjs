import express from "express";

import sheetInfo from '../config/sheetInfo.json' assert { type: 'json' };

import { GoogleSheet } from '../googleSheetUtil/GoogleSheet.mjs';
import { isCell } from '../util/ExcelUtil.mjs';
import { SuccessResponseData, FailResponseData } from '../util/ResponseUtil.mjs';

import { appendErrorLog } from "../util/PostgresUtil.mjs"; 

const router = express.Router();

/**
 * @swagger
 * tags:
 *  name: Append Row
 *  description: Append Row
 */

/**
 * @swagger
 * /append/one:
 *  post:
 *      summary: Append one row
 *      tags: [Append Row]
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          data:
 *                              type: object
 *                              properties:
 *                                  cell:
 *                                      type: string
 *                                      example: A
 *                                  value:
 *                                      type: string
 *                                      example: test
 *      responses:
 *          200:
 *              description: Success append
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              status:
 *                                  type: string
 *                                  description: response status
 *                              resultMsg:
 *                                  type: string
 *                                  description: response message
 *                              data:
 *                                  type: string
 *                                  description: Success Message
 *          500:
 *              description: Fail append
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              status:
 *                                  type: string
 *                                  description: response status
 *                              resultMsg:
 *                                  type: string
 *                                  description: response message
 *                              error:
 *                                  type: object
 */
router.post('/one', async (req, res) => {
    try {
        const { cell, value } = req.body.data;

        if (!isCell(`${cell}1`)) {
            const notCellLocationValue = new FailResponseData('Must be cell variable is cell alphabet\nEx) A', new Error('Must be cell variable is cell alphabet'));
            return res.json(notCellLocationValue.json);
        }
    
        const googleSheet = new GoogleSheet(sheetInfo.spreadSheetId);
        await googleSheet.appendValueToCell(cell, value);

        const returnSuccessValue = new SuccessResponseData(`Success append ${value}`, 'Success');
        return res.json(returnSuccessValue.json);
    } catch(error) {
        console.log(error);
        await appendErrorLog('append/one', error.message, false);

        const retrunFailValue = new FailResponseData(`Fail append`, error);
        return res.json(retrunFailValue.json);
    }
});

/**
 * @swagger
 * /append/many:
 *  post:
 *      summary: Append many row
 *      tags: [Append Row]
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          data:
 *                              type: object
 *                              properties:
 *                                  start:
 *                                      type: string
 *                                      example: A
 *                                  end:
 *                                      type: string
 *                                      example: B
 *                                  values:
 *                                      type: array
 *                                      items:
 *                                          type: string
 *                                      example: ["test1", "test2"]
 *      parameters:
 *          - in: query
 *            name: plusNumber
 *            schema:
 *              type: integer
 *              default: 1
 *            description: Append row number
 *      responses:
 *          200:
 *              description: Success append
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              status:
 *                                  type: string
 *                                  description: response status
 *                              resultMsg:
 *                                  type: string
 *                                  description: response message
 *                              data:
 *                                  type: string
 *                                  description: Success Message
 *          500:
 *              description: Fail append
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              status:
 *                                  type: string
 *                                  description: response status
 *                              resultMsg:
 *                                  type: string
 *                                  description: response message
 *                              error:
 *                                  type: object
 */
router.post('/many', async (req, res) => {
    try {
        const { start: startAlphabet, end: endAlphabet, values } = req.body.data;
        if (!isCell(`${startAlphabet}1`) || !isCell(`${endAlphabet}1`)) {
            const notCellLocationValue = new FailResponseData('Must be start or end variable is cell alphabet\nEx) A', new Error('Must be start or end variable is cell alphabet'));
            return res.json(notCellLocationValue.json);
        }
        
        const { plusNumber } = req.query;
        const options = {
            plusNumber: Number(plusNumber)
        };

        const googleSheet = new GoogleSheet(sheetInfo.spreadSheetId);
        await googleSheet.appendValueMany(startAlphabet, endAlphabet, values, options);

        const returnSuccessValue = new SuccessResponseData(`Success append ${startAlphabet} ~ ${endAlphabet}`, 'Success');
        return res.json(returnSuccessValue.json);
    } catch(error) {
        console.log(error);
        await appendErrorLog('append/many', error.message, true);
        
        const retrunFailValue = new FailResponseData(`Fail append`, error);
        return res.json(retrunFailValue.json);
    }
})

export default router;