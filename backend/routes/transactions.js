const express = require('express');
const router = express.Router();
const db = require('../db');

// ✅ Issue a book to a student
router.post('/issue-book', (req, res) => {
  console.log("📥 Received at backend:", req.body);

  const { book_id, student_id, issue_date, return_date } = req.body;

  if (!book_id || !student_id || !issue_date || !return_date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const issueQuery = `
    INSERT INTO issued_books (book_id, student_id, issue_date, return_date)
    VALUES (?, ?, ?, ?)
  `;
  const updateBookQuery = `
    UPDATE books SET available_copies = available_copies - 1 WHERE id = ? AND available_copies > 0
  `;

  db.query(updateBookQuery, [book_id], (err, result) => {
    if (err) {
      console.error('Error updating book availability:', err);
      return res.status(500).json({ error: 'Database error during update' });
    }

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: 'Book unavailable or not found' });
    }

    db.query(issueQuery, [book_id, student_id, issue_date, return_date], (err2) => {
      if (err2) {
        console.error('Error inserting issue record:', err2);
        return res.status(500).json({ error: 'Failed to issue book' });
      }

      res.json({ success: true, message: 'Book issued successfully' });
    });
  });
});

// ✅ Return a book
router.post('/return', (req, res) => {
  const { issue_id, actual_return_date } = req.body;

  if (!issue_id || !actual_return_date) {
    return res.status(400).json({ error: 'Missing return info' });
  }

  const fetchQuery = `SELECT return_date, book_id FROM issued_books WHERE id = ?`;

  db.query(fetchQuery, [issue_id], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ error: 'Issue record not found' });
    }

    const expectedReturn = new Date(results[0].return_date);
    const actualReturn = new Date(actual_return_date);
    const bookId = results[0].book_id;

    let fine = 0;
    if (actualReturn > expectedReturn) {
      const delay = Math.ceil((actualReturn - expectedReturn) / (1000 * 60 * 60 * 24));
      fine = delay * 5;
    }

    const updateIssue = `
      UPDATE issued_books SET actual_return_date = ?, fine = ? WHERE id = ?
    `;
    const incrementCopies = `
      UPDATE books SET available_copies = available_copies + 1 WHERE id = ?
    `;

    db.query(updateIssue, [actual_return_date, fine, issue_id], (err2) => {
      if (err2) {
        console.error('Error updating issue record:', err2);
        return res.status(500).json({ error: 'Failed to update return record' });
      }

      db.query(incrementCopies, [bookId], (err3) => {
        if (err3) {
          console.error('Error incrementing book copies:', err3);
          return res.status(500).json({ error: 'Failed to update book stock' });
        }

        res.json({ success: true, fine, message: 'Book returned successfully' });
      });
    });
  });
});

// ✅ Get all issued book records
router.get('/issued-books', (req, res) => {
  const query = `
    SELECT 
      ib.id, 
      b.title, 
      s.name AS student_name, 
      ib.issue_date, 
      ib.return_date, 
      ib.actual_return_date, 
      ib.fine
    FROM issued_books ib
    JOIN books b ON ib.book_id = b.id
    JOIN students s ON ib.student_id = s.id
    ORDER BY ib.issue_date DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching issued books:', err);
      return res.status(500).json({ error: 'Failed to fetch issued books' });
    }

    res.json(results);
  });
});

module.exports = router;
