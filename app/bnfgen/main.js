


// Source code
var tasource = document.getElementById('tasource');
var taoutput = document.getElementById('taoutput'); 



let btn = document.getElementById('process');




btn.onclick = (e) => {
    main();  
};

// JS is PoS
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};


function main() {

    let lines = tasource.value.split('\n').map(x => x.trim()).filter(x => x);


    function isNonterminal(token) {
      let i = 0;
      let j = token.length - 1;
      
      let a = token.charAt(i);
      let b = token.charAt(j);
      
      return a === '<' && b === '>';
    }
    
    function isTerminal(token) {
      let i = 0;
      let j = token.length - 1;
      
    
      let a = token.charAt(i);
      let b = token.charAt(j);
      
      return (a === '"' && b === '"') || (a === "'" && b === "'");
    }
    
    function splitChoices(l) {
      
        let nl = [];
        
        let i = 0;
        let j = l.indexOf('|', i);
        
        while (j !== -1) {
          
          nl.push(l.slice(i, j));
          
          i = j + 1;
          j = l.indexOf('|', i);
        }
        
        j = l.length;
        
        nl.push(l.slice(i, j));
        
    
        return nl;
    }
    
    function stripTerminal(s) {
      return s.substring(1, s.length - 1);
    }
    
    function transform1(choices) {
      
      for (let i = 0; i < choices.length; i++) {
        let choice = choices[i];
        for (let j = 0; j < choice.length; j++) {
          let atom = choice[j];
          
          let atomN = atom.substring(1, atom.length - 1);
          
          
          if (isNonterminal(atom)) {
            choices[i][j] = {
              type: 'nonterminal',
              value: atomN
            };
          } else if (isTerminal(atom)) {
            choices[i][j] = {
              type: 'terminal',
              value: atomN
            };
          } else {
            console.error("Error: " + atom);
          }
        }
      }
      
      return choices;
    }
    

    let rules = {
        rootElement: null
        , rootTree: {}
    };
    
    
    for (let i = 0; i < lines.length; i += 1) {
    
        let line = lines[i];
    
        let r1 = /<[\w-]+>|"[^"]+"|::=|\|/g;
        let r2 = /<[\w-]+>|"[^"]*"|'[^']*'|::=|\|/g;
    
        let regex = r2;
    
        let tokens = line.match(regex);
        
        // Index of def. token
        let iodt = tokens.indexOf('::=');
        
        let left = tokens.slice(0, iodt);
        let right = tokens.slice(iodt + 1, tokens.length);
        
        left = splitChoices(left);
        right = splitChoices(right);
    
    
        // Recognize as terminal and nonterminal
    
        
        // Transform
        
        left = transform1(left);
        right = transform1(right);
        
        let defTok = left[0][0].value;

        if (i === 0) {
            rules.rootElement = defTok;
        }
        
        if (!rules.hasOwnProperty(defTok)) {
          rules.rootTree[defTok] = [];
        }
        
        
        for (let i = 0; i < right.length; i++) {
          rules.rootTree[defTok].push(right[i]);
        }
        
    }



    function randomPick(l) {

        let choice = ~~(Math.random() * l.length);

        return l[choice];
    }

    function insert(arr, index, item) {
        arr.splice(index, 0, item);
    };

    function adhocReplace(arr, index, replacement) {

        let left = arr.slice(0, index);
        let right = arr.slice(index + 1, arr.length);

        if (!Array.isArray(replacement)) {
            replacement = [replacement];
        }

        return left.concat(replacement.concat(right));
    }

    function generate(rules) {


        let l = randomPick(rules.rootTree[rules.rootElement]);

        // left most, always pick first element

        let idx = 0;

        while (idx < l.length) {
            if (l[idx].type === 'nonterminal') {
                let ns = randomPick(rules.rootTree[l[idx].value]);
                l = adhocReplace(l, idx, ns);
    
            } else if (l[idx].type === 'terminal') {
                idx++;
            }
        }


        let msg = [];

        for (let i = 0; i < l.length; i++) {
            let val = l[i].value;
            
            if (val === "\\n") val = "\n";
            
            msg.push(val);
        }
        
        let txt = msg.join('');
        

        return txt;
    }
    

    let gs = generate(rules);
    
    
    taoutput.value = gs;
}

