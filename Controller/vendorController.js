const Vendor = require("../Model/vendorModel");
const validateMongoDbId = require("../Utils/validateMongodbId");

exports.createVendor = async (req, res) => {
  const newVendor = await Vendor.create(req.body);
  res.json(newVendor);
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
    throw new Error(error);
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
    throw new Error(error);
  }
};