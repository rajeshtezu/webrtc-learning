import express from 'express';
import https from 'https';
import fs from 'fs';

const PORT = process.env.PORT || 3000;

const app = express();

let iceCandidate1 = null;
let iceCandidate2 = null;

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

// ICE candidates - start
app.get('/iceCandidate1', (req, res) => {
  console.log('get iceCandidate1:', iceCandidate1);
  res.json(iceCandidate1);
});

app.get('/iceCandidate2', (req, res) => {
  console.log('get iceCandidate2:', iceCandidate2);
  res.json(iceCandidate2);
});

app.post('/iceCandidate1', express.json(), (req, res) => {
  if (iceCandidate1) {
    console.log('iceCandidate1 already exists:', iceCandidate1);
    res.status(400).send('ICE candidate already exists');
    return;
  }

  iceCandidate1 = req.body;
  console.log('post iceCandidate1:', iceCandidate1);
  res.sendStatus(200);
});

app.post('/iceCandidate2', express.json(), (req, res) => {
  if (iceCandidate2) {
    console.log('iceCandidate2 already exists:', iceCandidate2);
    res.status(400).send('ICE candidate already exists');
    return;
  }

  iceCandidate2 = req.body;
  console.log('post iceCandidate2:', iceCandidate2);
  res.sendStatus(200);
});

app.delete('/iceCandidates', (req, res) => {
  iceCandidate1 = null;
  iceCandidate2 = null;
  console.log('ICE candidates deleted');
  res.sendStatus(200);
});
// ICE candidates - end

// Routes - End

server.listen(PORT, () => {
  console.log(`Server is listening on https://localhost:${PORT}`);
});
