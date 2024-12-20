const db = require('../models/db');
const bcrypt = require('bcrypt');

// Sign-up logic
exports.signup = (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
  db.query(query, [username, email, hashedPassword], (err) => {
    if (err) {
      console.error('Error during sign-up:', err);
      res.status(500).json({ message: 'Sign-up failed' });
    } else {
      res.status(201).json({ message: 'Sign-up successful' });
    }
  });
};

// Sign-in logic
exports.signin = (req, res) => {
  const { email, password } = req.body;

  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error('Error during sign-in:', err);
      res.status(500).json({ message: 'Sign-in failed' });
    } else if (results.length === 0 || !bcrypt.compareSync(password, results[0].password)) {
      res.status(401).json({ message: 'Invalid credentials' });
    } else {
      res.status(200).json({ message: 'Sign-in successful' });
    }
  });
};
