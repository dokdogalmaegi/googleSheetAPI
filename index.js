import express from 'express';
import { getSheet } from './googleSheetUtil/googleSheet.mjs';

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Hello World!');
    
});

const server = app.listen(port, () => {
    console.log(`server on ${port}`);
});