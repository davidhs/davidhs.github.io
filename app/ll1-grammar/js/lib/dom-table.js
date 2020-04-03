

function createTable(table, header) {

    const dom_table = document.createElement('table');

    dom_table.style.borderCollapse = "collapse";

    const n = table[0].length;

    if (header) {
        const dom_tr = document.createElement('tr');
        const dom_th = document.createElement('tr');
        dom_th.colspan = n;
        dom_th.innerText = header;

        dom_tr.appendChild(dom_th);
        dom_table.appendChild(dom_tr);

    }

    for (let i = 0; i < table.length; i += 1) {

        const row = table[i];

        const dom_tr = document.createElement('tr');
        if (i % 2 === 0) {
            dom_tr.style.backgroundColor = "#ddd";
        }
        

        for (let j = 0; j < row.length; j += 1) {

            const cell = row[j];

            const dom_td = document.createElement('td');
            dom_td.style.padding = "8px";
            dom_td.style.textAlign = "left";
            dom_td.style.border = "1px solid #dddddd";

            if (typeof cell === "number") {
                dom_td.innerText = cell.toFixed(3);
            } else {
                dom_td.innerText = cell;
            }

            
            dom_tr.appendChild(dom_td);

        }
        dom_table.appendChild(dom_tr);
    }


    return dom_table;
}


export { createTable };
