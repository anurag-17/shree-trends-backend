const Product = require("../Model/ProductModel");
const User = require("../Model/User");
const ErrorResponse = require("../Utils/errorRes");
// const slugify = require("slugify");
const validateMongoDbId = require("../Utils/validateMongodbId");
const mongoose = require("mongoose");
const Wishlist = require("../Model/WishlistModel");




exports.createProduct = async (req, res) => {
    try {
      const existingProduct = await Product.findOne(
        { title: { $regex: new RegExp(req.body.title, "i") } }
      );    

      if (existingProduct) {
        return res.status(400).json({ error: "Product with the same title already exists" });
      }

      // if (req.body.title) {
      //   req.body.slug = slugify(req.body.title);
      // }
      const newProduct = await Product.create(req.body);
      res.json(newProduct);
    } catch (error) {
      return res.status(400).json({ error });
    }
};

exports.updateProduct = async (req, res) => {
  const { id } = req.params; 

  try {
    // if (req.body.title) {
    //   req.body.slug = slugify(req.body.title);
    // }

    // Use mongoose.Types.ObjectId to create a valid ObjectId from the extracted id
    const objectId = new mongoose.Types.ObjectId(id);

    const updateProduct = await Product.findOneAndUpdate({ _id: objectId }, req.body, {
      new: true,
    });

    if (!updateProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(updateProduct);
  } catch (error) {
    throw new Error(error);
  }
};

exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const deleteProduct = await Product.findOneAndDelete({ _id: id });
    if (!deleteProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product Deleted", deleteProduct});
  } catch (error) {
    throw new Error(error);
  }
};

exports.deleteBulkProducts = async (req, res) => {
  try {
    const { ProductIds } = req.body;
    const deleteProducts = await Product.deleteMany({ _id: { $in: ProductIds } });
    res.json(deleteProducts);
  } catch (error) {
    throw new Error(error);
  }
};

exports.getaProduct = async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const findProduct = await Product.findById({ _id: id });
    res.json(findProduct);
  } catch (error) {
    throw new Error(error);
  }
};

exports.getAllProduct = async (req, res) => {
  try {
    // Filtering
    const queryObj = { ...req.query };
    const excludeFields = ["page", "sort", "limit", "fields"];
    excludeFields.forEach((el) => delete queryObj[el]);

    const searchQuery = queryObj.search;
    if (searchQuery) {
      queryObj.$or = [
        { title: { $regex: searchQuery, $options: 'i' } },
        { category: { $regex: searchQuery, $options: 'i' } },
        { brand: { $regex: searchQuery, $options: 'i' } },
        { slug: { $regex: searchQuery, $options: 'i' } },
      ];
      delete queryObj.search;
    }

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let query = Product.find(JSON.parse(queryStr));

    // Counting total documents without pagination
    const totalItems = await Product.countDocuments(queryObj);

    // Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    // limiting the fields
    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      query = query.select("-__v");
    }

    // pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);

    // Fetching products
    const products = await query;

    // Calculating totalPages
    const totalPages = Math.ceil(totalItems / limit);

    // Sending response with totalPages and totalItems
    res.json({
      totalPages,
      totalItems,
      currentPage: page,
      products,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getProductsByVendor = async (req, res) => {
  const { vendorId } = req.params;
  validateMongoDbId(vendorId);
  const products = await Product.find({ vendor_id: vendorId }).populate('vendor_id');
  res.json(products);
};

exports.updateProductVendor = async (req, res) => {
  const { productId } = req.params;
  const { vendorId } = req.body;

  validateMongoDbId(productId);
  validateMongoDbId(vendorId);

  const product = await Product.findByIdAndUpdate(
    productId,
    { vendor_id: vendorId },
    { new: true }
  );

  res.json(product);
};






exports.addToWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.body;
    
    // Find the user's wishlist or create a new one if it doesn't exist
    let wishlist = await Wishlist.findOne({ user: userId });
    console.log("wishlist", wishlist);
    if (!wishlist) {
      console.log("1");
      wishlist = new Wishlist({ user: userId, products: [] });
    }
    
    // Add the product to the wishlist if it's not already in there
    if (!wishlist.products.includes(productId)) {
      console.log("2");
      wishlist.products.push(productId);
      await wishlist.save();
      res.json({ status: true, message: 'Product added to wishlist', wishlist: wishlist });
    } else {
      console.log("555");
      res.json({ status: false, message: 'already added to wishlist' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ status:false,error: 'Internal server error' });
  }
};


exports.deleteAllWishlistItems = async (req, res) => {
  // const { _id } = req.user._id;
  const { id }  = req.body;

  try {
    // Find the user by ID
    const user = await Wishlist.findById(id);
    console.log("wishlist",Wishlist);
    if (!user) {
      return res.status(404).json({ status:false,error: "User not found" });
    }
    // Clear the user's wishlist by setting it to an empty array
    user.wishlist = [];
    // Save the user to update the wishlist
    await Wishlist.deleteOne();

    res.json({ status:true , message: "wishlist items deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status:false,error: 'Internal server error' });

  }
};


exports.getallWishlist = async (req, res) => {
  try {
    const searchQuery = req.query.search;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const userId = req.query.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ status: false, error: "User not found" });
    }

    let wishlistQuery = Wishlist.find({ user: userId }).populate('products'); // Find the user's wishlist and populate the 'products' field
    
    if (searchQuery) {
      wishlistQuery = wishlistQuery.or([
        { title: { $regex: searchQuery, $options: "i" } },
        { description: { $regex: searchQuery, $options: "i" } }
      ]);
    }

    // Execute the query and apply pagination
    const wishlists = await wishlistQuery.skip((page - 1) * limit).limit(limit).exec();

    // Count the total number of wishlists without applying pagination
    const totalWishlists = await Wishlist.find({ user: userId }).countDocuments();

    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(totalWishlists / limit),
      totalWishlists: totalWishlists,
      wishlistsPerPage: wishlists.length
    };

    res.json({ wishlists, pagination });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status:false,error: 'Internal server error' });

  }
};



exports.analyticsCount = async (req, res) => {
  const todaySales = 50;
  const lastSevenDaySales = 152;
  const lastThirtyDaySales = 90;
  const lastOneEightyDaySales = 612;

  const productCount = await Product.countDocuments();
  const totalProduct = productCount;
  
  const availableStock = 1231;
  const stockValue = 52;
  const orderReceived = 213;

  res.status(200).json({
    todaySales,
    lastSevenDaySales,
    lastThirtyDaySales,
    lastOneEightyDaySales,
    totalProduct,
    availableStock,
    stockValue,
    orderReceived
  })
}