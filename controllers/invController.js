const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");
const { validationResult } = require("express-validator");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);
  const grid = await utilities.buildClassificationGrid(data);
  let nav = await utilities.getNav();
  const className = data[0].classification_name;

  res.render("./inventory/classification", {
    title: `${className} vehicles`,
    nav,
    grid,
  });
};

/* ***************************
 * Build vehicle detail view
 * ************************** */
invCont.buildDetailView = async function (req, res, next) {
  const invId = req.params.inv_id;

  try {
    const data = await invModel.getVehicleById(invId);
    const html = await utilities.buildVehicleDetailHtml(data);
    const nav = await utilities.getNav();

    res.render("inventory/detail", {
      title: `${data.inv_make} ${data.inv_model}`,
      nav,
      vehicleHtml: html,
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 * Intentional error for Task 3
 * ************************** */
invCont.throwError = async function (req, res, next) {
  throw new Error("Intentional server error for testing.");
};

async function buildManagement(req, res, next) {
  let nav = await utilities.getNav();
  req.flash("notice", "Welcome to Inventory Management!");

  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    flash: req.flash("notice"),
  });
}

// Deliver Add Classification Form
async function buildAddClassification(req, res, next) {
  let nav = await utilities.getNav();
  res.render("inventory/add-classification", {
    title: "Add Classification",
    nav,
    flash: req.flash("notice"),
    errors: null,
  });
}

// Process Add Classification Form
async function addClassification(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // If server-side validation fails
    let nav = await utilities.getNav();
    return res.status(400).render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      flash: req.flash("notice"),
      errors: errors.array(),
    });
  }

  const { classification_name } = req.body;

  try {
    const result = await invModel.insertClassification(classification_name);
    if (result) {
      // Rebuild nav to include new classification
      await utilities.getNav();

      req.flash(
        "notice",
        `Classification "${classification_name}" added successfully.`
      );
      return res.redirect("/inv"); // Go back to management page
    } else {
      let nav = await utilities.getNav();
      req.flash("notice", "Sorry, the classification could not be added.");
      return res.status(500).render("inventory/add-classification", {
        title: "Add Classification",
        nav,
        flash: req.flash("notice"),
        errors: null,
      });
    }
  } catch (error) {
    next(error);
  }
}
//Add Inventory
async function buildAddInventory(req, res, next) {
  try {
    const classificationList = await utilities.buildClassificationList();
    const nav = await utilities.getNav(); // ✅ build navigation

    res.render("inventory/add-inventory", {
      title: "Add Inventory Item",
      classificationList,
      flash: req.flash("notice"),
      errors: null,
      formData: {}, // sticky form
      nav, // ✅ pass nav to partial
    });
  } catch (error) {
    next(error);
  }
}

async function addInventory(req, res, next) {
  // Destructure fields from the form
  let {
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_price,
    inv_miles,
    inv_color,
    inv_image,
    inv_thumbnail,
  } = req.body;

  // Set default images if user left them blank
  inv_image = inv_image || "/images/no-image.png";
  inv_thumbnail = inv_thumbnail || "/images/no-image-thumbnail.png";

  try {
    // Rebuild classification list with selected value for sticky form
    const classificationList = await utilities.buildClassificationList(
      classification_id
    );

    // Basic server-side validation
    const errors = [];
    if (!classification_id) errors.push("Classification is required");
    if (!inv_make) errors.push("Make is required");
    if (!inv_model) errors.push("Model is required");
    if (!inv_year || isNaN(inv_year))
      errors.push("Year is required and must be a number");
    if (!inv_price || isNaN(inv_price))
      errors.push("Price is required and must be a number");
    if (!inv_miles || isNaN(inv_miles))
      errors.push("Miles is required and must be a number");
    if (!inv_color) errors.push("Color is required");

    if (errors.length > 0) {
      // Render the form again with errors and sticky data
      return res.status(400).render("inventory/add-inventory", {
        title: "Add Inventory Item",
        classificationList,
        flash: req.flash("notice"),
        errors,
        formData: req.body, // sticky inputs
      });
    }

    // Attempt to add the new inventory item
    const result = await invModel.addInventory({
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_price,
      inv_miles,
      inv_color,
      inv_image,
      inv_thumbnail,
    });

    if (result) {
      // Success: flash message and redirect to management page
      req.flash(
        "notice",
        `Inventory item "${inv_make} ${inv_model}" added successfully.`
      );
      return res.status(201).redirect("/inv/");
    } else {
      // Database insertion failed
      return res.status(500).render("inventory/add-inventory", {
        title: "Add Inventory Item",
        classificationList,
        flash: req.flash("notice", "Failed to add inventory item."),
        errors: ["Database insertion failed"],
        formData: req.body,
      });
    }
  } catch (error) {
    next(error); // Pass to global error handler
  }
}

module.exports = {
  invCont,
  buildManagement,
  buildAddClassification,
  addClassification,
  addInventory,
  buildAddInventory,
};
