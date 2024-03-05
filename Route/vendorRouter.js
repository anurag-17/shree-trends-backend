const express = require("express");
const router = express.Router();

const { createVendor, updateVendor, deleteVendor, getAllVendors, getaVendor} = require("../Controller/vendorController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

router.post("/createVendor",  createVendor);

router.put("/updateVendor/:id",  updateVendor);

router.delete("/deleteVendor/:id",  deleteVendor);

router.get("/getAllVendors", getAllVendors);

router.get("/getaVendor/:id", getaVendor);

module.exports = router;
