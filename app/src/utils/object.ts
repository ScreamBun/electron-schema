// General utility functions

/**
 * Check is object has property
 * @param {Record<string, any>} obj - object to check against
 * @param {string} prop - property to check for
 * @returns {boolean} object contains property or not
 * @public
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function hasProperty(obj: Record<string, any>, prop: string): boolean {
  return Object.prototype.hasOwnProperty.call(obj, prop) || prop in obj;
}

/**
 * Object.values alternative for compatibility
 * @param {Record<string, any>} obj - Object to return the values of
 * @returns {Array<any>} values of the given object
 * @public
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function objectValues(obj: Record<string, any>): Array<any> {
  return Object.keys(obj).map(k => obj[k]);
}

/**
 * Pretty format an object
 * @param {any} obj - Object to pretty print
 * @param {number} indent - number of spaces to indent
 * @returns {string} Pretty formatted object
 * @public
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function prettyObject(obj: any, indent?: number): string {
  indent = indent || 2;  // eslint-disable-line no-param-reassign
  let pretty = '';
  switch (typeof obj) {
    case 'string':
      pretty += `"${obj}"`;
      break;
    case 'number':
      pretty += obj;
      break;
    case 'undefined':
      break;
    case 'object':
      if (Array.isArray(obj)) {
        pretty += obj.join(', ');
      } else if (obj.toString !== Object.prototype.toString) {
        // console.log(`-> Custom toString: ${obj}`);
        pretty += obj.toString();
      } else {
        let prettyObj = '';
        Object.keys(obj).forEach(key => {
          prettyObj += `${key}: ${prettyObject(obj[key])}\n`;
        });
        pretty += `{\n${prettyObj.replace(/^(.*)/gm, `${' '.repeat(indent)}$1`).replace(/\n.*$/, '')}\n}`;
      }
      break;
    default:
      console.log(`-- ${obj}: ${typeof obj}`);
      pretty += prettyObject(obj);
      break;
  }
  return pretty;
}

/**
 * SafeGet a property from an object
 * @param {Record<string, any>} obj - Object to attempt to get a property from
 * @param {string} key - property name to get value of
 * @param {any} def - default value of not value for the property exists - default of null
 * @return {any} value of the property or default value given/null
 * @public
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function safeGet(obj: Record<string, any>, key: string, def?: any): any {
  def = def === null ? null : def; // eslint-disable-line no-param-reassign
  const val = obj[key];
  if (hasProperty(obj, key)) {
    return val === null || val === undefined ? def : val;
  }
  if (key in obj) {
    return val === null || val === undefined ? def : val;
  }
  return def;
}