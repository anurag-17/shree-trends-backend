



const express = require("express");
const router = express.Router();

const {  getAdminReferralBy_AdminId,getAllDealerReferral,getAllDealersReferralDetails,getWithdrawalRequest,updateWithdrawalRequestStatus
} = require("../Controller/adminController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");


router.route("/getAdminReferralBy_AdminId/:adminId").get( isAuthenticatedUser, getAdminReferralBy_AdminId);
router.route("/getAll_DealersReferral/:adminId").get( isAuthenticatedUser, getAdminReferralBy_AdminId);
router.route("/getAllDealerReferral").get( isAuthenticatedUser, getAllDealerReferral);
router.route("/getWithdrawalRequest").get( isAuthenticatedUser, getWithdrawalRequest);
router.route("/updateWithdrawalRequestStatus").get( isAuthenticatedUser, updateWithdrawalRequestStatus);






module.exports = router;
