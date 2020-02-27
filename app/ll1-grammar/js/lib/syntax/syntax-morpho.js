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
  "keyword": {
    rgx: [
      /(var|val|fun|for|rec|if|else|return|fibervar|taskvar|machinevar|obj|msg|false|true|null|elsif|while|break|continue|super|this|seq|throw|try|catch|switch|case|default)/
    ],
    fn: s => {
      return s;
    }
  },
  "number": {
    rgx: [
      /-?[0-9]+(\.[0-9]+)?((e|E)(\+|-)?[0-9]+)?/
    ],
    fn: s => {
      return s;
    }
  },
  "variable": {
    rgx: [
      /\w+/
    ],
    fn: s => {
      return s;
    }
  },
  "comment": {
    rgx: [
      /;;;(.|;|\w)*/,
      /{;;;[^}]*?;;;}/
    ],
    fn: s => {
      return s;
    },
    pri: 2
  },
  "string": {
    rgx: [
      /"([^\\"]|\\\\|\\")*"/,
      /'([^\\']|\\\\|\\')*'/
    ],
    fn: s => {
      return s;
    }
  },
  "symbols": {
    rgx: [
      /(\(|\)|;|=|<-|!|{|}|\[|\]|\+|\.|,|-|<|\/|\*|:|\$|#|&|\||>|%)/
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
    case 'keyword':
      return `<span style='color:rgb(155,96,59)'>${value}</span>`;
    case 'variable':
      return `<span style='color:rgb(6,6,255)'>${value}</span>`;
    case 'string':
      return `<span style='color:rgb(0,127,0)'>${value}</span>`;
    case 'comment':
      return `<span style='color:rgb(255,4,255)'>${value}</span>`;
    case 'number':
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


const syntax_morpho = { lexer, renderText };


export { syntax_morpho };

