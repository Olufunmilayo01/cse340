// Needed Resources
const express = require("express");
const router = express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities"); // 👈 Make sure this is added
const regValidate = require("../utilities/inventory-validation");
const { addClassificationRules } = require("../utilities/inventory-validation");

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
router.get("/cause-error", utilities.handleErrors(invController.throwError));

// Management view delivery
router.get("/", invController.buildManagement);

// Deliver the add classification form
router.get("/add-classification", invController.buildAddClassification);

// Process the add classification form
router.post(
  "/add-classification",
  regValidate.addClassificationRules(), // server-side validation middleware
  invController.addClassification
);

router.get("/add-inventory", invController.buildAddInventory);
router.post("/add-inventory", invController.addInventory);

module.exports = router;
