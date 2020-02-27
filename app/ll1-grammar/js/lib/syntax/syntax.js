import { syntax_ebnf } from './syntax-ebnf.js';
import { syntax_morpho } from './syntax-morpho.js';
import { syntax_js } from './syntax-js.js';
import { syntax_text } from './syntax-text.js';
import { syntax_cfg } from './syntax-cfg.js';

const SUPPORTED_LANGUAGE = {
  'ebnf': syntax_ebnf,
  'morpho': syntax_morpho,
  'js': syntax_js,
  'txt': syntax_text,
  'cfg': syntax_cfg
};

function renderText(text, language) {
  if (SUPPORTED_LANGUAGE[language]) {    
    return SUPPORTED_LANGUAGE[language].renderText(text);
  } else {
    console.log("Fallback!");
    return escapeHTML(text);
  }
}

export { renderText };
