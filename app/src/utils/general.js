// General utility functions

export const safe_get = (obj, key, def) => {
  if (obj.hasOwnProperty(key)) {
    return obj[key]
  }
  return def || null
}