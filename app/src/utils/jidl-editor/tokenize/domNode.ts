/* DOM Node || OnBlue or Update */
import { DomNodeTokenize } from './interfaces';
import JIDLInput from '../index';
// import { format } from '../locale';
import defaultLocale from '../locale/en';

// Main Function
export default function DomNodeUpdate(this: JIDLInput, obj: HTMLElement, locale = defaultLocale): null|DomNodeTokenize {

  return {
    tokens: [],
    noSpaces: '',
    indented: '',
    json: '',
    jsObject: {},
    markup: '',
    lines: 2
  };
}