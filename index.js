const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();
// Import routes
const authRoute = require('./routes/auth'); 
const postRoute = require('./routes/posts');

// Connect to the database using async/await
async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.DB_CONNECT);
    console.log('Connected to the database');
  } catch (error) {
    console.error('Error connecting to the database:', error);
  }
}

// Call the connectToDatabase function to establish the database connection
connectToDatabase();

//middleware
app.use(express.json());

// Routes middlewares
app.use('/api/user', authRoute);
app.use('/api/posts', postRoute);

app.listen(3000, () => console.log('Server up and running'));
