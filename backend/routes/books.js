// backend/routes/books.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// 📖 Get all books
router.get('/', (req, res) => {
  db.query('SELECT * FROM books', (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch books' });
    res.json(results);
  });
});

// ➕ Add a new book
router.post('/add', (req, res) => {
  const {
    title, author, isbn, category, language,
    edition, total_copies, available_copies, location
  } = req.body;

  const query = `
    INSERT INTO books (title, author, isbn, category, language, edition, total_copies, available_copies, location)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(query, [
    title, author, isbn, category, language,
    edition, total_copies, available_copies, location
  ], (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to add book' });
    res.json({ success: true, message: 'Book added successfully' });
  });
});

// 🗑️ Delete a book
router.delete('/:id', (req, res) => {
  const bookId = req.params.id;

  db.query('DELETE FROM books WHERE id = ?', [bookId], (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to delete book' });
    res.json({ success: true, message: 'Book deleted successfully' });
  });
});

// ✏️ Update book (optional, if needed)
router.put('/:id', (req, res) => {
  const bookId = req.params.id;
  const updatedData = req.body;

  db.query('UPDATE books SET ? WHERE id = ?', [updatedData, bookId], (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to update book' });
    res.json({ success: true, message: 'Book updated successfully' });
  });
});

module.exports = router;
