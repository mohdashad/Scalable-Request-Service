const express = require('express');
const mongoose = require('mongoose');
const Request = require('../models/Request'); // Adjust the path based on your directory structure
const Transaction = require('../models/Transaction'); // Adjust path based on your directory structure
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Request:
 *       type: object
 *       required:
 *         - RequestedBy
 *         - BookID
 *         - DeliveryMethod
 *         - Duration
 *       properties:
 *         RequestedBy:
 *           type: string
 *           description: ID of the user making the request
 *         RequestedTo:
 *           type: string
 *           description: ID of the user receiving the request
 *         BookID:
 *           type: string
 *           description: ID of the requested book
 *         RequestDate:
 *           type: string
 *           format: date-time
 *           description: The date the request was made
 *         Status:
 *           type: string
 *           enum: [Pending, Accepted, Rejected]
 *           description: The status of the request
 *         DeliveryMethod:
 *           type: string
 *           description: The method of book delivery
 *         Duration:
 *           type: string
 *           description: Duration of the book exchange
 *         NegotiatedTerms:
 *           type: string
 *           description: Negotiated terms for the book exchange
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the request was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the request was last updated
 */

/**
 * @swagger
 * tags:
 *   name: Requests
 *   description: API for managing book exchange requests
 */

/**
 * @swagger
 * /requests/auth:
 *   post:
 *     summary: Authenticate and generate a token
 *     tags: [Requests]
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
 * /requests:
 *   post:
 *     summary: Create a new book exchange request
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Request'
 *     responses:
 *       201:
 *         description: Request created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 Request:
 *                   $ref: '#/components/schemas/Request'
 *       400:
 *         description: Missing or invalid fields
 */

/**
 * @swagger
 * /requests:
 *   get:
 *     summary: Get all requests
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all requests
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Request'
 */

/**
 * @swagger
 * /requests/user/{userId}:
 *   get:
 *     summary: Get requests related to a user
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: List of requests related to the user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Request'
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /requests/{id}:
 *   get:
 *     summary: Get a specific request by ID
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Request ID
 *     responses:
 *       200:
 *         description: Request details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Request'
 *       404:
 *         description: Request not found
 */

/**
 * @swagger
 * /requests/{id}:
 *   put:
 *     summary: Update a request
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Pending, Accepted, Rejected]
 *                 description: New status for the request
 *     responses:
 *       200:
 *         description: Request updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Request'
 *       404:
 *         description: Request not found
 */

/**
 * @swagger
 * /requests/{id}:
 *   delete:
 *     summary: Delete a request
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Request ID
 *     responses:
 *       200:
 *         description: Request deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Request not found
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


// Create a new request
router.post('/',authenticateToken, async (req, res) => {
  try {
    const { RequestedBy, BookID, DeliveryMethod, Duration, NegotiatedTerms,RequestedTo } = req.body;


     // Ensure all required fields are provided
     if (!RequestedBy || !BookID || !DeliveryMethod || !Duration) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    const newRequest = new Request({
      RequestedBy,
      RequestedTo,
      BookID,
      RequestDate: new Date(),
      Status: 'Pending', // Initial status
      DeliveryMethod,
      Duration,
      NegotiatedTerms,
    });



    const savedRequest = await newRequest.save();//.populate('BookID', 'OwnerID email');
    //const bookDetail = await Book.findById(BookID);
    // Notify the book owner and the requester
    /*
    const notifications = [
      {
        UserID: RequestedBy,
        Message: `You have successfully requested to borrow Book ID ${BookID}.`,
        Type: 'Exchange Status Update',
        Timestamp: new Date(),
        IsRead: false,
      },
      {
        UserID: bookDetail.OwnerID, // Assuming the book model has an owner field
        Message: `User ID ${RequestedBy} has requested to borrow your book.`,
        Type: 'Exchange Status Update',
        Timestamp: new Date(),
        IsRead: false,
      },
    ];

    await Notification.insertMany(notifications);
    */
    res.status(201).json({
      message: 'Exchange request created successfully.',
      Request: savedRequest,
    });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all requests
router.get('/',authenticateToken, async (req, res) => {
  try {
    const requests = await Request.find();
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Fetch requests related to the user
router.get('/user/:userId',authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;

    // Find requests where the user is either the requester or the book owner
    const requests = await Request.find({
      $or: [
        { RequestedBy: userId },
        { RequestedTo: userId }
      ]
    });

    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific request by ID
router.get('/:id',authenticateToken, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a request
router.put('/:id',authenticateToken, async (req, res) => {
  try {
    const requestId = req.params.id;
    const { status } = req.body;

    if (!['Pending', 'Accepted', 'Rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updatedRequest = await Request.findByIdAndUpdate(
      requestId,
      { Status: status },
      { new: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({ error: 'Request not found' });
    }
   
    // If the status is 'Accepted', create a transaction
    if (status === 'Accepted') {
      const transaction = new Transaction({
        RequestID: requestId,
        OwnerID:updatedRequest.RequestedTo,
        BooKID:updatedRequest.BookID,
        Status: 'Pending',
        TransactionDate: new Date(), // Current date
      });

      await transaction.save();
    }
   

    res.status(200).json(updatedRequest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a request
router.delete('/:id',authenticateToken, async (req, res) => {
  try {
    const deletedRequest = await Request.findByIdAndDelete(req.params.id);

    if (!deletedRequest) {
      return res.status(404).json({ error: 'Request not found' });
    }
    res.status(200).json({ message: 'Request deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
