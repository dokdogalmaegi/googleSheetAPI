import { google } from 'googleapis';

import apiAuthJson from '../config/apiAuth.json' assert { type: 'json' };

const { client_email: clientEmail, private_key: privateKey } = apiAuthJson;

const SHEET_API_URL = 'https://www.googleapis.com/auth/spreadsheets';
export class GoogleSheet {
    #sheetApi
    #spreadSheetId

    constructor(spreadSheetId) {
        const authorize = new google.auth.JWT(clientEmail, null, privateKey, [SHEET_API_URL]);

        this.#sheetApi = google.sheets({
            version: 'v4',
            auth: authorize
        });

        this.#spreadSheetId = spreadSheetId;
    }

    async getValuesOf(startCell, endCell, sheetId = '') {
        let range = `${startCell}:${endCell}`;

        if (sheetId.length > 0) {
            range = `${sheetId}!${range}`;
        }

        console.log(range);

        return await this.#getValueOf(range);
    }

    async #getValueOf(range) {
        const { data: { values } } = await this.#sheetApi.spreadsheets.values.get({
            spreadsheetId: this.#spreadSheetId,
            range
        });

        console.log(await this.#sheetApi.spreadsheets.values.get({
            spreadsheetId: this.#spreadSheetId,
            range,
        }));

        return values;
    }
}