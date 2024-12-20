
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const cors = require('cors'); // Import CORS
const app = express();

// Middleware: CORS configuration
const corsOptions = {
  origin: '*', // Allow all origins for testing; restrict this in production
  methods: 'GET,POST',
};
app.use(cors(corsOptions)); // Apply CORS middleware

// Middleware: Parse incoming JSON data
app.use(express.json());

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'sri@2004',
  database: 'recipe_explorer',
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Connected to MySQL!');
  }
});

// Sign-up route
app.post('/api/auth/signup', async (req, res) => {
  const { email, password } = req.body; // We no longer need confirmPassword here, as it's already validated on the frontend

  // Input validation
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // Validate email format
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  try {
    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if the email already exists in the database
    const checkEmailQuery = 'SELECT * FROM users WHERE email = ?';
    db.query(checkEmailQuery, [email], async (err, result) => {
      if (err) {
        console.error('Error querying database:', err);
        return res.status(500).json({ error: 'Database query error' });
      }

      if (result.length > 0) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      // Insert the new user into the database
      const insertUserQuery = 'INSERT INTO users (email, password) VALUES (?, ?)';
      db.query(insertUserQuery, [email, hashedPassword], (err) => {
        if (err) {
          console.error('Error inserting user:', err);
          return res.status(500).json({ error: 'Database insert error' });
        }
        res.status(201).json({ message: 'Sign-up successful!' });
      });
    });
  } catch (error) {
    console.error('Error processing sign-up request:', error);
    return res.status(500).json({ error: 'Server error during sign-up' });
  }
});

// Sign-in route
app.post('/api/auth/signin', (req, res) => {
  const { email, password } = req.body;

  // Input validation
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // Query the database for the user
  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email], async (err, results) => {
    if (err) {
      console.error('Error querying database:', err);
      return res.status(500).json({ error: 'Database query error' });
    }
    console.log('Database results:', results); 
    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = results[0];

    // Compare the provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isPasswordValid); 
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Successful sign-in
    res.status(200).json({ message: 'Sign-in successful!' });
  });
});

// Default route to check server status
app.get('/', (req, res) => {
  res.status(200).send('Server is running!');
});

// Start the server on port 3001
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});









