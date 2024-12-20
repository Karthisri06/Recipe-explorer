const express = require('express');
const bcrypt = require('bcryptjs'); // For hashing passwords
const db = require('./index'); // Database connection

const router = express.Router();

/**
 * Route: POST /api/auth/signup
 * Description: Handles user registration
 */
router.post('/signup', async (req, res) => {
  const { email, password, confirmPassword } = req.body;

  // Input validation
  if (!email || !password || !confirmPassword) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  // Check if email already exists
  const checkEmailQuery = 'SELECT * FROM users WHERE email = ?';
  db.query(checkEmailQuery, [email], async (err, result) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (result.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    try {
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert new user into database
      const insertUserQuery = 'INSERT INTO users (email, password) VALUES (?, ?)';
      db.query(insertUserQuery, [email, hashedPassword], (err) => {
        if (err) {
          console.error('Error inserting user:', err);
          return res.status(500).json({ error: 'Error saving user' });
        }
        res.status(201).json({ message: 'Sign-up successful!' });
      });
    } catch (hashErr) {
      console.error('Error hashing password:', hashErr);
      return res.status(500).json({ error: 'Error processing request' });
    }
  });
});

/**
 * Route: POST /api/auth/signin
 * Description: Handles user login
 */

// Sign-in Route
router.post('/signin', (req, res) => {
    const { email, password } = req.body;
  
    // Input validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
  
    // Query to find user by email
    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], async (err, results) => {
      if (err) {
        console.error('Error querying user:', err);
        return res.status(500).json({ error: 'Error querying the database' });
      }
  
      if (results.length === 0) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
  
      const user = results[0];
      console.log('User retrieved:', user);
  
      // Compare the provided password with the hashed password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
  
      res.status(200).json({ message: 'Sign-in successful!' });
    });
  });
  
  module.exports = router;










