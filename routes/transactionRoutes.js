const express = require('express');
const Transaction = require('../models/Transaction'); // Adjust path based on your directory structure
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const router = express.Router();


/**
 * @swagger
 * components:
 *   schemas:
 *     Transaction:
 *       type: object
 *       required:
 *         - ExchangeRequestID
 *         - Status
 *       properties:
 *         ExchangeRequestID:
 *           type: string
 *           description: ID of the exchange request linked to the transaction
 *         Status:
 *           type: string
 *           enum: [Pending, Completed, Cancelled]
 *           description: Status of the transaction
 *         BookReturnedDate:
 *           type: string
 *           format: date
 *           description: Date the book was returned
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the transaction was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the transaction was last updated
 */

/**
 * @swagger
 * tags:
 *   name: Transactions
 *   description: API for managing book exchange transactions
 */

/**
 * @swagger
 * /transactions/auth:
 *   post:
 *     summary: Authenticate and generate a token
 *     tags: [Transactions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               clientId:
 *                 type: string
 *                 description: Client ID for authentication
 *     responses:
 *       200:
 *         description: Token generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 */

/**
 * @swagger
 * /transactions:
 *   post:
 *     summary: Create a new transaction
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Transaction'
 *     responses:
 *       201:
 *         description: Transaction created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
 *       400:
 *         description: Missing or invalid fields
 */

/**
 * @swagger
 * /transactions:
 *   get:
 *     summary: Get all transactions
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Transaction'
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /transactions/request/{exchangeRequestId}:
 *   get:
 *     summary: Get transaction by ExchangeRequestID
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: exchangeRequestId
 *         schema:
 *           type: string
 *         required: true
 *         description: Exchange Request ID
 *     responses:
 *       200:
 *         description: Transaction details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
 *       404:
 *         description: Transaction not found
 */

/**
 * @swagger
 * /transactions/{id}:
 *   get:
 *     summary: Get a specific transaction by ID
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Transaction ID
 *     responses:
 *       200:
 *         description: Transaction details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
 *       404:
 *         description: Transaction not found
 */

/**
 * @swagger
 * /transactions/{id}:
 *   put:
 *     summary: Update a transaction's details
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Transaction ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Transaction'
 *     responses:
 *       200:
 *         description: Transaction updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
 *       404:
 *         description: Transaction not found
 *       400:
 *         description: Missing or invalid fields
 */

/**
 * @swagger
 * /transactions/{id}:
 *   delete:
 *     summary: Delete a transaction
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Transaction ID
 *     responses:
 *       200:
 *         description: Transaction deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Transaction not found
 */


const authenticateToken = (req, res, next) => {
  const jwtSecret = process.env.JWT_SECRET;
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, jwtSecret, (err, user) => {
      if (err) return res.status(403).json({ message: 'Invalid token' });
      req.user = user; // Attach the user data to the request object
      next();
  });
};



router.post('/auth', async (req, res) => {    
  const jwtSecret = process.env.JWT_SECRET;
  const jwtClientId = process.env.JWT_CLIENTID;
  const { clientId } = req.body;

  if (clientId!=jwtClientId) {
      return res.status(401).send('Invalid credentials');
  }
  //const user1 = await User.findById(decoded.id).select('-password'); 
  const token = jwt.sign({ id: clientId}, jwtSecret, { expiresIn: '1h' });
  
  res.json({ token});
});


// Create a new transaction
router.post('/',authenticateToken, async (req, res) => {
  try {
    const { ExchangeRequestID, Status, BookReturnedDate } = req.body;

    const newTransaction = new Transaction({
      ExchangeRequestID,
      Status,
      BookReturnedDate,
    });

    const savedTransaction = await newTransaction.save();
    res.status(201).json(savedTransaction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all transactions
router.get('/',authenticateToken, async (req, res) => {
  try {
    const transactions = await Transaction.find().populate('RequestID', 'RequestID RequestedBy BookID');
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Get transaction by ExchangeRequestID
router.get('/request/:exchangeRequestId',authenticateToken, async (req, res) => {
  try {
    const { exchangeRequestId } = req.params;

    // Find the transaction linked to the ExchangeRequestID
    const transaction = await Transaction.findOne({ RequestID: exchangeRequestId });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.status(200).json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific transaction by ID
router.get('/:id',authenticateToken, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id).populate('ExchangeRequestID', 'RequestID RequestedBy BookID');
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.status(200).json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a transaction's details
router.put('/:id', authenticateToken,async (req, res) => {
  try {
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true } // Ensure validators run during update
    );

    if (!updatedTransaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.status(200).json(updatedTransaction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a transaction
router.delete('/:id',authenticateToken, async (req, res) => {
  try {
    const deletedTransaction = await Transaction.findByIdAndDelete(req.params.id);
    if (!deletedTransaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.status(200).json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
