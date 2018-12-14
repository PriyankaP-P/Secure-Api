const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validate2faLoginInput(data) {
  let errors = {};

  data.code = !isEmpty(data.code) ? data.code : "";

  if (Validator.isEmpty(data.code)) {
    errors.code = "code is required";
  }
  return {
    errors,
    isValid: isEmpty(errors)
  };
};
