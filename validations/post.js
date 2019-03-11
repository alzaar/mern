const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validatePostInput(data) {
  let errors = {};
  data.text = !isEmpty(data.text) ? data.text : '';
  if (Validator.isEmpty(data.text)) {
    errors.text = 'Text Field must exist';
  }

  if (!Validator.isLength(data.text, { min: 2, max: 300 })) {
    errors.text = 'Text must be between 2 and 300 characters';
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
