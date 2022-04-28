const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

// middleweare
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('assignment 11 server is running...')
});

app.listen(port, () => console.log('server in running this port', port));