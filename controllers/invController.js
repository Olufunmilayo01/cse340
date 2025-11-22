const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

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

module.exports = invCont;
