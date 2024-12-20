const mysql = require("mysql2");

// Database connection
const db = mysql.createConnection({
  host: "localhost", // Your database host (usually 'localhost')
  user: "root", // Replace with your MySQL username
  password: "sri@2004", // Replace with your MySQL password
  database: "recipe_explorer", // Your database name
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error("Database connection error:", err);
  } else {
    console.log("Conneted to MySQL!");
  }
});

// Export the connection for use in other files (like auth.js)
module.exports = db; 



