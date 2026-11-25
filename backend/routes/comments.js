const express = require('express');
const db = require('../db');
const recipes = require('../services/recipes');

const router = express.Router();

// Comments can only be read or written for recipes that exist in the catalogue
router.param('recipe', async (req, res, next, recipe) => {
  try {
    if (!(await recipes.has(recipe))) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    next();
  } catch (err) {
    console.error('Recipe lookup failed:', err);
    res.status(503).json({ error: 'Recipes are unavailable right now. Please try again shortly.' });
  }
});

// GET /api/recipes/:recipe/comments
router.get('/:recipe/comments', async (req, res) => {
  const { recipe } = req.params;

  try {
    const [comments] = await db.query(
      'SELECT id, name, rating, comment, created_at FROM comments WHERE recipe = ? ORDER BY created_at DESC',
      [recipe]
    );
    res.json({ comments });
  } catch (err) {
    console.error('Error loading comments:', err);
    res.status(500).json({ error: 'Could not load comments' });
  }
});

// POST /api/recipes/:recipe/comments
router.post('/:recipe/comments', async (req, res) => {
  const { recipe } = req.params;

  const name =String(req.body.name || '').trim();
  const comment = String(req.body.comment || '').trim();
  const rating = Number(req.body.rating);

  if (!name || !comment) {
    return res.status(400).json({ error: 'Name and comment are required' });
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Please choose a rating from 1 to 5' });
  }
  if (name.length > 100 || comment.length > 1000) {
    return res.status(400).json({ error: 'Name or comment is too long' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO comments (recipe, name, rating, comment) VALUES (?, ?, ?, ?)',
      [recipe, name, rating, comment]
    );
    res.status(201).json({ id: result.insertId, name, rating, comment });
  } catch (err) {
    console.error('Error saving comment:', err);
    res.status(500).json({ error: 'Could not save your comment' });
  }
});

module.exports = router;
