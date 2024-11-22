// app.js
const express = require('express');
const mongoose = require('mongoose');
const requestRoutes = require('./routes/requestRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
//const forgetPassword = require('./routes/forget-passwordRoutes'); // Import user routes
const cors = require('cors');
const swaggerUI = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const app = express();
const PORT = 7000;
require('dotenv').config();

// Middleware to parse JSON
app.use(express.json());
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/ScalableReques', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('Failed to connect to MongoDB', err));

//const User = require('../models/User');
app.use(cors());
// Use the user routes
app.use('/api/request', requestRoutes);
app.use('/api/transaction', transactionRoutes);
//app.use('/api/forget-password', forgetPassword);


// Sample route
app.get('/Test', (req, res) => {
  res.send('Hello, MongoDB with Express!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
