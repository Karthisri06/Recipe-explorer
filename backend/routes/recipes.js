const express = require('express');
const db = require('../db');
const recipes = require('../services/recipes');

const router = express.Router();

const PAGE_SIZE = 12;
const MAX_PAGE_SIZE = 50;

// Visitor ratings come from our own comments table, keyed by recipe id
async function ratingsFor(ids) {
  const ratings = new Map();
  if (!ids.length) return ratings;
  const [rows] = await db.query(
    'SELECT recipe, AVG(rating) AS average, COUNT(*) AS count FROM comments WHERE recipe IN (?) GROUP BY recipe',
    [ids]
  );
  for (const row of rows) {
    ratings.set(row.recipe, { rating: Number(Number(row.average).toFixed(1)), ratingCount: row.count });
  }
  return ratings;
}

const withRating = (recipe, ratings) => ({ rating: null, ratingCount: 0, ...ratings.get(recipe.id) });

function handleError(res, err) {
  console.error('Recipes error:', err);
  res.status(503).json({ error: 'Recipes are unavailable right now. Please try again shortly.' });
}

// GET /api/recipes?q=chicken&category=Seafood&limit=12&offset=0
router.get('/', async (req, res) => {
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || PAGE_SIZE, 1), MAX_PAGE_SIZE);
  const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);

  try {
    const { total, recipes: page } = await recipes.search({
      q: String(req.query.q || '').slice(0, 100),
      category: String(req.query.category || ''),
      limit,
      offset,
    });
    const ratings = await ratingsFor(page.map((r) => r.id));
    res.json({ total, recipes: page.map((r) => ({ ...recipes.summary(r), ...withRating(r, ratings) })) });
  } catch (err) {
    handleError(res, err);
  }
});

// GET /api/recipes/categories
router.get('/categories', async (req, res) => {
  try {
    res.json({ categories: await recipes.categories() });
  } catch (err) {
    handleError(res, err);
  }
});

// GET /api/recipes/featured  (recipe of the day)
router.get('/featured', async (req, res) => {
  try {
    const recipe = await recipes.featured();
    const ratings = await ratingsFor([recipe.id]);
    res.json({ ...recipes.summary(recipe), blurb: recipe.steps[0] || '', ...withRating(recipe, ratings) });
  } catch (err) {
    handleError(res, err);
  }
});

// GET /api/recipes/:id
router.get('/:id', async (req, res) => {
  if (!/^\d+$/.test(req.params.id)) return res.status(404).json({ error: 'Recipe not found' });

  try {
    const recipe = await recipes.get(req.params.id);
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });
    const ratings = await ratingsFor([recipe.id]);
    res.json({ ...recipe, ...withRating(recipe, ratings) });
  } catch (err) {
    handleError(res, err);
  }
});

module.exports = router;
