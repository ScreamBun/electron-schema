/* Tokenize utility functions */
import { SimpleToken } from './interfaces';
import { ColorProps } from '../interfaces';
import { dark_vscode_tribute } from '../themes';
import { safeGet } from '../utils';

/* Shared */
/**
 * Create a new span string for use within the JSON Editor
 * @param {number} i - Index
 * @param {Token} token - Token to crean the span based on
 * @param {ColorProps} colors - Color object
 * @returns {string} - formatted span string
 */
export function newSpan(i: number, token: SimpleToken, colors: ColorProps = dark_vscode_tribute) {
  const { string, type } = token;
  let color = '';

  switch (type) {
    case 'key':
      color = string === ' ' ? colors.keys_whiteSpace : colors.keys;
      break;
    case 'symbol':
      color = string === ':' ? colors.colon : colors.default;
      break;
    default:
      color = safeGet(colors, token.type, colors.default) as string;
      break;
  }
  let val = string;
  if (string.length !== string.replace(/</g, '').replace(/>/g, '').length) {
    val = `<xmp style=display:inline;>${val}</xmp>`;
  }

  return `<span key="${i}" type="${type}" value="${val}" style="color: ${color}">${val}</span>`;
}

/* General */
/**
  * Merge the given objects into the target
  * @param {Record<string, any>} target - Target of the merged objects
  * @param {Array<Record<string, any>>} params - Objects to merge into the target
  * @returns {Record<string, any>} - Merged object
  */
 export function mergeObjects(target: Record<string, any>, ...params: Array<Record<string, any>>): Record<string, any> {
  params.forEach((param, i) => {
    Object.keys(param).forEach(key => {
      if (key in target) {
        if (typeof param[key] === typeof target[key]) {
          switch (true) {
            case typeof param[key] === 'string':
              target[key] += param[key];
              break;
            case param[key] instanceof Array:
              target[key].push(...param[key]);
              break;
            default:
              console.warn(`unknown merge type ${typeof target[key]}`);
          }
        } else {
          throw new TypeError(`Target key of ${key}(${typeof target[key]}) is not the same type as param[${i}] key of ${key}(${typeof param[key]})`);
        }
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        target[key] = param[key];
      }
    });
  });
  return target;
 }

 /**
 * Flatten an array of arrays
 * @param {Array<ValType>} arr - Array to flatten
 * @returns {Array<ValType>} Flattened array
 * @public
 */
export function flattenArray<ValType>(arr: Array<Array<ValType>>): Array<ValType> {
  return arr.reduce((acc: Array<ValType>, val: Array<ValType>) => acc.concat(val), []);
}