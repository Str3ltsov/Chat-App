import express from 'express';
import dotenv from 'dotenv';
import connectToDb from './config/db.js';

dotenv.config({ path: './.env' });

connectToDb();

const app = express();
const router = express.Router();
const PORT = process.env.API_PORT || 4000;

app.use(express.json());
app.use(process.env.API_PATH, router);

router.get('/', (req, res) => {
    res.send({
        'success': true,
        'message': "It's working!"
    });
})

app.listen(PORT, () =>
    console.log(`Express: Server is running at localhost:${PORT}`)
);

process.on('unhandledRejection', err => {
    console.error(`Express: ${err}`);
    server.close(() => process.exit(1))
});