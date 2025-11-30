const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");
const { validationResult } = require("express-validator");

// ***************************
// Build inventory by classification view
// ***************************
async function buildByClassificationId(req, res, next) {
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
}

// ***************************
// Build vehicle detail view
// ***************************
async function buildDetailView(req, res, next) {
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
}

// ***************************
// Intentional error for Task 3
// ***************************
async function throwError(req, res, next) {
  throw new Error("Intentional server error for testing.");
}

// ***************************
// Management view
// ***************************
async function buildManagement(req, res, next) {
  let nav = await utilities.getNav();
  req.flash("notice", "Welcome to Inventory Management!");

  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    flash: req.flash("notice"),
  });
}

// ***************************
// Add Classification Form
// ***************************
async function buildAddClassification(req, res, next) {
  let nav = await utilities.getNav();
  res.render("inventory/add-classification", {
    title: "Add Classification",
    nav,
    flash: req.flash("notice"),
    errors: null,
  });
}

// ***************************
// Process Add Classification
// ***************************
async function addClassification(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
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
      await utilities.getNav(); // refresh nav
      req.flash(
        "notice",
        `Classification "${classification_name}" added successfully.`
      );
      return res.redirect("/inv"); // back to management
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

// ***************************
// Add Inventory Form
// ***************************
async function buildAddInventory(req, res, next) {
  try {
    const classificationList = await utilities.buildClassificationList();
    const nav = await utilities.getNav();

    res.render("inventory/add-inventory", {
      title: "Add Inventory Item",
      classificationList,
      flash: req.flash("notice"),
      errors: null,
      formData: {}, // sticky form
      nav,
    });
  } catch (error) {
    next(error);
  }
}

// ***************************
// Process Add Inventory
// ***************************
async function addInventory(req, res, next) {
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

  // Set default images if not provided
  inv_image = inv_image || "/images/no-image.png";
  inv_thumbnail = inv_thumbnail || "/images/no-image-thumbnail.png";

  try {
    const classificationList = await utilities.buildClassificationList(
      classification_id
    );

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
      return res.status(400).render("inventory/add-inventory", {
        title: "Add Inventory Item",
        classificationList,
        flash: req.flash("notice"),
        errors,
        formData: req.body,
        nav: await utilities.getNav(),
      });
    }

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
      req.flash(
        "notice",
        `Inventory item "${inv_make} ${inv_model}" added successfully.`
      );
      return res.status(201).redirect("/inv/");
    } else {
      return res.status(500).render("inventory/add-inventory", {
        title: "Add Inventory Item",
        classificationList,
        flash: req.flash("notice", "Failed to add inventory item."),
        errors: ["Database insertion failed"],
        formData: req.body,
        nav: await utilities.getNav(),
      });
    }
  } catch (error) {
    next(error);
  }
}

module.exports = {
  buildByClassificationId,
  buildDetailView,
  throwError,
  buildManagement,
  buildAddClassification,
  addClassification,
  buildAddInventory,
  addInventory,
};
