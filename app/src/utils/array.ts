// Array utility functions
import deepmerge from 'deepmerge';
import { objectFromTuple } from './object';

/**
 * Merge an Array of objects by the given indexes
 * @param {Array<Record<string, any>>} base - Base array
 * @param {Array<Record<string, any>>} plus - Array to merge
 * @returns {Array<Record<string, any>>}
 */
// eslint-disable-next-line import/prefer-default-export
export function updateMerge(base: Array<Record<string, any>>, plus: Array<Record<string, any>>): Array<Record<string, any>> {
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


/**
 * Merge an array of objects into a single object
 * @param {Array<Record<string, ValType>>} objs - Array to flatten
 * @returns {Record<string, ValType>} Flattened Object
 * @public
 */
export function mergeArrayObjects<ValType>(...objs: Array<Record<string, ValType>>): Record<string, ValType> {
  let rtn: Record<string, ValType> = {};
  objs.forEach(o => {
    rtn = {
      ...rtn,
      ...o
    };
  });
  return rtn;
}

/**
 * Create an object using the given arrays
 * @param {Array<string>} keys - Array to use as keys
 * @param {Array<any>} values - Array to use as values
 * @returns {Record<string, any>} Object created from the given arrays
 * @public
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function zip(keys: Array<string>, values: Array<any>): Record<string, any> {
  // console.log(keys, values)
  if (keys.length < values.length) {
    throw new RangeError('The keys arrays should have the same or more values than the value array');
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return objectFromTuple(
    ...values.map<[string, any]>((v: any, i: number) => [keys[i], v] )
  );
}