const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  TransactionID: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(), // Auto-generate ID
    unique: true,
  },
  RequestID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Request', // Reference to ExchangeRequest model
    required: true,
  },
  OwnerID: {
    type: String,
    required: true,
  },
  BooKID: {
    type: String,
    ref: 'Book', // Reference to ExchangeRequest model
    required: true,
  },
  Status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Shipping','Delivered', 'Cancelled'],
    required: true,
    default: 'Pending',
  },
  TransactionDate: {
    type: Date,
    default: Date.now,
  },
  BookReturnedDate: {
    type: Date,
  },
});

module.exports = mongoose.model('Transaction', transactionSchema);
