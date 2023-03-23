import { google } from 'googleapis';

import apiAuthJson from '../config/apiAuth.json' assert { type: 'json' };
import sheetInfo from '../config/sheetInfo.json' assert { type: 'json' };

const { client_email, private_key } = apiAuthJson;
const { sheetId } = sheetInfo;

export async function getSheet() {
    const SHEET_API_URL = 'https://www.googleapis.com/auth/spreadsheets';
    const authorize = new google.auth.JWT(client_email, null, private_key, [SHEET_API_URL]);

    return google.sheets({
        version: 'v4',
        auth: authorize
    });
}

