const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();

app.use(cors({ origin: '*', methods: 'GET,POST' })); // Local development only; restrict in production
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/recipes', require('./routes/recipes'));
app.use('/api/recipes', require('./routes/comments'));
app.use('/api/chat', require('./routes/chat'));

app.get('/', (req, res) => {
  res.status(200).send('Server is running!');
});

const PORT = process.env.PORT || 3001;

// Check the database up front so a wrong password is obvious at startup
db.query('SELECT 1')
  .then(() => {
    console.log('Connected to MySQL!');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

    // Load the recipe catalogue in the background so the first page view is fast
    require('./services/recipes')
      .ready()
      .then(() => console.log('Recipes ready'))
      .catch((err) => console.error('Could not load recipes (will retry on the next request):', err.message));
  })
  .catch((err) => {
    console.error('Could not connect to MySQL. Check the DB_* values in backend/.env:', err.message);
    process.exit(1);
  });
