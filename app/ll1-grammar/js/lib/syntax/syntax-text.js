import { escapeHTML } from '../utils/utils-string.js';

let lexer = null;

const renderText = text => {
  return escapeHTML(text);
};


const syntax_text = { lexer, renderText };

export { syntax_text };
