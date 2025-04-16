import express from 'express';
import https from 'https';
import fs from 'fs';

const PORT = process.env.PORT || 3000;

const app = express();

// Load the SSL certificate and key
const options = {
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert')
};

const server = https.createServer(options, app);

app.use(express.static('public')); // To serve static files

// Routes - Start

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/hello', (req, res) => {
  res.send('Hello there...');
});

// Routes - End

server.listen(PORT, () => {
  console.log(`Server is listening on https://localhost:${PORT}`);
});
