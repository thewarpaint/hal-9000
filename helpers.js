// Remove anything that isn't a digit or a period
function sanitize(input) {
  return input.replace(/[^\d\.]/g, '');
}

export {
  sanitize
};
