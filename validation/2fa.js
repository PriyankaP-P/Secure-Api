const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validate2faLoginInput(data) {
  let errors = {};

  data.key = !isEmpty(data.key) ? data.key : "";

  if (Validator.isEmpty(data.key)) {
    errors.key = "key is required";
  }
  return {
    errors,
    isValid: isEmpty(errors)
  };
};
