import { escapeHTML } from '../utils/utils-string.js';
import { Lexer } from './lexer.js';


const lexer = new Lexer({
  "whitespace": {
    rgx: [
      /(\s|\n)+/
    ],
    fn: s => {
      return s;
    }
  },
  "epsilon": {
    rgx: [
      /[^\\]#/
    ],
    fn: s => {
      return s;
    }
  },
  "nonterminal": {
    rgx: [
      /(_|[A-Z])(\w|'|_)*/
    ],
    fn: s => {
      return s;
    }
  },
  "symbols": {
    rgx: [
      /(->)/
    ],
    fn: s => {
      return s;
    }
  },
  "terminal": {
    rgx: [
      /([a-z]|\(|\)|\[|\]|{|}|!|"|\$|\||\\\\|\/|%|&|\?|\*|\+|>|<|=|-|[0-9]|;|,|\.|\\#|\\_|@|:|\^|´|`|'|~)+/
    ],
    fn: s => {
      return s;
    }
  },
});


const renderToken = token => {

  const name = token.name;
  const value = escapeHTML(token.value);

  switch (name) {
    case 'terminal':
      return `<span style='color:rgb(155,96,59)'>${value}</span>`;
    case 'nonterminal':
      return `<span style='color:rgb(6,6,255)'>${value}</span>`;
    case 'string':
      return `<span style='color:rgb(0,127,0)'>${value}</span>`;
    case 'epsilon':
      return `<span style='color:rgb(0,127,0)'>${value}</span>`;
    case 'symbols':
      return `<span style='color:rgb(0,0,0)'>${value}</span>`;
    case lexer.UNKNOWN_TYPE:
      return `<span style='color:rgb(243,66,47);text-decoration:underline'>${value}</span>`;
    default:
      return value;
  }

  throw "Should not have reached here!";
}; 


const renderText = text => {
  lexer.input(text);
  const tokens = lexer.lex();
  let output = "";
  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];
    output += renderToken(token);
  }
  return output;
};


const syntax_cfg = { lexer, renderText };


export { syntax_cfg };

