// Needed Resources
const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities"); // 👈 Make sure this is added

// Route to deliver login view
router.get("/login", utilities.handleErrors(accountController.buildLogin));

//  Route to deliver registration view
router.get(
  "/register",
  utilities.handleErrors(accountController.buildRegister)
);

router.post(
  "/register",
  utilities.handleErrors(accountController.registerAccount)
);

module.exports = router;
