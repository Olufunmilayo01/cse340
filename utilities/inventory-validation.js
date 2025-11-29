const { body, validationResult } = require("express-validator");

// Validation rules for adding a classification
function addClassificationRules() {
  return [
    body("classification_name")
      .trim()
      .matches(/^[A-Za-z0-9]+$/)
      .withMessage("Classification name cannot contain spaces or special characters")
      .notEmpty()
      .withMessage("Classification name is required"),
  ];
}

// Middleware to check for errors
function checkValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.validationErrors = errors.array();
  }
  next();
}

module.exports = { addClassificationRules, checkValidation };

