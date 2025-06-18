// backend/server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 5000;

app.use(express.json()); // 🧠 This is mandatory to parse JSON in requests
app.use(cors());
app.use(bodyParser.json());

// ✅ Serve static files from the frontend folder
app.use(express.static(path.join(__dirname, '../frontend')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/books', require('./routes/books'));
app.use('/api/students', require('./routes/students'));
app.use('/api/transactions', require('./routes/transactions')); // for issue/return

app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
