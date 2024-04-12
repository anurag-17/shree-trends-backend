

const Product = require("../Model/ProductModel");
const User = require("../Model/User");
const ErrorResponse = require("../Utils/errorRes");
const validateMongoDbId = require("../Utils/validateMongodbId");
const mongoose = require("mongoose");
const CartItem = require("../Model/addCartModel");
const express = require('express');


// Add item to cart
exports.add_to_cart = async (req, res) => {
  try {
    const { user_id, product_id, name, price, quantity, size } = req.body;
    
    // Check if the item already exists in the cart for the user
    let existingCartItem = await CartItem.findOne({ user_id, product_id });

    if (existingCartItem) {
      // If the item already exists, update its quantity
    //   existingCartItem.quantity += quantity;
    //   await existingCartItem.save();
      return res.status(200).json({ status: true,message: 'item already exists in cart' });
    } else {
      // If the item does not exist, create a new cart item
      const newItem = new CartItem({
        user_id,
        product_id,                                                                                                                       
        name,
        price,
        quantity,
        size
      });

      await newItem.save();
      return res.status(201).json({ status: true, message: 'Item added to cart' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({status: false, message: 'Internal server error' });
  }
};


// Get all cart items for a user
exports.GetAllCartItem = async (req, res) => {
  try {
    const { user_id } = req.params;
    const cartItems = await CartItem.find({ user_id });
    if(cartItems.length>0){
      return res.status(200).json({ status:true,message: "data get successfully" ,data:cartItems});
        // res.status(200).json(cartItems);
    }else{
        return res.status(404).json({ status:false,message: "data not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: 'Internal server error' });
  }
};

// Get one cart item by its ID
exports.GetOneCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const cartItem = await CartItem.findById(id);
    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }
    // res.status(200).json(cartItem);
    return res.status(200).json({ status:true,message: "data get successfully" ,data:cartItem});

  } catch (error) {
    console.error(error);
    res.status(500).json({status: false, message: 'Internal server error' });
  }
};


// Update cart item (quantity, size)
exports.updateCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, size } = req.body;
    const updatedCartItem = await CartItem.findByIdAndUpdate(id, { quantity, size }, { new: true });
    if (!updatedCartItem) {
      return res.status(404).json({status: false, message:'Cart item not found' });
    }
    res.status(200).json({ status: true, message: 'Cart item updated successfully', data:updatedCartItem });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: 'Internal server error' });
  }
};

// Delete one cart item
exports.deleteOneCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCartItem = await CartItem.findByIdAndDelete(id);
    if (!deletedCartItem) {
      return res.status(404).json({ status: false, message: 'Cart item not found' });
    }
    res.status(200).json({status: true, message: 'Cart item deleted successfully', data:deletedCartItem });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: 'Internal server error' });
  }
};

// Delete all cart items
exports.deleteAllCartItem = async (req, res) => {

  try {
    const { user_id } = req.params;
    const deletedCartItems = await CartItem.deleteMany({ user_id });
    if (!deletedCartItems) {
        return res.status(404).json({ status: false, message: 'Cart item not found' });
      }
      res.status(200).json({status: true, message: 'All cart items deleted successfully', data:deletedCartItems});
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false,  message: 'Internal server error' });
  }
};


