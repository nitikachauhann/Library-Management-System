// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// Login Route
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  const query = 'SELECT * FROM librarian WHERE username = ? AND password = ?';
  db.query(query, [username, password], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });

    if (results.length > 0) {
      res.json({ success: true, message: 'Login successful' });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  });
});

module.exports = router;
