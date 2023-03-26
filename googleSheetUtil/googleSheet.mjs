import { google } from 'googleapis';

import apiAuthJson from '../config/apiAuth.json' assert { type: 'json' };

const { client_email: clientEmail, private_key: privateKey } = apiAuthJson;

const ValueInputOption = {
    INPUT_VALUE_OPTION_UNSPECIFIED: 'INPUT_VALUE_OPTION_UNSPECIFIED',
    RAW: 'RAW',
    USER_ENTERED: 'USER_ENTERED'
};

const InsertDataOption = {
    OVERWRITE: 'OVERWRITE',
    INSERT_ROWS: 'INSERT_ROWS'
}

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

    /**
     * Cell의 범위를 매개 변수로 값을 조회해 반환합니다.
     * @param {String} startCell 
     * @param {String} endCell 
     * @param {String} sheetId 
     * @returns String Value from Cell
     */
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

        return values;
    }

    async #getLastNumberByCell(cell = 'A') {
        const START_NUMBER = 1;
        const range = `${cell}${START_NUMBER}:${cell}`;

        const { data: { values } } = await this.#sheetApi.spreadsheets.values.get({
            spreadsheetId: this.#spreadSheetId,
            range
        });

        return values.length;
    }

    async insertValueToCell(location, value) {
        const range = `${location}:${location}`;
        const resource = {
            values: [
                [
                    value
                ]
            ]
        };

        await this.#insertValueToCell(range, resource);
    }

    async #insertValueToCell(range, resource) {
        await this.#sheetApi.spreadsheets.values.update({
            spreadsheetId: this.#spreadSheetId,
            valueInputOption: ValueInputOption.RAW,
            range,
            resource
        });
    }

    async appendValueToCell(cell, value) {
        const range = `${cell}1:${cell}${await this.#getLastNumberByCell(cell)}`;
        const resource = {
            values: [
                [
                    value
                ]
            ]
        };

        await this.#appendValuesToCell(range, resource);
    }

    async appendValueMany(start, end, values) {
        const lastNumber = await this.#getLastNumberByCell(start);
        const range = `${start}${lastNumber}:${end}${lastNumber}`;
        const resource = {
            values: [
                values
            ]
        };

        await this.#appendValuesToCell(range, resource);
    }

    async #appendValuesToCell(range, resource) {
        await this.#sheetApi.spreadsheets.values.append({
            spreadsheetId: this.#spreadSheetId,
            insertDataOption: InsertDataOption.INSERT_ROWS,
            valueInputOption: ValueInputOption.RAW,
            range,
            resource
        });
    }
}