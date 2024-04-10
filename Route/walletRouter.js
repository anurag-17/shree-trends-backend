

const express = require("express");
const router = express.Router();

const { addWalletAmount,transactionDetails,withdrawalRequest,withdrawalAmount} = require("../Controller/WalletController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");


router.route("/addWalletAmount").post( isAuthenticatedUser, addWalletAmount);
router.route("/transactionDetails").get( isAuthenticatedUser, transactionDetails);
router.route("/withdrawalRequest").post( isAuthenticatedUser, withdrawalRequest);
router.route("/withdrawalAmount").post( isAuthenticatedUser, withdrawalAmount);


module.exports = router;
