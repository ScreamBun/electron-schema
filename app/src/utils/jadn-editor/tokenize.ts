import { MarkupToken, MergeToken } from 'react-json-editor/lib/tokenize/interfaces';
import { followedBySymbol, followsSymbol, newSpan } from 'react-json-editor/lib/tokenize/utils';

// DOM Node || OnBlue or Update
/**
  * Format the given tokens from the DomNode updates
  * @param {Array<MergeTokens>} tokens - Tokens to format
  * @param {Colors} colors - Colors to use as the theme
  * @returns {[number, string]} - [Lines, Markup (HTML String)]
  */
export function formatDomNodeUpdate(tokens: Array<MergeToken>, colors: ColorProps): [number, string] {
  const lastIndex = tokens.length - 1;
  let lines = 0;
  let depth = 0;
  let markup = '';
  const newIndent = () => Array(depth * 2).fill('&nbsp;').join('');
  const newLineBreak = (byPass = false) => {
    lines += 1;
    return (depth > 0 || byPass) ? '<br>' : '';
  };
  const newLineBreakAndIndent = (byPass = false) => newLineBreak(byPass) + newIndent();

  // FORMAT BY TOKEN!!
  // TODO: Simplify this....
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const { string, type } = token;
    const islastToken = i === lastIndex;
    const lineAdjust = (i > 0 && followsSymbol(tokens, i, ['[', '{'])) ? '' : newLineBreakAndIndent(islastToken);
    let indBool = false;

    switch (type) {
      case 'string':
      case 'number':
      case 'primitive':
      case 'error':
        // markup += followsSymbol(tokens, i, [',', '[']) ? newLineBreakAndIndent() : '';
        markup += newSpan(i, token, depth, colors);
        break;
      case 'key':
        markup += `${newLineBreakAndIndent()}${newSpan(i, token, depth, colors)}`;
        break;
      case 'colon':
        markup += `${newSpan(i, token, depth, colors)}&nbsp;`;
        break;
      case 'symbol':
        switch (string) {
          case '{':
            markup += newSpan(i, token, depth, colors);
            depth += 1;
            break;
          case '}':
            depth = depth > 0 ? depth - 1 : depth;
            markup += `${lineAdjust}${newSpan(i, token, depth, colors)}`;
            break;
          case '[':
            if (followsSymbol(tokens, i, ['['])) {
              depth += 1;
              markup += newLineBreakAndIndent();
            }
            markup += newSpan(i, token, depth, colors);
            break;
          case ']':

            if (followsSymbol(tokens, i, [']'])) {
              if (followedBySymbol(tokens, i, [']'])) {
                if (followedBySymbol(tokens, i + 1, [','])) {
                  depth = depth >= 1 ? depth - 1 : depth;
                  indBool = true;
                  i += 1;
                } else if (followedBySymbol(tokens, i + 1, [']'])) {
                  depth = depth >= 1 ? depth - 1 : depth;
                  indBool = true;
                }
              } else if (followedBySymbol(tokens, i, ['}'])) {
                depth = depth >= 1 ? depth - 1 : depth;
                indBool = true;
              }
            }

            markup += `${indBool ? newLineBreakAndIndent() : ''}${newSpan(i, token, depth, colors)}`;
            break;
          case ',':
            markup += newSpan(i, token, depth, colors);
            if (followsSymbol(tokens, i, [']']) && followedBySymbol(tokens, i, ['['])) {
              markup += newLineBreakAndIndent();
            }
            break;
          default:
            markup += newSpan(i, token, depth, colors);
            break;
        }
        break;
      // no default
    }
  }

  return [
    lines,
    markup
  ];
}

// JS OBJECTS || PLACEHOLDER
/**
  * Format the given tokens from the placeholder for display
  * @param {Array<MarkupToken>} tokens - Tokens to format
  * @param {Colors} colors - Colors to use as the theme
  * @returns {[number, string, string]} - [Lines, Indentation (JSON String), Markup (HTML String)]
  */
export function formatPlaceholderJSON(tokens: Array<MarkupToken>, colors: ColorProps): [number, string, string] {
  let lines = 1;
  let depth = 0;
  let indentation = '';
  let markup = '';
  const lastIndex = tokens.length - 1;

  const indent = (byPass = false) => ((depth > 0 || byPass) ? '\n' : '') + Array(depth * 2).fill(' ').join('');

  const indentII = (byPass = false) => {
    lines += depth > 0 ? 1 : 0;
    return ((depth > 0 || byPass) ? '<br>' : '') + Array(depth * 2).fill('&nbsp;').join('');
  };

  // FORMAT BY TOKEN!!
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const { string, type } = token;
    const islastToken = i === lastIndex;
    const lineAdjust = i > 0 && !followsSymbol(tokens, i, ['[', '{']);
    let indBool = false;

    switch (type) {
      case 'string':
      case 'number':
        indentation += string;
        markup += newSpan(i, token, depth, colors);
        break;
      case 'key':
        indentation += indent() + string;
        markup += indentII() + newSpan(i, token, depth, colors);
        break;
      case 'symbol':
        switch (string) {
          case '{':
            indentation += string;
            markup += newSpan(i, token, depth, colors);
            depth+=1;
            if (followedBySymbol(tokens, i, ['}'])) {
              indentation += indent();
              markup += indentII();
            }
            break;
          case '}':
            depth = depth >= 1 ? depth - 1 : depth;
            indentation += `${lineAdjust ? indent(islastToken) : ''}${string}`;
            markup += `${lineAdjust ? indentII(islastToken) : ''}${newSpan(i, token, depth, colors)}`;
            break;
          case '[':
            if (followsSymbol(tokens, i, ['['])) {
              depth += 1;
              indentation += indent();
              markup += indentII();
            }
            indentation += string;
            markup += newSpan(i, token, depth, colors);
            break;
          case ']':
            if (followsSymbol(tokens, i, [']'])) {
              if (followedBySymbol(tokens, i, [']'])) {
                if (followedBySymbol(tokens, i + 1, [','])) {
                  depth = depth >= 1 ? depth - 1 : depth;
                  indBool = true;
                  i += 1;
                } else if (followedBySymbol(tokens, i + 1, [']'])) {
                  depth = depth >= 1 ? depth - 1 : depth;
                  indBool = true;
                }
              } else if (followedBySymbol(tokens, i, ['}'])) {
                depth = depth >= 1 ? depth - 1 : depth;
                indBool = true;
              }
            }

            indentation += (indBool ? indent() : '') + string;
            markup += (indBool ? indentII() : '') + newSpan(i, token, depth, colors);
            break;
          case ':':
            indentation += `${token.string} `;
            markup += `${newSpan(i, token, depth, colors)}&nbsp;`;
            break;
          case ',':
            indentation += string;
            markup += newSpan(i, token, depth, colors);
            if (followsSymbol(tokens, i, [']']) && followedBySymbol(tokens, i, ['['])) {
              indentation += indent();
              markup += indentII();
            }
            break;
          default:
            indentation += string;
            markup += newSpan(i, token, depth, colors);
            break;
        }
        break;
      // no default
    }
  }

  return [
    lines,
    indentation,
    markup
  ];
}
