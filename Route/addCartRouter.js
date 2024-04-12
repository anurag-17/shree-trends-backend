const express = require('express');
const router = express.Router();

const { add_to_cart,GetAllCartItem,GetOneCartItem,updateCartItem,deleteOneCartItem,deleteAllCartItem} = require("../Controller/addCartController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");


router.route("/add_to_cart").post(add_to_cart);
router.route("/GetAllCartItem/:user_id").get(isAuthenticatedUser,GetAllCartItem);
router.route("/GetOneCartItem/:id").get(GetOneCartItem);
router.route("/updateCartItem/:id").put(updateCartItem);
router.route("/deleteOneCartItem/:id").delete(deleteOneCartItem);
router.route("/deleteAllCartItem/:user_id").delete(deleteAllCartItem);


module.exports = router;