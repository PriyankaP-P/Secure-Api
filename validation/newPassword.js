const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateResetInput(data) {
  let errors = {};

  data.password = !isEmpty(data.password) ? data.password : "";
  data.password2 = !isEmpty(data.password2) ? data.password2 : "";

  if (Validator.isEmpty(data.password)) {
    errors.password = "Password is required";
  }
  if (!Validator.isLength(data.password, { min: 8, max: 128 })) {
    errors.password = "Passwords must be at least 8 characters";
  }
  if (Validator.isEmpty(data.password2)) {
    errors.password2 = "Confirm password is required";
  }
  if (!Validator.equals(data.password, data.password2)) {
    errors.password2 = "Passwords must match";
  }
  return {
    errors,
    isValid: isEmpty(errors)
  };
};
