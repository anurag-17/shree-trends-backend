const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const transactionHistorySchema = new Schema({
  user_type: {
    type: String,
    default: null
  },
  request_amount: {
    type: String,
    default: null
  },
  payment_status: {
    type: String,
    default: null
  },
  transaction_id: {
    type: String,
    default: null
  },
  approve_amount: {
    type: String,
    default: null
  },
  request_date: {
    type: Date,
    default: null
  },
  approve_date: {
    type: Date,
    default: null
  },
  outstanding_amount: {
    type: Number,
    default: null
  },
  transaction_amount: {
    type: Number,
    default: null
  },
  status: {
    type: Number,
    default: null
  },
  currents_date: {
    type: Date,
    default: Date.now
  },
  payment_method: {
    type: String,
    default: null
  },
  device_id: {
    type: String,
    default: null
  },
  amount_receiver_id: {
    type: Number,
    default: null
  },
  user_id: {
    type: String,
    default: null
  },
  deleted_At: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Create a Mongoose model
const TransactionHistory = mongoose.model('TransactionHistory', transactionHistorySchema);

module.exports = TransactionHistory;
