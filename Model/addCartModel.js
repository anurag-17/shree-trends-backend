const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cartItemSchema = new Schema({
  user_id: {
    type: String,
    // required: true
  },
  product_id: {
    type: String,
    // required: true
  },
  name: {
    type: String,
    // required: true
  },
  price: {
    type: Number,
    // required: true
  },
  quantity: {
    type: Number,
    // required: true
    default: 1 // Default quantity is 1
  },
  size: {
    type: String,
    // required: true
    // default: 1 // Default quantity is 1
  },
  added_at: {
    type: Date,
    default: Date.now
  },
  // You can add more fields here such as product details, variant, etc.
});

// Create a Mongoose model
const CartItem = mongoose.model('CartItem', cartItemSchema);

module.exports = CartItem;
