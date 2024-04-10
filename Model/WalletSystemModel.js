const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const walletSystemSchema = new Schema({

  user_id:{
    type: String,
    // required: true
  },
  request_amount: {
    type: String,
    // required: true
  },
  payment_method: {
    type: Number,
    // required: true
  },
  payment_status: {
    type: String,
    // required: true
  },
  trancation_id: {
    type: String,
    // required: true
  },
  wallet_amount: {
    type: String,
    // required: true
  },
  approve_amount: {
    type: Number,
    // required: true
  },
  request_date: {
    type: Date,
    // required: true
  },
  approve_date: {
    type: Date,
    // required: true
  },
  outstanding_amount: {
    type: Number,
    // required: true
  },
  total_amount: {
    type: Number,
    // required: true
  },
  status: {
    type: Number,
    // required: true
  },
  currents_date: {
    type: Date,
    default: Date.now
  },
  device_id: {
    type: String,
    // required: true
  },
  deleted_At: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Create a Mongoose model
const WalletSystem = mongoose.model('WalletSystem', walletSystemSchema);

module.exports = WalletSystem;
