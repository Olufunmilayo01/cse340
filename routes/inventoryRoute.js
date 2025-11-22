// Needed Resources
const express = require("express");
const router = express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities"); // 👈 Make sure this is added

// Route to build inventory by classification view
router.get(
  "/type/:classificationId",
  utilities.handleErrors(invController.buildByClassificationId)
);

// Route to build vehicle detail view
router.get(
  "/detail/:inv_id",
  utilities.handleErrors(invController.buildDetailView)
);

// Route to trigger intentional error for Task 3
router.get(
  "/cause-error",
  utilities.handleErrors(invController.throwError)
);

module.exports = router;
