const User = require("../Model/User");
const Admin = require("../Model/AdminModel");
const sendEmail = require("../Utils/SendEmail");
const validateMongoDbId = require("../Utils/validateMongodbId");
const { generateToken, verifyToken } = require("../config/jwtToken");
const sendToken = require("../Utils/jwtToken");
const jwt = require("jsonwebtoken");
const uploadOnS3 = require("../Utils/uploadImage");
const Vendor = require("../Model/vendorModel");

exports.uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Invalid request" });
    }

    let fileName = req.file.originalname;

    let url = await uploadOnS3(req.file.buffer, fileName);
    console.log("URL:::=>", url);
    return res.status(200).json({ status: true, url: url });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.register = async (req, res, next) => {
  const { firstname, lastname, userName, email, mobile, altNumber, gstNo, companyName, password, role, address, referralCode } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(203).json({ error: "User with this email already exists." });
  }

  let referredBy;
  let secretOrPrivateKey;


  // Check referral code against Admin model
  referredBy = await Admin.findOne({ referralCode });
  console.log("referredBy", referredBy);

  // Check if the referral code is valid
  if (!referredBy) {
    return res.status(400).json({ error: "Invalid referral code" });
  }

  // if (referredBy) {
  //   secretOrPrivateKey = await User.findOne({ referralCode });
  // }

  const userData = {
    email,
    // provider_ID: req.body.provider_ID,
    // provider: req.body.provider,
    firstname: firstname,
    lastname: lastname,
    mobile: mobile,
    role: role,
    address: address,
    userName: userName,
    altNumber: altNumber,
    gstNo: gstNo,
    companyName: companyName,
    referredBy: referredBy._id
  };

  if (password) {
    userData.password = password;
  }

  try {
    const newUser = await User.create(userData);
    sendToken(newUser, 201, res);
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email) {
    return next(new ErrorResponse("Please provide Email", 400));
  }

  try {
    const findUser = await User.findOne({ email }).select("+password");

    // If user exists and is authenticated via a third-party provider
    if (findUser && !findUser.password) {
      // const token = generateToken({ id: findUser._id });
      const token = generateToken(findUser._id, findUser.role);

      await User.findByIdAndUpdate(
        { _id: findUser._id?.toString() },
        { activeToken: token },
        { new: true }
      );

      const user = {
        success: true,
        user: {
          _id: findUser._id,
          firstname: findUser.firstname,
          lastname: findUser.lastname,
          email: findUser.email,
          referralCode: findUser.referralCode,
          companyName: findUser.companyName,
          referredBy: findUser.referredBy
          // provider: findUser.provider,
        },
        token: token,
      };

      return res.status(200).json(user);
    }

    // If user exists and has a password, continue with password-based authentication
    if (findUser && (await findUser.matchPasswords(password))) {
      // const token = generateToken({ id: findUser._id });
      const token = generateToken(findUser._id, findUser.role);

      await User.findByIdAndUpdate(
        { _id: findUser._id?.toString() },
        { activeToken: token },
        { new: true }
      );

      const user = {
        success: true,
        user: {
          _id: findUser._id,
          firstname: findUser.firstname,
          lastname: findUser.lastname,
          email: findUser.email,
          referralCode: findUser.referralCode,
          companyName: findUser.companyName,
          referredBy: findUser.referredBy
          // provider: findUser.provider,
        },
        token: token,
      };

      return res.status(200).json(user);
    } else {
      return res.status(401).json({ error: "Invalid Credentials" });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.adminRegister = async (req, res, next) => {
  const { email, password } = req.body;
  console.log({ email, password });
  const existingUser = await Admin.findOne({ email });
  console.log(existingUser);
  if (existingUser) {
    return res.status(203).json({ error: "Admin with this email already exists." });
  }

  const userData = {
    email,
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    mobile: req.body.mobile
  };
  console.log("userData", userData);
  if (password) {
    userData.password = password;
  }

  try {
    const newUser = await Admin.create(userData);
    console.log("newUser", newUser);
    sendToken(newUser, 201, res);
  } catch (error) {
    console.log("logcatch");
    next(error);
  }
};

exports.adminLogin = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const findAdmin = await Admin.findOne({ email }).select("+password");

    if (!findAdmin) {
      throw new Error("Admin not found");
    }

    if (findAdmin.role !== "admin") {
      throw new Error("Not Authorized");
    }

    if (await findAdmin.matchPasswords(password)) {
      // const token = generateToken({ id: findAdmin._id });
      const token = generateToken(findAdmin._id, findAdmin.role);

      await Admin.findByIdAndUpdate(
        { _id: findAdmin._id?.toString() },
        { activeToken: token },
        { new: true }
      );
      const user = {
        success: true,
        user: {
          _id: findAdmin._id,
          firstname: findAdmin.firstname,
          lastname: findAdmin.lastname,
          email: findAdmin.email,
          referralCode: findAdmin.referralCode,
          companyName: findAdmin.companyName,
        },
        token: token,
      };

      return res.status(200).json(user);
    } else {
      throw new Error("Invalid Credentials");
    }
  } catch (error) {
    res.status(401).json({
      success: false,
      error: error.message,
    });
  }
};




