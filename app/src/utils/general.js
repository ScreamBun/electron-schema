// General utility functions

export const safeGet = (obj, key, def) => {
  if (key in obj) {
    return obj[key];
  }
  return def || null;
};
