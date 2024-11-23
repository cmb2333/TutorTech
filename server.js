const express = require('express');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());


// -------------------------------- User Login --------------------------------
app.post('/login', async (req, res) => {
    const { user_id, password } = req.body;
  
    try {
      // Check if user exists and password matches
      const result = await pool.query(
        'SELECT * FROM login_information WHERE user_id = $1 AND password = $2',
        [user_id, password]
      );
  
      if (result.rows.length === 0) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }
  
      // Get user information
      const userInfo = await pool.query(
        'SELECT first_name, last_name FROM student_information WHERE user_id = $1',
        [user_id]
      );
  
      const { first_name, last_name } = userInfo.rows[0];
      
      // Send user details to frontend
      res.json({
        message: 'Login successful',
        user_id,
        first_name,
        last_name
      });
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  

app.listen(3001, () => {
  console.log('Server running on port 3001');
});