exports.logout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      token = authHeader;
    }

    if (!token) {
      return res
        .status(401)
        .json({ status:false,message: "Please login to access this resource" });
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET);

    const userData = await User.findOne({ _id: decodedData?.id });

    if (userData.activeToken && userData.activeToken === token) {
      const user = await User.findOneAndUpdate(
        { _id: decodedData.id, activeToken: token },
        { $unset: { activeToken: "" } },
        { new: true }
      );
      if (!user) {
        return res
          .status(401)
          .json({ status:false,message: "Invalid session or token, please login again" });
      }
      return res.status(200).json({
        status:true,message: `${userData._id} is Logout Successfully`,
      });
    } else {
      return res
        .status(401)
        .json({ status:false,message: "Token expired, please login again" });
    }
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ status:false,message: "Token expired, please login again" });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ status:false,message: "Invalid token" });
    } else {
      console.error("Other error:", error);
      return res.status(500).json({ status:false,message: "Server error" }); 
    }
  }
};

exports.adminLogout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      token = authHeader;
    }

    if (!token) {
      return res
        .status(401)
        .json({ status:false,message: "Please login to access this resource" });
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET);

    const userData = await Admin.findOne({ _id: decodedData?.id });

    if (userData.activeToken && userData.activeToken === token) {
      const user = await Admin.findOneAndUpdate(
        { _id: decodedData.id, activeToken: token },
        { $unset: { activeToken: "" } },
        { new: true }
      );
      if (!user) {
        return res
          .status(401)
          .json({status:false,message:"Invalid session or token, please login again" });
      }
      return res.status(200).json({
        status:true,message:`${userData._id} is Logout Successfully`,
      });
    } else {
      return res
        .status(401)
        .json({ status:false,message:"Token expired, please login again" });
    }
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ status:false,message: "Token expired, please login again" });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ status:false,message: "Invalid token" });
    } else {
      console.error("Other error:", error);
      return res.status(500).json({ status:false,message: "Server error" });
    }
  }
};

exports.forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json(`status:false,message:${email} this email is not registered`);
    }
    const resetToken = user.getResetPasswordToken();
    await user.save();

    const resetUrl = `http://localhost:4000/auth/reset-password/${resetToken}`;

    const message = `
    <!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #e0e0e0;
            border-radius: 5px;
        }
        .header {
            background-color: #f5f5f5;
            padding: 10px;
            border-radius: 5px 5px 0 0;
        }
        .content {
            padding: 20px;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #4CAF50;
            color: white !important;
            text-decoration: none;
            border-radius: 5px;
        }
        .footer {
            background-color: #f5f5f5;
            padding: 10px;
            border-top: 1px solid #e0e0e0;
            border-radius: 0 0 5px 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Hello ${user.firstname},</h2>
        </div>
        <div class="content">
            <p>We have received a request to reset your password for your account on <strong>Event Panel</strong>. If you did not request this change, you can ignore this email and your password will not be changed.</p>
            
            <p>To reset your password, please click on the following link and follow the instructions:</p>
            
            <p><a class="button" href="${resetUrl}">Reset Password</a></p>
            
            <p>This link will expire in <strong>15 minutes</strong> for security reasons. If you need to reset your password after this time, please make another request.</p>
        </div>
        <div class="footer">
            <h3>Thank you,</h3>
            <h3>Event Team </h3>
        </div>
    </div>
</body>
</html>
    `;
    try {
      await sendEmail({
        to: user.email,
        subject: "Account Password Reset Link",
        text: message,
      });
      res.status(200).json({
        status:true,message:"Password Reset Email Sent Successfully",
        token: `${resetUrl}`
      });
    } catch (error) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;

      await user.save();

      return res
        .status(500)
        .json({ status:false,message: "Email could not be sent" });
    }
  } catch (error) {
    next(error);
    return res
    .status(500)
    .json({ status:false,message: "server error" });
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({
      passwordResetToken: req.params.resetToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      res.status(400).json({status:false,message:"Invalid Reset Token"});

    }
    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();
    res.status(201).json({
      status:true,message:"Password Reset Successfully",
    });
  } catch (error) {
    next(error);
    res.status(500).json({status:false,message:"server error"});
  }
};

