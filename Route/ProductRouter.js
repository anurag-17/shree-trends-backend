const express = require('express');
const router = express.Router();

const { createProduct, updateProduct, deleteProduct, deleteBulkProducts, getAllProduct, getProductsByVendor,updateProductVendor,getaProduct, addToWishlist, deleteAllWishlistItems, analyticsCount,getallWishlist,deleteOneWishlistItem} = require("../Controller/prodController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
// isAuthenticatedUser, authorizeRoles("admin"),

router.route("/createProduct").post(  createProduct);
router.route("/updateProduct/:id").put( isAuthenticatedUser, authorizeRoles("admin"), updateProduct);
router.route("/deleteProduct/:id").delete( isAuthenticatedUser, authorizeRoles("admin"), deleteProduct);
router.route("/deleteBulkProducts").post( deleteBulkProducts);

router.route("/getaProduct/:id").get(getaProduct);
router.route("/getAllProduct").get(getAllProduct);
router.route("/getProductsByVendor/:vendorId").get(getProductsByVendor);

router.route("/analyticsCount").get(analyticsCount);

router.route("/updateProductVendor/:productId").post(updateProductVendor)



// Add to Wishlist
router.route("/addToWishlist").post( isAuthenticatedUser, addToWishlist);
router.route("/deleteAllWishlistItems").delete( isAuthenticatedUser, deleteAllWishlistItems);
router.route("/getallWishlist").get( isAuthenticatedUser, getallWishlist);
router.route("/deleteOneWishlistItem").delete( isAuthenticatedUser, deleteOneWishlistItem);


module.exports = router;