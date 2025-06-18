// backend/routes/issue.js
const express = require('express');
const router = express.Router();
const db = require('../db');

function formatDate(dateStr) {
  const [year, month, day] = dateStr.split("-");
  return `${day}-${month}-${year}`; // dd-mm-yyyy format
}





// Existing GET route to fetch issued books
router.get('/issued', (req, res) => {
  const query = `
    SELECT ib.id, b.title, s.name AS student_name, ib.issue_date, ib.return_date, ib.actual_return_date, ib.fine
    FROM issued_books ib
    JOIN books b ON ib.book_id = b.id
    JOIN students s ON ib.student_id = s.id
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch issued books' });

    // Format dates before sending them in the response
    const formattedResults = results.map(record => ({
      ...record,
      issue_date: formatDate(record.issue_date),
      return_date: formatDate(record.return_date),
      actual_return_date: record.actual_return_date ? formatDate(record.actual_return_date) : '-',
    }));

    res.json(formattedResults);
  });
});

// ✅ New POST route to issue a book
router.post('/issue-book', (req, res) => {
  const { bookId, studentId, returnDate } = req.body;

  if (!bookId || !studentId || !returnDate) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const returnDateFormatted = new Date(returnDate).toISOString().split('T')[0];

  const checkQuery = `SELECT available_copies FROM books WHERE id = ?`;
  db.query(checkQuery, [bookId], (err, results) => {
    if (err || results.length === 0) {
      return res.status(500).json({ error: 'Book not found or DB error' });
    }

    const available = results[0].available_copies;
    if (available <= 0) {
      return res.status(400).json({ error: 'No copies available' });
    }

    const issueQuery = `
      INSERT INTO issued_books (book_id, student_id, issue_date, return_date)
      VALUES (?, ?, CURDATE(), ?)
    `;

    db.query(issueQuery, [bookId, studentId, returnDateFormatted], (err2) => {
      if (err2) return res.status(500).json({ error: 'Failed to issue book' });

      const updateQuery = `UPDATE books SET available_copies = available_copies - 1 WHERE id = ?`;
      db.query(updateQuery, [bookId]);

      res.json({ success: true, message: 'Book issued successfully' });
    });
  });
});

module.exports = router;
