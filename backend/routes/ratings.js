// ratings.js

const express = require('express');
const router = express.Router();
const db = require('../models/db');

// POST Route to Save Rating and Comment
router.post('/rating', (req, res) => {
  const { name, email, star_rating, comment } = req.body;

  if (!name || !email || !star_rating || !comment) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  const query = 'INSERT INTO ratings (name, email, star_rating, comment) VALUES (?, ?, ?, ?)';
  db.query(query, [name, email, star_rating, comment], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to save rating and comment' });
    }
    res.status(201).json({ message: 'Rating and comment saved successfully!' });
  });
});

// GET Route to Fetch Ratings and Comments
router.get('/ratings', (req, res) => {
  const query = 'SELECT * FROM ratings ORDER BY created_at DESC';
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch ratings and comments' });
    }
    res.status(200).json({ ratings: results });
  });
});

module.exports = router;

