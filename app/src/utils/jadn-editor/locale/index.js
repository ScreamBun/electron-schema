// Allows us to pass arrays and numbers instead of just strings to the format function.
const stringify = arg => {
  if (Array.isArray(arg)) {
    return arg.join(', ');
  }
  return typeof arg === 'string' ? arg : `${arg}`;
};

// Replaces a string with the values of an object. Google "format unicorn" on an explanation of how to use.
const format = (str, args) => {
  if (args) {
    return Object.keys(args).reduce((str, arg) => str.replace(new RegExp(`\\{${arg}\\}`, 'gi'), stringify(args[arg])), str);
  }
  return str;
};

export {
  format
};
