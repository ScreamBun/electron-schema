/*
 * General Utility Functions
 */

 /**
  * Split and space a camelcased string
  * @param {string} str - camelcase string to split
  * @returns {string} - split and spaced string
  */
export function splitCamel(str: string): string {
  return str.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
}