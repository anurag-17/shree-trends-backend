const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const withdrawalRequestSchema = new Schema({
  request_amount: {
    type: Number,
    default: null
  },
  approve_amount: {
    type: Number,
    default: null
  },
  payment_status: {
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
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },
  currents_date: {
    type: Date,
    default: Date.now
  },
  device_id: {
    type: String,
    default: null
  },
  total_amount: {
    type: Number,
    default: null
  },
  outstanding_amount: {
    type: Number,
    default: null
  },
  payment_method: {
    type: String,
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
const WithdrawalRequest = mongoose.model('WithdrawalRequest', withdrawalRequestSchema);

module.exports = WithdrawalRequest;
