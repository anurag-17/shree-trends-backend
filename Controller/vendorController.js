const Vendor = require("../Model/vendorModel");
const validateMongoDbId = require("../Utils/validateMongodbId");
const User = require("../Model/User");
const sendToken = require("../Utils/jwtToken");


exports.createVendor = async (req, res, next) => {
  // const newVendor = await Vendor.create(req.body);
  // res.json(newVendor);


  const { address, phone, email, companyName, vendorName, role, referralCode } = req.body;

  const existingUser = await Vendor.findOne({ email });
  if (existingUser) {
    return res.status(203).json({ error: "User with this email already exists." });
  }

  let referredBy;
  let secretOrPrivateKey;


  // Check referral code against Admin model
  referredBy = await User.findOne({ referralCode });
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
    vendorName: vendorName,
    phone: phone,
    role: role,
    address: address,
    companyName: companyName,
    referredBy: referredBy._id
  };
  try {
    const newUser = await Vendor.create(userData);
    // sendToken(newUser, 201, res);
    return res.status(200).json({ newUser });

  } catch (error) {
    next(error);
    res.status(500).json({ status:false,error: 'Internal server error' });

  }


};

exports.updateVendor = async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  const updatedVendor = await Vendor.findByIdAndUpdate(id, req.body, {
    new: true,
  });
  res.json(updatedVendor);
};

exports.deleteVendor = async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  const deletedVendor = await Vendor.findByIdAndDelete(id);
  res.json(deletedVendor);
};

exports.getAllVendors = async (req, res) => {
  try {
    const searchQuery = req.query.search;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    let brandQuery = Vendor.find();

    if (searchQuery) {
      brandQuery = brandQuery.regex("vendorName", new RegExp(searchQuery, "i"));
      // brandQuery = brandQuery.regex("companyName", new RegExp(searchQuery, "i"));
      // brandQuery = brandQuery.regex("email", new RegExp(searchQuery, "i"));
    }

    const totalCount = await Vendor.countDocuments(brandQuery);
    const totalPages = Math.ceil(totalCount / limit);

    brandQuery = brandQuery.skip((page - 1) * limit).limit(limit);

    const vendors = await brandQuery.exec();

    const pagination = {
      currentPage: page,
      totalPages: totalPages,
      totalVendors: totalCount,
      vendorsPerPage: vendors.length
    };

    res.json({ vendors, pagination });
  } catch (error) {
    // throw new Error(error);
    res.status(500).json({ status:false,error: 'Internal server error' });

  }
};

exports.getaVendor = async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const result = await Vendor.findById(id);
    res.json({
      result,
    });
  } catch (error) {
    // throw new Error(error);
    res.status(500).json({ status:false,error: 'Internal server error' });

  }
};

