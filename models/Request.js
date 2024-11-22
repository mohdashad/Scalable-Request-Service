const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  RequestID: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(), // Auto-generate ID
    unique: true,
  },
  RequestedBy: {
    type: String,
    required: true,
  },
  RequestedTo: {
    type: String,
    required: true,
  },
  BookID: {
    type: String,
    required: true,
  },
  RequestDate: {
    type: Date,
    default: Date.now,
  },
  Status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Rejected', 'Modified'],
    default: 'Pending',
  },
  DeliveryMethod: {
    type: String,
    enum: ['In-person', 'Shipping'],
    required: true,
  },
  Duration: {
    type: Number, // Assuming duration is in days; adjust type if needed
    required: true,
  },
  NegotiatedTerms: {
    type: String,
    default: '',
  },
},{ timestamps: true } );

module.exports = mongoose.model('Request', requestSchema);
