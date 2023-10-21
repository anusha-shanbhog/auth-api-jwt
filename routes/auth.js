const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Route for user registration
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate user input
    if (!name || name.length < 6) {
      return res.status(400).json({ error: 'Name is required and must be at least 6 characters long' });
    }

    if (!email || email.length < 6 || !isValidEmail(email)) {
      return res.status(400).json({ error: 'Valid email is required and must be at least 6 characters long' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password is required and must be at least 6 characters long' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    // Check if the email is already in use
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email address already exists' });
    }

    // Create a new user
    const user = new User({
      name,
      email,
      password: hashPassword,
    });

    // Save the user to the database
    const savedUser = await user.save();

    // Respond with the created user
    res.status(201).json(savedUser); // 201 Created for successful registration
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ error: 'Internal server error' }); // 500 Internal Server Error with error details
  }
});

// A simple email validation function
function isValidEmail(email) {
  const emailRegex = /^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;
  return emailRegex.test(email);
}

router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Validate user input
      if (!email || email.length < 6 || !isValidEmail(email)) {
        return res.status(400).json({ error: 'Valid email is required and must be at least 6 characters long' });
      }
  
      if (!password || password.length < 6) {
        return res.status(400).json({ error: 'Password is required and must be at least 6 characters long' });
      }
  
      // Check if the user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ error: 'User not found. Please register if you are a new user.' });
      }
  
      // Compare the provided password with the hashed password in the database
      const isPasswordValid = await bcrypt.compare(password, user.password);
  
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid password' });
      }
       //create and assign a token
      const token = jwt.sign({_id: user._id}, process.env.TOKEN_SECRET);
      res.header('auth-token', token).send(token);

      // At this point, the login is successful
      
    } catch (err) {
      console.error('Error during login:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
 
  module.exports = router;