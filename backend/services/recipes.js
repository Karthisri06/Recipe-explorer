// Recipe catalogue from TheMealDB (https://www.themealdb.com/api.php).
// The whole catalogue is downloaded once, cached on disk and then served from memory,
// so pages are fast, restarts do not re-download, and the site still works if the API is down.
const fs = require('fs/promises');
const path = require('path');

const API_KEY = process.env.MEALDB_API_KEY || '1'; // "1" is the free test key
const BASE = `https://www.themealdb.com/api/json/v1/${API_KEY}`;
const CACHE_FILE = path.join(__dirname, '..', 'data', 'mealdb-cache.json');
const CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const MIN_EXPECTED_RECIPES = 100; // guards against caching a partial download
const LETTERS = 'abcdefghijklmnopqrstuvwxyz'.split('');

const MEAT_CATEGORIES = ['Beef', 'Chicken', 'Goat', 'Lamb', 'Pork', 'Seafood'];
const VEG_CATEGORIES = ['Vegetarian', 'Vegan'];

let recipes = []; // sorted by name
let byId = new Map();
let loading = null;

const isHttpUrl = (value) => typeof value === 'string' && /^https?:\/\//.test(value);

// "1. Mix the flour" / "STEP 2" lines -> clean sentences
function parseSteps(text) {
  let steps = String(text || '')
    .split(/\r?\n+/)
    .map((line) => line.trim())
    .filter((line) => line && !/^(step\s*)?\d+\.?$/i.test(line))
    .map((line) => line.replace(/^(step\s*)?\d+[.):]\s*/i, ''));

  // Some recipes are one long paragraph; split it into sentences so it reads as steps
  if (steps.length === 1) {
    steps = steps[0].split(/(?<=[.!?])\s+(?=[A-Z])/).map((s) => s.trim()).filter(Boolean);
  }
  return steps;
}

function normalise(meal) {
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const item = (meal[`strIngredient${i}`] || '').trim();
    if (!item) continue;
    ingredients.push({ item, amount: (meal[`strMeasure${i}`] || '').trim() || null });
  }

  let diet = null;
  if (VEG_CATEGORIES.includes(meal.strCategory)) diet = 'veg';
  else if (MEAT_CATEGORIES.includes(meal.strCategory)) diet = 'non-veg';

  return {
    id: String(meal.idMeal),
    name: String(meal.strMeal || '').trim(),
    category: meal.strCategory || null,
    area: meal.strArea || null,
    tags: String(meal.strTags || '').split(',').map((t) => t.trim()).filter(Boolean),
    diet,
    image: isHttpUrl(meal.strMealThumb) ? meal.strMealThumb : null,
    youtube: isHttpUrl(meal.strYoutube) ? meal.strYoutube : null,
    source: isHttpUrl(meal.strSource) ? meal.strSource : null,
    duration: null, // not provided by the API
    ingredients,
    steps: parseSteps(meal.strInstructions),
    page: `recipe.html?id=${meal.idMeal}`,
  };
}

async function fetchLetter(letter) {
  const response = await fetch(`${BASE}/search.php?f=${letter}`, { signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`TheMealDB responded with ${response.status}`);
  const data = await response.json();
  return data.meals || [];
}

async function download() {
  const meals = [];
  for (let i = 0; i < LETTERS.length; i += 5) {
    const batch = await Promise.all(LETTERS.slice(i, i + 5).map(fetchLetter));
    meals.push(...batch.flat());
  }
  const unique = new Map(meals.map((meal) => [String(meal.idMeal), normalise(meal)]));
  if (unique.size < MIN_EXPECTED_RECIPES) {
    throw new Error(`Only ${unique.size} recipes came back from TheMealDB`);
  }
  return [...unique.values()];
}

function setRecipes(list) {
  recipes = [...list].sort((a, b) => a.name.localeCompare(b.name));
  byId = new Map(recipes.map((r) => [r.id, r]));
}

async function readCache() {
  try {
    const cache = JSON.parse(await fs.readFile(CACHE_FILE, 'utf8'));
    return Array.isArray(cache.recipes) && cache.recipes.length ? cache : null;
  } catch (err) {
    return null; // no cache yet
  }
}

async function refresh() {
  const list = await download();
  setRecipes(list);
  await fs.writeFile(CACHE_FILE, JSON.stringify({ savedAt: Date.now(), recipes: list }));
  console.log(`Downloaded ${list.length} recipes from TheMealDB`);
}

async function load() {
  const cache = await readCache();
  if (cache) {
    setRecipes(cache.recipes);
    if (Date.now() - cache.savedAt > CACHE_MAX_AGE_MS) {
      refresh().catch((err) => console.error('Could not refresh recipes (using cached copy):', err.message));
    }
    return;
  }
  await refresh();
}

// Resolves once recipes are available. A failed load is retried on the next call.
function ready() {
  loading ||= load().catch((err) => {
    loading = null;
    throw err;
  });
  return loading;
}

const summary = (r) => ({
  id: r.id,
  name: r.name,
  image: r.image,
  category: r.category,
  area: r.area,
  diet: r.diet,
  ingredientCount: r.ingredients.length,
});

async function all() {
  await ready();
  return recipes;
}

async function get(id) {
  await ready();
  return byId.get(String(id)) || null;
}

async function has(id) {
  await ready();
  return byId.has(String(id));
}

async function categories() {
  await ready();
  const counts = new Map();
  for (const r of recipes) if (r.category) counts.set(r.category, (counts.get(r.category) || 0) + 1);
  return [...counts].map(([name, count]) => ({ name, count })).sort((a, b) => a.name.localeCompare(b.name));
}

async function search({ q = '', category = '', limit = 12, offset = 0 } = {}) {
  await ready();
  const query = q.trim().toLowerCase();
  const found = recipes.filter((r) => {
    if (category && r.category !== category) return false;
    if (!query) return true;
    return (
      r.name.toLowerCase().includes(query) ||
      (r.area || '').toLowerCase().includes(query) ||
      (r.category || '').toLowerCase().includes(query) ||
      r.tags.some((t) => t.toLowerCase().includes(query)) ||
      r.ingredients.some((i) => i.item.toLowerCase().includes(query))
    );
  });
  return { total: found.length, recipes: found.slice(offset, offset + limit) };
}

// Same recipe all day, a different one tomorrow
async function featured(date = new Date()) {
  await ready();
  const day = Math.floor(date.getTime() / 86400000);
  return recipes[day % recipes.length];
}

module.exports = { ready, all, get, has, categories, search, featured, summary };
