const User = require("../Model/User");
const Admin = require("../Model/AdminModel");
const sendEmail = require("../Utils/SendEmail");
const validateMongoDbId = require("../Utils/validateMongodbId");
const { generateToken, verifyToken } = require("../config/jwtToken");
const sendToken = require("../Utils/jwtToken");
const jwt = require("jsonwebtoken");
const uploadOnS3 = require("../Utils/uploadImage");
const Vendor = require("../Model/vendorModel");
const WithdrawalRequest = require("../Model/WithdrawalRequestModel");
const WalletSystem = require("../Model/WalletSystemModel");
const TransactionHistory = require("../Model/trancation_histroy.model");


   // Generate transaction ID
   function generateTransactionId() {
    // Generate a random string
    const randomString = Math.random().toString(36).substr(2, 10).toUpperCase(); // Example: "ABC123"
    // Get current timestamp
    const timestamp = Date.now().toString(); // Example: "1645430912345"
    // Combine random string and timestamp to generate transaction ID
    return `${randomString}-${timestamp}`; // Example: "ABC123-1645430912345"
  }







exports.getAdminReferralBy_AdminId = async (req, res, next) => {
    const { adminId } = req.params;
  console.log(adminId);
    try {
      const admin = await Admin.findById(adminId);
      console.log(admin);
      if (!admin) {
        return res.status(404).json({ error: "Admin not found" });
      }
  
      const referredUsers = await User.find({ referredBy: adminId }).populate("referredBy");
  
      return res.status(200).json({ Status: 200,Massage: "Admin referral details fetched successfully", 
       
        admin: {
          _id: admin._id,
          firstname: admin.firstname,
          lastname: admin.lastname,
          userName: admin.userName,
          email: admin.email,
          mobile: admin.mobile,
          altNumber: admin.altNumber,
          role: admin.role,
          address: admin.address,
          gstNo: admin.gstNo,
          companyName: admin.companyName,
          referralCode: admin.referralCode
        },
        referredUsers: referredUsers.map(user => ({
          _id: user._id,
          firstname: user.firstname,
          lastname: user.lastname,
          userName: user.userName,
          email: user.email,
          mobile: user.mobile,
          altNumber: user.altNumber,
          role: user.role,
          address: user.address,
          gstNo: user.gstNo,
          companyName: user.companyName,
          referralCode: user.referralCode
        }))
      });
    
    } catch (error) {
      next(error);
      res.status(500).json({ status:false,error: 'Internal server error' });

    }
  };
  
  exports.getAllDealerReferral = async (req, res, next) => {
    const { subDealerId } = req.params;
  
    try {
      const subDealer = await User.findById(subDealerId);
      if (!subDealer) {
        return res.status(404).json({ status: false, message: "Sub-dealer not found" });
      }
  
      const referredUsers = await Vendor.find({ referredBy: subDealerId });
  
      return res.status(200).json({ status:true,
        subDealer: {
          _id: subDealer._id,
          firstname: subDealer.firstname,
          lastname: subDealer.lastname,
          userName: subDealer.userName,
          email: subDealer.email,
          mobile: subDealer.mobile,
          altNumber: subDealer.altNumber,
          role: subDealer.role,
          address: subDealer.address,
          gstNo: subDealer.gstNo,
          companyName: subDealer.companyName,
          referralCode: subDealer.referralCode
        },
        referredUsers: referredUsers.map(user => ({
          _id: user._id,
          firstname: user.firstname,
          lastname: user.lastname,
          userName: user.userName,
          email: user.email,
          mobile: user.mobile,
          altNumber: user.altNumber,
          role: user.role,
          address: user.address,
          gstNo: user.gstNo,
          companyName: user.companyName,
          referralCode: user.referralCode
        }))
      });
    } catch (error) {
      next(error);
      res.status(500).json({ status:false,error: 'Internal server error' });

    }
  };


  exports.getAllDealersReferralDetails = async (req, res, next) => {
    const { adminId } = req.params;
  
    try {
      // Find all dealers
      const dealers = await User.find({ role: 'dealer' });
  
      // If no dealers found, return an empty array
      if (!dealers || dealers.length === 0) {
        return res.status(404).json({ status: false, message: "No dealers found" });
      }
  
      // Filter dealers based on adminId existence in referredBy field
      const adminDealers = dealers.filter(dealer => dealer.referredBy && dealer.referredBy.toString() === adminId);
  
      // If no admin dealers found, return an empty array
      if (!adminDealers || adminDealers.length === 0) {
        return res.status(404).json({ status: false, message: "No dealers associated with the admin found" });
      }
  
      // Iterate over each dealer and retrieve referral details
      const dealerDetails = await Promise.all(adminDealers.map(async (dealer) => {
        const referredUsers = await Vendor.find({ referredBy: dealer._id });
        return {
          dealer: {
            _id: dealer._id,
            firstname: dealer.firstname,
            lastname: dealer.lastname,
            userName: dealer.userName,
            email: dealer.email,
            mobile: dealer.mobile,
            altNumber: dealer.altNumber,
            role: dealer.role,
            address: dealer.address,
            gstNo: dealer.gstNo,
            companyName: dealer.companyName,
            referralCode: dealer.referralCode
          },
          referredSubDealers: referredUsers.map(user => ({
            _id: user._id,
            email: user.email,
            role: user.role,
            address: user.address,
            companyName: user.companyName
          }))
        };
      }));
      return res.status(200).json({Status: true ,Massage: "Dealers referral details fetched successfully", data: dealerDetails});
    //   return res.status(200).json(dealerDetails);
    } catch (error) {
      next(error);
       res.status(500).json({ status:false,error: 'Internal server error' });

    }
  };
  