exports.verifyUser = async (req, res) => {
  const { token } = req.params;

  try {
    const decodedData = verifyToken(token);

    if (!decodedData) {
      return res.status(401).json({ status:false,message: "Unauthorized Access" });
    }

    const { id } = decodedData;

    const LoggedUser = await User.findOne({ _id: id, activeToken: token }).select("-password -activeToken");

    if (!LoggedUser) {
      return res.status(401).json({ status:false,message: "Unauthorized Access" });
    }

    return res.status(200).json({ status:true,message: "Verification Successful" , data: LoggedUser});
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status:false,message: "server error" });
  }
};

exports.verifyAdmin = async (req, res) => {
  const { token } = req.params;

  try {
    const decodedData = verifyToken(token);

    if (!decodedData) {
      return res.status(401).json({ status:false,message:"Unauthorized Access" });
    }

    const { id } = decodedData;

    const LoggedUser = await Admin.findOne({ _id: id, activeToken: token }).select("-password -activeToken");

    if (!LoggedUser) {
      return res.status(401).json({ status:false,message: "Unauthorized Access" });
    }

    return res.status(200).json({  status:true,message: "Verification Successful" ,data: LoggedUser});
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status:false,message: "server error" });
  }
};



exports.updatedUser = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({  status:true,message: "details apdated successfully",data:updatedUser});
  } catch (error) {
    // throw new Error(error);
    res.json({  status:false,message: "some error"});

  }
};

exports.getallUser = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const searchQuery = req.query.search;

    const currentPage = parseInt(page, 10);
    const itemsPerPage = parseInt(limit, 10);

    const userQuery = User.find().populate("referredBy");

    if (searchQuery) {
      userQuery.or([
        { firstname: { $regex: new RegExp(searchQuery, "i") } },
        { lastname: { $regex: new RegExp(searchQuery, "i") } },
        { email: { $regex: new RegExp(searchQuery, "i") } },
        { mobile: { $regex: new RegExp(searchQuery, "i") } },
      ]);
    }

    // Count total items
    const totalItems = await User.countDocuments(userQuery);

    // Calculate total pages
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const skip = (currentPage - 1) * itemsPerPage;
    const users = await userQuery.sort({ firstname: 1 }).skip(skip).limit(itemsPerPage).exec();

    res.json({ status:true,message: "get data successfully",data:users,totalItems:totalItems,
    totalPages:totalPages,
    currentPag:currentPage});
  } catch (error) {
    console.error(error);
    res.status(500).json({ status:false,message:"Internal Server Error" });
  }
};

exports.getaUser = async (req, res) => {
  const { id } = req.query;
  validateMongoDbId(id);

  try {
    const getaUser = await User.findById(id)
    res.json({
      getaUser
    });
  } catch (error) {
    throw new Error(error);
  }
};

exports.getUserById = async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const user = await User.findById(id);
    res.status(200).json({
      user,
    });
  } catch (error) {
    throw new Error(error);
  }
};

exports.deleteaUser = async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const deleteaUser = await User.findByIdAndDelete(id);
    res.json({
      deleteaUser,
    });
  } catch (error) {
    throw new Error(error);
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const { _id } = req.user._id;

    const user = await User.findById(_id).select("+password");
    // Verify the current password
    const isPasswordMatch = await user.matchPasswords(oldPassword);
    if (!isPasswordMatch) {
      return res.status(203).json({ message: "Current password is incorrect" });
    }

    user.password = newPassword;
    user.passwordChangedAt = Date.now();
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Password change failed" });
  }
};

exports.getAdminReferralDetails = async (req, res, next) => {
  const { adminId } = req.params;
console.log(adminId);
  try {
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    const referredUsers = await User.find({ referredBy: adminId }).populate("referredBy");

    return res.status(200).json({
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
  }
};

exports.getSubDealerReferralDetails = async (req, res, next) => {
  const { subDealerId } = req.params;

  try {
    const subDealer = await User.findById(subDealerId);
    if (!subDealer) {
      return res.status(404).json({ error: "Sub-dealer not found" });
    }

    const referredUsers = await Vendor.find({ referredBy: subDealerId });

    return res.status(200).json({
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
  }
};




