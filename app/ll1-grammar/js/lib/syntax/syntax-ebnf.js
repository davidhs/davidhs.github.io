import { escapeHTML } from '../utils/utils-string.js';
import { Lexer } from './lexer.js';

let lexer = new Lexer({
  "whitespace": {
    rgx: [
      /(\s|\n)+/
    ],
    fn: s => {
      return s;
    }
  },
  "nonterminal": {
    rgx: [
      /\w+(\s\w+)*/
    ],
    fn: s => {
      return s;
    }
  },
  "terminal_string": {
    rgx: [
      /"([^\\"]|\\\\|\\")*"/,
      /'([^\\']|\\\\|\\')*'/
    ],
    fn: s => {
      return s;
    }
  },
  "definition": {
    rgx: [
      /=/
    ],
    fn: s => {
      return s;
    }
  },
  "concatenation": {
    rgx: [
      /,/
    ],
    fn: s => {
      return s;
    }
  },
  "termination": {
    rgx: [
      /;/
    ],
    fn: s => {
      return s;
    }
  },
  "alternation": {
    rgx: [
      /\|/
    ],
    fn: s => {
      return s;
    }
  },
  "optional": {
    rgx: [
      /[\[\]]/
    ],
    fn: s => {
      return s;
    }
  },
  "repetition": {
    rgx: [
      /[{}]/
    ],
    fn: s => {
      return s;
    }
  },
  "grouping": {
    rgx: [
      /[()]/
    ],
    fn: s => {
      return s;
    }
  },
  "exception": {
    rgx: [
      /-/
    ],
    fn: s => {
      return s;
    }
  },
  "comment": {
    rgx: [
      /\(\*[^\*]*?\*\)/
    ],
    fn: s => {
      return s;
    }
  },
  "special_sequence": {
    rgx: [
      /\?([^\?]|')*?\?/
    ],
    fn: s => {
      return s;
    }
  }
});


const renderToken = token => {

  const name = token.name;
  const value = escapeHTML(token.value);

  switch (name) {
    case 'nonterminal':
      return `<span style='color:rgb(21,126,21);font-weight:bold'>${value}</span>`;
    case 'terminal_string':
      return `<span style='color:rgb(187,41,43)'>${value}</span>`;
    case 'comment':
      return `<span style='color:rgb(69, 127, 127)'>${value}</span>`;
    case 'special_sequence':
      return `<span style='color:rgb(153,153,153)'>${value}</span>`;
    case lexer.UNKNOWN_TYPE:
      return `<span style='color:rgb(216,35,74);text-decoration:underline'>${value}</span>`;
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


const syntax_ebnf = { lexer, renderText };

export { syntax_ebnf };