exports.getWithdrawalRequest = async (req, res) => {
  try {
    const { status } = req.query;
    const page = parseInt(req.query.page) || 1; // Current page
    const limit = parseInt(req.query.limit) || 10; // Number of items per page
   
    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    let query = {};
    if (status === 'pending') {
      query.status = status;
    } else {
      query.status = { $in: ['approved', 'rejected'] };
    }

    const data = await WithdrawalRequest.find(query)
      .populate('status')
      .sort({ _id: -1 }) // Sort by descending order of _id
      .skip(offset)
      .limit(limit)
      .exec();

    const totalItems = await WithdrawalRequest.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limit);
    const currentPage = page;

    res.json({
      status:true,
      message:"Get All Data successfully",
      currentPage: currentPage,
      totalPages: totalPages,
      totalItems: totalItems,
      data: data
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ status:false,error: 'Internal server error' });
  }
};





exports.updateWithdrawalRequestStatus = async (req, res) => {
  try {
    const { withdrawal_request_id, user_id ,status,requestedAmount} = req.body;

    if (!withdrawal_request_id) {
      return res.status(400).json({ status: false, message: "Please provide withdrawal_request_id" });
    }
    if (!user_id) {
      return res.status(400).json({ status: false, message: "Please provide user_id" });
    }

    // Check if user exists
    const userExists = await User.findById(user_id);
    if (!userExists) {
      return res.status(404).json({ status: false, message: "User does not exist" });
    }

    // Check for existing wallet system entry
    const walletSystem = await WalletSystem.findOne({ user_id: user_id });
    if (!walletSystem) {                                                                                                                                                                                                                                                                                                                                     
      return res.status(404).json({ status: false, message: "Wallet does not exist" });
    }

    // const walletBalance = parseFloat(walletSystem.wallet_amount);
    // const outstandingAmountBalance = parseFloat(walletSystem.outstanding_amount);
    // const requestedAmount = parseFloat(requested_amount);

    // // Check if requested amount exceeds wallet balance
    // if (requestedAmount > walletBalance) {
    //   return res.status(400).json({ status: false, message: "Insufficient wallet balance" });
    // }

    // Update wallet balance
    // const newBalance = walletBalance - requestedAmount;
    // await WalletSystem.findOneAndUpdate({ UserId: user_id }, { wallet_amount: newBalance });

    // Add requested amount to outstanding amount
    // const outstandingBalance = outstandingAmountBalance + requestedAmount;
    // await WalletSystem.findOneAndUpdate({ UserId: user_id }, { outstanding_amount: outstandingBalance });

    // Log transaction history
    // const user_Type = parseInt(userExists.user_type);
    const transactionId = generateTransactionId();
    await TransactionHistory.create({
      user_id: user_id,
      payment_method: "online",
      transaction_amount: requestedAmount,
      transaction_id: transactionId,
      status: 1,
      // user_type: user_Type
    });

    // Update withdrawal request status
    await WithdrawalRequest.findByIdAndUpdate(withdrawal_request_id, { status: status });

    return res.json({ status: true, message: "Withdrawal request status updated successfully" });
  } catch (error) {
    console.error("Error updating withdrawal request status:", error);
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
};




  


