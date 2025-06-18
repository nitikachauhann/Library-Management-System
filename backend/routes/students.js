// backend/routes/students.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// 📋 Get all students
router.get('/', (req, res) => {
  db.query('SELECT * FROM students', (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch students' });
    res.json(results);
  });
});

// ➕ Add a student
router.post('/add', (req, res) => {
    const { name, email, roll_number, course, department } = req.body;

    const query = 'INSERT INTO students (name, email, roll_number, course, department) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [name, email, roll_number, course, department], (err, result) => {
    
    if (err) return res.status(500).json({ error: 'Failed to add student' });
    res.json({ success: true, message: 'Student added successfully' });
  });
});

// 🗑️ Delete a student
router.delete('/:id', (req, res) => {
  const studentId = req.params.id;

  db.query('DELETE FROM students WHERE id = ?', [studentId], (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to delete student' });
    res.json({ success: true, message: 'Student deleted successfully' });
  });
});

module.exports = router;
