const User = require("../Model/User");
const Admin = require("../Model/AdminModel");
const WalletSystem = require("../Model/WalletSystemModel");
const TransactionHistory = require("../Model/trancation_histroy.model");
const sendEmail = require("../Utils/SendEmail");
const validateMongoDbId = require("../Utils/validateMongodbId");
const { generateToken, verifyToken } = require("../config/jwtToken");
const sendToken = require("../Utils/jwtToken");
const uploadOnS3 = require("../Utils/uploadImage");
const Vendor = require("../Model/vendorModel");
const WithdrawalRequest = require("../Model/WithdrawalRequestModel");

// Generate transaction ID
function generateTransactionId() {
  // Generate a random string
  const randomString = Math.random().toString(36).substr(2, 10).toUpperCase(); // Example: "ABC123"
  // Get current timestamp
  const timestamp = Date.now().toString(); // Example: "1645430912345"
  // Combine random string and timestamp to generate transaction ID
  return `${randomString}-${timestamp}`; // Example: "ABC123-1645430912345"
}



exports.addWalletAmount = async (req, res, next) => {
  try {
    const { user_id, payment_method, wallet_amount, device_id, payment_status, user_type } = req.body;
    console.log(payment_status);
    // Check for empty or undefined fields
    const isEmptyKey = Object.keys(req.body).some(key => {
      const value = req.body[key];
      return value === '' || value === null || value === undefined;
    });

    if (isEmptyKey) {
      return res.json({ status: false, message: "Please do not give empty or undefined or null fields" });
    }
    const equal_amount = '50000'
    if (wallet_amount < equal_amount) {
      console.log(typeof (wallet_amount), typeof (equal_amount));
      return res.json({ status: false, message: "add wallet ammount up to 50000" });
    }

    // Check if user exists
    const userExists = await User.findById(user_id);
    console.log(userExists);
    if (!userExists) {
      return res.status(404).json({ status: false, message: "User does not exist" });
    }

    // Check for existing wallet system entry
    let walletSystem = await WalletSystem.findOne({ user_id: user_id });
    console.log(walletSystem);
    if (walletSystem) {
      console.log("in");

      // Wallet exists, update it
      const newBalance = parseFloat(wallet_amount) + parseFloat(walletSystem.wallet_amount);
      await WalletSystem.findOneAndUpdate({ user_id: user_id }, { wallet_amount: newBalance });

      // Log transaction history
      const transactionId = generateTransactionId();
      await TransactionHistory.create({
        user_id: user_id,
        payment_method,
        payment_status,
        transaction_amount: wallet_amount,
        transaction_id: transactionId,
        device_id,
        status: 1,
        user_type: user_type
      });

      return res.json({ status: true, wallet_amount: newBalance, message: "Your Wallet amount updated successfully" });
    } else {
      console.log("out");
      // No wallet entry exists, create it
      walletSystem = await WalletSystem.create({
        user_id: user_id,
        wallet_amount,
        // Assuming you might want to store additional fields like device_id, etc.
      });
      console.log(walletSystem);
      // Log transaction history
      await TransactionHistory.create({
        user_id: user_id,
        payment_method,
        payment_status,
        wallet_amount,
        transaction_id: transactionId,
        status: 1,
        user_type: user_type
      });

      return res.json({ status: true, wallet_amount, message: "Your Wallet amount added successfully" });
    }
  } catch (error) {
    console.error("Error adding wallet amount:", error);
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
};




exports.transactionDetails = async (req, res) => {
  const { user_id } = req.query;
  try {
    if (!user_id) {
      return res.status(400).json({ status: false, message: "Please provide user_id" });
    }
    // Find transaction data based on user_id
    const transactionData = await TransactionHistory.find({ user_id: user_id })
      .sort({ _id: -1 })
      .exec();

    if (transactionData && transactionData.length > 0) {
      return res.status(200).json({
        status: true,
        message: "Transaction data retrieved successfully",
        list: transactionData
      });
    } else {
      return res.status(400).json({ status: false, message: "No transaction data found for the user" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
};


exports.withdrawalAmount = async (req, res) => {
  try {
    const { user_id, amount } = req.body;
    console.log(user_id);
    if (!user_id) {
      return res.status(400).json({ status: false, message: "Please provide user_id" });
    }

    // Find user by user_id (You need to define your User model and import it)
    const userExists = await User.findById(user_id);
    if (!userExists) {
      return res.status(404).json({ status: false, message: "User does not exist" });
    }


    // Check for existing wallet system entry
    const walletSystem = await WalletSystem.findOne({ user_id: user_id });
    if (!walletSystem) {
      return res.status(404).json({ status: false, message: "Wallet does not exist" });
    }

    const walletBalance = parseFloat(walletSystem.wallet_amount);
    const requestedAmount = parseFloat(amount);

    // Check if requested amount exceeds wallet balance
    if (requestedAmount > walletBalance) {
      return res.status(400).json({ status: false, message: "Insufficient wallet balance" });
    }

    // Update wallet balance
    const newBalance = walletBalance - requestedAmount;
    await WalletSystem.findOneAndUpdate({ user_id: user_id }, { wallet_amount: newBalance });

    // Log transaction history
    const transactionId = generateTransactionId();
    await TransactionHistory.create({
      user_id: user_id,
      payment_method: "online",
      transaction_amount: requestedAmount,
      transaction_id: transactionId,
      status: 1,
      //   user_type: user_type
    });

    return res.json({ status: true, message: "Wallet amount updated successfully", wallet_amount: newBalance });
  } catch (error) {
    console.error("Error while deducting amount from wallet:", error);
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
};


exports.withdrawalRequest = async (req, res) => {
  try {
    const { user_id, requested_amount } = req.body;

    if (!user_id) {
      return res.status(400).json({ status: false, message: "Please provide user_id" });
    }

    // Check if user exists
    const userExists = await User.findById(user_id);
    if (!userExists) {
      return res.status(404).json({ status: false, message: "Expert does not exist" });
    }

    // Check for existing wallet system entry
    let walletSystem = await WalletSystem.findOne({ user_id: user_id });
    console.log(walletSystem);
    if (!walletSystem) {
      return res.status(404).json({ status: false, message: "Wallet does not exist" });
    }

    const walletBalance = parseFloat(walletSystem.wallet_amount);
    const requestedAmount = parseFloat(requested_amount);

    // Check if requested amount exceeds wallet balance
    if (requestedAmount > walletBalance) {
      return res.status(400).json({ status: false, message: "withdrawal request for an amount greater than the withdrawal balance" });
    }

    // Create withdrawal request
    await WithdrawalRequest.create({
      request_amount: requestedAmount,
      request_date: new Date(),
      status: "pending",
      user_id: user_id
    });

    return res.json({ status: true, message: "Withdrawal request Send successfully" });
  } catch (error) {
    console.error("Withdrawal Request", error);
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
};


