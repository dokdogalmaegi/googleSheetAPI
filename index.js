import express from 'express';
import cors from 'cors';

import { validationWhiteList } from "./util/WhiteListUtil.mjs";
import { appendErrorLog, getSpreadSheet } from './util/PostgresUtil.mjs';
import sheetInfo from './config/sheetInfo.json' assert { type: 'json' };

import setUpRouter from './router/SetUpRouter.mjs';
import selectRouter from './router/SelectRouter.mjs';
import insertRouter from './router/InsertRouter.mjs';
import appendRouter from './router/AppendRouter.mjs';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded( {extended: false} ));
app.use(cors({
    origin: "*",
    credentials: true,
    methods: 'GET, POST'
}));

app.use(validationWhiteList);

app.enable('trust proxy');

import swaggerUi from 'swagger-ui-express';
import { specs } from './swagger/swagger.mjs';
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

/**
 * @swagger
 * tags:
 *   name: SetUp
 *   description: sever setting & server config setting
 */
app.use('/setUp', setUpRouter);

app.use('/select', selectRouter);
app.use('/insert', insertRouter);
app.use('/append', appendRouter);

import fs from 'fs';
import path from 'path';
const __dirname = path.resolve();

/**
 * @swagger
 * tags:
 *  name: Error
 *  description: error log
 */
const server = app.listen(port, async () => {
    try {
        const currentSheetId = await getSpreadSheet();

        if (sheetInfo.spreadSheetId !== currentSheetId) {
            sheetInfo.spreadSheetId = currentSheetId;

            fs.writeFile(`${__dirname}/config/sheetInfo.json`, JSON.stringify(sheetInfo), (err) => {
                if (err) {
                    throw err;
                };
            });
        }
    } catch (error) {
        await appendErrorLog('start server', error.message, true);
    }

    console.log(`server on ${port}`);
});