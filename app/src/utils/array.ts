// Array utility functions
import deepmerge from 'deepmerge';

/**
 * Merge an Array of objects by the given indexes
 * @param {Array<Record<string, any>>} base - Base array
 * @param {Array<Record<string, any>>} plus - Array to merge
 * @returns {Array<Record<string, any>>}
 */
// eslint-disable-next-line import/prefer-default-export
export const updateMerge = (base: Array<Record<string, any>>, plus: Array<Record<string, any>>): Array<Record<string, any>> => {
  const rtn: Array<Record<string, any>> = [ ...base ];

  plus.forEach((obj, idx) => {
    if (rtn.length > idx) {
      rtn[idx] = deepmerge(rtn[idx], obj);
    } else {
      rtn.push(obj);
    }
  });
  return rtn;
};