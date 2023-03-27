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

    async appendValueMany(start, end, values, options = { plusNumber: 0 }) {
        const lastNumber = await this.#getLastNumberByCell(start);
        const range = `${start}${lastNumber + options.plusNumber}:${end}${lastNumber + options.plusNumber}`;
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

    async getHeaderColumnFromTwoRows(start = 'A1', end = 'AZ2') {
        const range = `${start}:${end}`;

        const [ firstRows, secondRows ] = await this.#getValueOf(range);

        const headerColumn = [];
        for (let idx = 0; idx < firstRows.length; idx++) {
            const secondRowValue = secondRows[idx];

            let rowSpan = 1;
            if (secondRowValue === undefined || secondRowValue.length === 0) {
                rowSpan = 2;   
            }

            let childs = [];
            if (secondRowValue !== undefined && secondRowValue.length > 0 && rowSpan === 1) {
                childs = [secondRowValue];
            }

            const firstRowValue = firstRows[idx];
            if (firstRowValue.length === 0) {
                const notNullBeforeColumnIndex = headerColumn.length - 1;
                
                headerColumn[notNullBeforeColumnIndex].colSpan = headerColumn[notNullBeforeColumnIndex].colSpan + 1;
                headerColumn[notNullBeforeColumnIndex].childs.push(childs[0]);
            } else {
                headerColumn.push({
                    value: firstRowValue.replace('\n', ' '),
                    rowSpan,
                    colSpan: 1,
                    childs
                });   
            }
        }

        console.log(headerColumn);
        return headerColumn;
    }
}