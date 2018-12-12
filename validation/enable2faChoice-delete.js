const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateChoice(data) {
  let errors = {};

  data.choice = !isEmpty(data.choice) ? data.choice : "";

  if (Validator.isEmpty(data.choice)) {
    errors.Choice = "Choice is required";
  }
  if (!Validator.isBoolean(data.choice)) {
    errors.Choice = " Choice is invalid, please enter true or false";
  }
  return {
    errors,
    isValid: isEmpty(errors)
  };
};
