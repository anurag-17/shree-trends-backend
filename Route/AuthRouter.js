const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  Admin_User_Registration,
  Admin_User_Login,
  Admin_User_Logout,
  register,
  adminRegister,
  login,
  adminLogin,
  logout,
  adminLogout,
  forgotPassword,
  resetPassword,
  getallUser,
  getaUser,
  getUserById,
  deleteaUser,
  updatedUser,
  updatePassword,
  uploadImage,
  verifyUser,
  verifyAdmin,
  getAdminReferralDetails,
  getSubDealerReferralDetails
} = require("../Controller/auth");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });



router.route("/Admin_User_Registration").post(Admin_User_Registration);
router.route("/Admin_User_Login").post(Admin_User_Login);
router.route("/Admin_User_Logout").get(isAuthenticatedUser, Admin_User_Logout);



router.route("/login").post(login);

router.route("/adminLogin").post(adminLogin);

router.route("/logout").get(isAuthenticatedUser, logout);

router.route("/adminLogout").get(isAuthenticatedUser, adminLogout);

router.route("/verifyUserToken/:token").get(verifyUser);

router.route("/verifyAdminToken/:token").get(verifyAdmin);

// Create User
router.route("/register").post(register);


Admin_User_Login

router.route("/adminRegister").post(adminRegister);

// Update User Password
router.post("/updatePassword/:id", isAuthenticatedUser, updatePassword);

// Update User
router.put("/edit-user/:id", isAuthenticatedUser, updatedUser);

// Get all Users
router.get("/all-users", isAuthenticatedUser, authorizeRoles("admin"), getallUser);

// Get a User
router.route("/getaUser").get(isAuthenticatedUser, getaUser);

// Get user by ID 
router.route("/getUserById/:id").get(isAuthenticatedUser, getUserById);

// Delete a user
router.delete("/deleteaUser/:id",isAuthenticatedUser, authorizeRoles("admin"), deleteaUser);

router.route("/forgotpassword").post(forgotPassword);
router.route("/resetpassword/:resetToken").put(resetPassword);

router.route("/getAdminReferralDetails/:adminId").get(getAdminReferralDetails);

router.route("/getSubDealerReferralDetails/:subDealerId").get(getSubDealerReferralDetails);

router.route("/uploadImage").post(isAuthenticatedUser, authorizeRoles("admin"), upload.single('file'),uploadImage)


module.exports = router;