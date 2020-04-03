import {
  renderText
} from './lib/syntax/syntax.js';
import {
  getFirstAndFollow
} from './first-follow-table.js';
import {
  load
} from './lib/io/loader.js';



const text_back = document.getElementById('text_back');
const text_front = document.getElementById('text_front');
const select_syntax = document.getElementById('select_syntax');
const select_example = document.getElementById('select_example');
const ta_parse_table = document.getElementById('ta_parse_table');
const ta_ss_source = document.getElementById('ss_source');
const ta_top = document.getElementById('ta_top');
const ta_middle = document.getElementById('ta_middle');
const ta_bottom = document.getElementById('ta_bottom');




let selected_language = select_syntax.selectedOptions[0].value;

select_syntax.onchange = evt => {
  selected_language = select_syntax.selectedOptions[0].value;
  update();
};

select_example.onchange = evt => {

  const value = select_example.selectedOptions[0].value;

  const url = value;

  load({
    text: {
      example: url
    }
  }, res => {

    text_back.innerText = res.text.example;
    update();
  });
};


text_back.onchange = evt => {
  update();
};

text_back.onkeyup = evt => {
  update();
};

text_back.onkeydown = evt => {
  update();
};

// https://stackoverflow.com/questions/4340227/sort-mixed-alpha-numeric-array
var reA = /[^a-zA-Z]/g;
var reN = /[^0-9]/g;


function sortAlphaNum(a, b) {
  var aA = a.replace(reA, "");
  var bA = b.replace(reA, "");
  if (aA === bA) {
    var aN = parseInt(a.replace(reN, ""), 10);
    var bN = parseInt(b.replace(reN, ""), 10);
    return aN === bN ? 0 : aN > bN ? 1 : -1;
  } else {
    return aA > bA ? 1 : -1;
  }
}




function tableToString(table) {

  let msg = "";

  const m = table.length;
  const n = table[0].length;

  const max_row_height = [];
  const max_col_width = [];

  for (let i = 0; i < m; i += 1) max_row_height[i] = 0;
  for (let i = 0; i < n; i += 1) max_col_width[i] = 0;


  for (let i = 0; i < m; i += 1) {
    for (let j = 0; j < n; j += 1) {

      const entry = table[i][j];
      const subentries = entry.split("\n");

      if (subentries.length > max_row_height[i]) {
        max_row_height[i] = subentries.length;
      }

      for (let k = 0; k < subentries.length; k += 1) {
        const subentry = subentries[k];
        if (subentry.length > max_col_width[j]) {
          max_col_width[j] = subentry.length;
        }
      }
    }
  }


  const lines = [];
  for (let i = 0; i < max_row_height.length; i += 1) {
    for (let j = 0; j < max_row_height[i]; j += 1) {
      lines.push([]);
    }
  }
  let line_idx = 0;



  for (let i = 0; i < m; i += 1) {

    for (let j = 0; j < n; j += 1) {

      const entry = table[i][j];
      const subentries = entry.split("\n");

      const h = max_col_width[j];

      for (let k = 0; k < max_row_height[i]; k += 1) {

        let cell = "";

        if (k < subentries.length) {
          const subentry = subentries[k];
          cell = subentry;
        }

        lines[line_idx + k].push(cell.padEnd(h, " "));
      }
    }

    // Increment
    line_idx += max_row_height[i];
  }

  for (let i = 0; i < lines.length; i += 1) {
    let line = "";
    for (let j = 0; j < lines[i].length; j += 1) {
      line += "|" + lines[i][j];
    }

    if (i === 0) {
      msg += " " + "-".repeat(line.length - 1);
      msg += "\n";
    }

    msg += line + "|";
    msg += "\n";
    msg += " " + "-".repeat(line.length - 1);
    msg += "\n";
  }

  return msg;
}

function update() {

  const text = text_back.innerText;
  // TODO: renderedText is broken for some reason...
  // const renderedText = renderText(text, selected_language);
  // text_front.innerHTML = text;

  ta_top.value = "";
  ta_middle.value = "";
  ta_bottom.value = "";
  ta_parse_table.value = "";
  ta_ss_source.value = "";


  let bundle = getFirstAndFollow({
    source: text
  });

  // console.log(bundle);

  let msg_first = "";
  const first = bundle.table_first;
  if (first) {
    const first_keys = Object.keys(first);
    for (let i = 0; i < first_keys.length; i += 1) {
      const key = first_keys[i];
      const set = first[key];
      msg_first += key + ": ";

      const first_list = [];

      set.forEach(x => {
        first_list.push(x);

      });

      first_list.sort(sortAlphaNum);

      msg_first += first_list.join(' ');

      msg_first += "\n";

    }
  }

  let msg_follow = "";
  const follow = bundle.table_follow;
  if (follow) {
    const follow_keys = Object.keys(follow);
    for (let i = 0; i < follow_keys.length; i += 1) {
      const key = follow_keys[i];
      const set = follow[key];

      msg_follow += key + ": ";

      const follow_list = [];
      set.forEach(x => {
        follow_list.push(x);
      });

      follow_list.sort(sortAlphaNum);

      msg_follow += follow_list.join(' ');

      msg_follow += "\n";
    }
  }

  // http://www.bottlecaps.de/rr/ui




  let msg_parse = "";
  const parse_table = bundle.parsing_table;
  if (parse_table && Array.isArray(parse_table)) {


    ta_parse_table.value = tableToString(parse_table);
  }

  let msg_railroad = "";
  if (bundle.railroad_source) {
    msg_railroad += bundle.railroad_source;
  }

  ta_ss_source.value = "See diagram at: http://www.bottlecaps.de/rr/ui\n\nCopy the following grammar:\n\n" + msg_railroad;

  ta_top.value = msg_first;
  ta_middle.value = msg_follow;
  ta_bottom.value = bundle.error_message;
}