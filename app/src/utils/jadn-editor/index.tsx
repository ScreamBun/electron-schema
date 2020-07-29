// Original Adapted from json-editor
import JSONInput from 'react-json-editor';

// eslint-disable-next-line camelcase
import {
  // formatDomNodeUpdate,
  formatPlaceholderJSON
} from './tokenize';

class JADNInput extends JSONInput {
  // Tokenize Helpers
  // formatDomNodeUpdate = formatDomNodeUpdate;
  formatPlaceholderJSON = formatPlaceholderJSON;
}

export default JADNInput;
