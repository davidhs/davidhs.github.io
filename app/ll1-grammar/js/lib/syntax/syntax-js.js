import { escapeHTML } from '../utils/utils-string.js';
import { Lexer } from './lexer.js';

// TODO needs fixing

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
      // Current
      /(break|case|catch|continue|debugger|default|delete|do|else|finally|for|function|if|in|instanceof|new|return|switch|this|throw|try|typeof|var|void|while|with)/,
      // Future
      /(class|const|enum|export|extends|import|super)/,
      // Future strict,
      /(implements|interface|let|package|private|protected|public|static|yield)/,
      // Null
      /(null)/,
      // Boolean
      /(true|false)/
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
      /\/\/(.|;|\w)*/,
      /\/\*[^\*]*\*\//
    ],
    fn: s => {
      return s;
    },
    pri: 2
  },
  "string": {
    rgx: [
      /"([^\\"]|\\\\|\\"|\\r|\\n|\\u[0-9][0-9][0-9][0-9]|\\t||\\)*"/,
      /'([^\\']|\\\\|\\'|\\r|\\n|\\u[0-9][0-9][0-9][0-9]|\\t||\\)*'/,
      /`([^\\`]|\\\\|\\`|\\r|\\n|\\u[0-9][0-9][0-9][0-9]|\\t||\\)*`/,
    ],
    fn: s => {
      return s;
    }
  },
  "regex": {
    rgx: [
      /\/.*\/[gimuy]*/
    ],
    fn: s => {
      return s;
    }
  },
  "symbols": {
    rgx: [
      /({|}|;|\[|\]|\(|\)|:|,|=|<|>|\.|\+|-|\*|\/|&|\^|\||~|%|!|\?)/
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
      return `<span style='color:rgb(168,29,142)'>${value}</span>`;
    case 'variable':
      return `<span style='color:rgb(38,32,164)'>${value}</span>`;
    case 'string':
      return `<span style='color:rgb(193,36,37)'>${value}</span>`;
    case 'comment':
      return `<span style='color:rgb(18,115,18)'>${value}</span>`;
    case 'number':
      return `<span style='color:rgb(38,32,164)'>${value}</span>`;
    case 'symbols':
      return `<span style='color:rgb(34,34,34)'>${value}</span>`;
    case 'regex':
      return `<span style='color:rgb(193,25,26)'>${value}</span>`;
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

const syntax_js = { lexer, renderText };

export { syntax_js };
