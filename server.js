import express from 'express';
import fs from 'fs';
import readline from 'readline';
import { notFound,errorHandler } from './Middleware/errorHandler.js';

const app = express();

// Middleware to parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req,res) => {
    res.status(400).send('Server Running!!!');
})

// Endpoint to handle GET requests on /data
app.get('/data', (req, res) => {
    const { n, m } = req.query;

    if (!n) {
        res.status(400).send('Parameter "n" is required!!');
        return;
    }

    const filePath = `./tmp/data/${n}.txt`;

    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            res.status(404).send(`File ${n}.txt not found.`);
            return;
        }

        const fileStream = fs.createReadStream(filePath);
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        if (m) {
            const lineNo = parseInt(m);
            if (isNaN(lineNo) || lineNo < 1) {
                res.status(400).send('Invalid value for parameter "m".');
                return;
            }

            let currentLine = 0;
            rl.on('line', (line) => {
                currentLine++;
                if (currentLine === lineNo) {
                    res.type('text/plain').send(line);
                    rl.close();
                    return;
                }
            });

            rl.on('close', () => {
                res.status(404).send(`Line ${lineNo} not found in file ${n}.txt`);
            });
        } else {
            res.type('text/plain');
            fileStream.pipe(res);
        }
    });
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});