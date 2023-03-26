import express from 'express';

import selectRouter from './router/SelectRouter.mjs';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded( {extended: false} ));
app.use('/select', selectRouter);


const server = app.listen(port, () => {
    console.log(`server on ${port}`);
});