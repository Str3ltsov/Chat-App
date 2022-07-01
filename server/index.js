import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import connectToDb from './config/db.js';
import { authRouter } from './api/v1/routes/auth.js'

dotenv.config({ path: './.env' });

connectToDb();

const app = express();

const PORT = process.env.API_PORT || 4000;
const API_PATH = process.env.API_PATH

app.use(express.json());
app.use(cookieParser());
app.use(`${API_PATH}/auth`, authRouter);

app.listen(PORT, () =>
    console.log(`Express: Server is running at localhost:${PORT}`)
);

process.on('unhandledRejection', err => {
    console.error(`Express: ${err}`);
    process.exit(1);
});