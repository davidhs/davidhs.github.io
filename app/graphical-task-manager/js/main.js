import { GlobalState }  from './global-state.js';
import { TaskList }  from './task-list.js';
import { formatTime, formatDate }  from './stuff.js';
import { generateUniqueID } from './tools.js';
import { deflate, inflate } from './lib/json-compression.js';

window.deflate = deflate;
window.inflate = inflate;


let is_branching = false;
let branch_target = null;


const LOCAL_STORAGE_TAG = "BoQJZGAp3EtFYYwDqy8yIZjlbTc6Orkk";


const gs = new GlobalState();
gs.setLocalStorageKey(LOCAL_STORAGE_TAG);

const tl1 = new TaskList("tasklist1", gs);


function showDOM(target) {
    if (typeof target === "string") {
        target = document.getElementById(target);
    }

    const view_list = [
        "view-create-task"
        , "view-edit-task"
        , "view-tasks"
        , "view-import-json"
        , "view-export-json"
    ];

    // TODO: optimize this.

    // Hide every view
    for (let i = 0; i < view_list.length; i += 1) {
        document.getElementById(view_list[i]).style.display = "none";
    }

    target.style.display = "grid";
}


function animate() {

    tl1.updateView();
    setTimeout(animate, 1000 / 60);
}

animate();


///

function iosCopyToClipboard(el) {
    var oldContentEditable = el.contentEditable,
        oldReadOnly = el.readOnly,
        range = document.createRange();

    el.contenteditable = true;
    el.readonly = false;
    range.selectNodeContents(el);

    var s = window.getSelection();
    s.removeAllRanges();
    s.addRange(range);

    el.setSelectionRange(0, 999999); // A big number, to cover anything that could be inside the element.

    el.contentEditable = oldContentEditable;
    el.readOnly = oldReadOnly;

    document.execCommand('copy');
}

////////////////////////////////////////////////////////////////////////////////
// WIRE BUTTONS

document.getElementById("import-json-import").onclick = evt => {

    // TODO: do importation

    const ta = document.getElementById("import-json-text");

    const text = ta.value;

    const imported_text = JSON.stringify(inflate(text));

    try {
        gs.importJSON(imported_text);
        ta.value = "";
        tl1.init();
        showDOM("view-tasks");
        console.log("Importing: " + imported_text);
    } catch (e) {

    }
};



document.getElementById("input-export-json-clipboard").onclick = evt => {

    const ta = document.getElementById("export-json-text");

    iosCopyToClipboard(ta);


    ta.select();
    document.execCommand("copy");
};

document.getElementById("import-json-cancel").onclick = evt => {
    showDOM("view-tasks");
};

document.getElementById("export-json-back").onclick = evt => {
    showDOM("view-tasks");
};

document.getElementById("input-export-json").onclick = evt => {

    // TODO: GENERATE JSON

    const exported_text = deflate(gs.exportJSON(), true);


    document.getElementById("export-json-text").value = exported_text;

    showDOM("view-export-json");
};

document.getElementById("input-import-json").onclick = evt => {
    showDOM("view-import-json");
}

document.getElementById("input-task-branch").onclick = evt => {
    const taskID = document.getElementById("view-edit-task").getAttribute("data-task-id");

    // Finish task editing event.
    document.getElementById("input-task-edited").onclick();

    is_branching = true;
    branch_target = taskID;

    // Create task
    document.getElementById("input-create-task").onclick();
};

document.getElementById("input-clear-storage").onclick = (evt) => {

    const key = LOCAL_STORAGE_TAG;

    gs.block();
    localStorage.removeItem(key);

    // Clear cache manifest
    const appCache = window.applicationCache;

    try {
        appCache.update(); //this will attempt to update the users cache and changes the application cache status to    'UPDATEREADY'.

        if (appCache.status == window.applicationCache.UPDATEREADY) {
            appCache.swapCache(); //replaces the old cache with the new one.
        }
    } catch (e) {}

    location.reload();
};

document.getElementById("input-create-task").onclick = evt => {
    showDOM("view-create-task");
};

document.getElementById("input-task-edited").onclick = evt => {

    const taskID = document.getElementById("view-edit-task").getAttribute("data-task-id");
    const task = gs.data.tasks[taskID];

    const vetd = document.getElementById("view-edit-task-description");

    gs.do("editTask", {
        taskID: taskID,
        path: "text",
        value: vetd.value
    });

    if (tl1._.tasks[task._id]) {
        tl1._.tasks[task._id].updateView();
    }

    showDOM("view-tasks");
};

document.getElementById("input-task-created").onclick = evt => {

    const task = gs.do("createTask", {
        text: document.getElementById('description-create-task').value
    });


    if (is_branching) {

        task._dependents.push(branch_target);

        const parent_task = gs.do("getTask", branch_target);
        parent_task._dependencies.push(task._id);

        is_branching = false;
        branch_target = null;
    }

    gs.do("addTask", task);

    document.getElementById('description-create-task').value = "";

    showDOM("view-tasks");
};

document.getElementById("input-task-delete").onclick = evt => {

    const taskID = document.getElementById("view-edit-task").getAttribute("data-task-id");

    gs.do("deleteTask", taskID);

    showDOM("view-tasks");
};

////////////////////////////////////////////////////////////////////////////////
// ACTION DEFINITIONS

gs.setAction("getNextID", () => {

    let candidate_id = generateUniqueID();

    // TODO: might be dangerous if most IDs have been exhausted.
    while (gs.data.tasks.hasOwnProperty(candidate_id)) {
        candidate_id = generateUniqueID();
    }

    return candidate_id;
});

gs.setAction("getTask", taskID => {
    return gs.data.tasks[taskID];
});

gs.setAction("getTaskElapsedTime", (task_ID) => {

    const task = gs.data.tasks[task_ID];

    // Legacy problems

    if (!task.hasOwnProperty("stopwatch_timestamps")) {
        task.stopwatch_timestamps = [];
    }


    const timestamps = task.stopwatch_timestamps;



    const n = timestamps.length;

    // if n is even, then paused
    // if n is odd, then running

    // Forward

    // Forward to this point
    const k = (n % 2 === 0) ? n : n - 1;

    // NOTE: I hope this works.

    for (let i = task.stopwatch_index; i < k; i += 2) {
        const time_from = timestamps[i];
        const time_to = timestamps[i + 1];
        const elapsed_time = time_to - time_from;

        task.stopwatch_index += 2;
        task.stopwatch_elapsed_time += elapsed_time;
    }

    if (n % 2 === 0) {
        // Not running
        return task.stopwatch_elapsed_time;
    } else {
        // Running
        const latest_start_time = timestamps[timestamps.length - 1];
        const now = Date.now();
        const elapsed_time = task.stopwatch_elapsed_time + (now - latest_start_time);

        return elapsed_time;
    }
});


gs.setAction("createTask", taskCore => {

    const now = Date.now();

    taskCore._id = gs.do("getNextID");
    taskCore._timeLast = 0;
    taskCore._duration = 0;
    taskCore._paused = true;
    taskCore._createDate = now;
    taskCore._lastEditedDate = now;

    /**
     * What stopwatch was pressed and released.
     */
    taskCore.stopwatch_timestamps = [];

    /**
     * How much stopwatch time has passed.
     */
    taskCore.stopwatch_elapsed_time = 0;

    /**
     * Points to the index of the next timestamp
     */
    taskCore.stopwatch_index = 0;


    /**
     * What tasks this task depends on.
     */
    taskCore._dependencies = [];

    /**
     * What tasks depend on this task.
     */
    taskCore._dependents = [];

    taskCore._deleted = false;
    taskCore._deleteDate = 0;

    // If this task item is part of a tree then if an ancestor
    // is running then its blocked by it.
    taskCore._blocked = false;
    taskCore._blockedBy = null;

    return taskCore;
});

gs.setAction("addTask", (task) => {
    gs.data.tasks[task._id] = task;
    tl1.addTask(task);
});

gs.setAction("updateDuration", (taskID) => {
    gs.do("getTaskElapsedTime", taskID);
});

gs.setAction("getFormattedFullDuration", taskID => {
    const fullDuration = gs.do("getFullDuration", taskID);
    return formatTime(fullDuration);
});

gs.setAction("getFormattedDuration", taskID => {
    const duration = getTaskElapsedTime(taskID);
    return formatTime(duration);
});

gs.setAction("pauseGraph", taskID => {


    // List all nodes in graph.

    const paused_nodes = {};

    const q = [];

    q.push(taskID);

    while (q.length > 0) {
        const id = q.pop();

        if (!paused_nodes[id]) {
            paused_nodes[id] = true;

            const task = gs.data.tasks[id];

            if (!task._paused) {
                gs.do("pauseTimer", id);
            }

            // Add dependencies
            for (let i = 0; i < task._dependencies.length; i += 1) {
                const dependency = task._dependencies[i];

                // Only add dependency if not already in paused_nodes
                if (!paused_nodes[dependency]) q.push(dependency);
            }

            // Add dependents
            for (let i = 0; i < task._dependents.length; i += 1) {
                const dependent = task._dependents[i];

                // Only add dependency if not already in paused_nodes
                if (!paused_nodes[dependent]) q.push(dependent);
            }
        }

    }
});

gs.setAction("startTimer", taskID => {

    gs.do("pauseGraph", taskID);
    const task = gs.data.tasks[taskID];

    if (!task._paused) throw Error("Starting already running timer!");

    const now = Date.now();

    if (!task.hasOwnProperty("stopwatch_timestamps")) {
        task.stopwatch_timestamps = [];
    }

    task.stopwatch_timestamps.push(now);
    task._paused = false;
    task._lastEditedDate = now;

});

gs.setAction("pauseTimer", taskID => {

    const task = gs.data.tasks[taskID];

    if (task._paused) throw Error("Pausing an already paused timer!");

    const now = Date.now();

    if (!task.hasOwnProperty("stopwatch_timestamps")) {
        task.stopwatch_timestamps = [];
    }

    task.stopwatch_timestamps.push(now);
    task._paused = true;
    task._lastEditedDate = now;
});



// (taskID, path, value)
gs.setAction("editTask", o => {

    const taskID = o.taskID;
    const path = o.path;
    const value = o.value;

    const crumbs = path.split(".");


    const task = gs.data.tasks[taskID];

    let node = task;

    for (let i = 0; i < crumbs.length - 1; i += 1) {
        node = node[crumbs[i]];
    }

    const last_crumb = crumbs[crumbs.length - 1];


    if (node[last_crumb] !== value) {
        node[last_crumb] = value;
        task._lastEditedDate = Date.now();
    }
});

gs.setAction("initEditTask", taskID => {

    const task = gs.data.tasks[taskID];

    document.getElementById("view-edit-task").setAttribute("data-task-id", taskID);

    document.getElementById("view-edit-task-description").value = task.text;
    document.getElementById("view-edit-task-create-date").innerText = formatDate(task._createDate);
    document.getElementById("view-edit-task-internal-id").innerText = "" + task._id;
    document.getElementById("view-edit-task-last-edited").innerText = formatDate(task._lastEditedDate);

    const duration = gs.do("getTaskElapsedTime", task._id);

    document.getElementById("view-edit-task-duration").innerText = formatTime(duration);
    document.getElementById("view-edit-task-full-duration").innerText = formatTime(gs.do("getFullDuration", task._id));

    // DEPENDENCIES


    const dom_dependencies = document.getElementById("view-edit-dependencies");
    dom_dependencies.innerHTML = "";

    const dependencies = task._dependencies;
    for (let i = 0; i < dependencies.length; i += 1) {
        const dependency = dependencies[i];

        console.log(dependency);

        // <button type="button" class="btn btn-secondary">1</button>
        const btn = document.createElement("button");
        btn.setAttribute("type", "button");
        btn.classList.add("btn");
        btn.classList.add("btn-secondary");
        btn.innerText = dependency + ": " + gs.do("getTask", dependency).text.substring(0, 10) + "...";
        btn.onclick = evt => {
            // Finish editing task
            document.getElementById("input-task-edited").onclick();
            gs.do("initEditTask", dependency);
        };
        dom_dependencies.appendChild(btn);
    }

    // DEPENDENTS
    const dom_dependents = document.getElementById("view-edit-dependents");
    dom_dependents.innerHTML = "";

    const dependents = task._dependents;
    for (let i = 0; i < dependents.length; i += 1) {
        const dependent = dependents[i];
        // <button type="button" class="btn btn-secondary">1</button>
        const btn = document.createElement("button");
        btn.setAttribute("type", "button");
        btn.classList.add("btn");
        btn.classList.add("btn-secondary");
        btn.innerText = dependent + ": " + gs.do("getTask", dependent).text.substring(0, 10) + "...";
        btn.onclick = evt => {
            // Finish editing task
            document.getElementById("input-task-edited").onclick();
            gs.do("initEditTask", dependent);
        };
        dom_dependents.appendChild(btn);
    }


    const dom_stopwatch_timestamps = document.getElementById("view-stopwatch-timestamps");

    

    const timestamps = task.stopwatch_timestamps;

    console.log(timestamps);


    let html = "";

    for (let i = 0; i < timestamps.length; i += 2) {

        const time_from = timestamps[i];

        const f_time_from = (new Date(time_from)).toISOString().split("").map(x => x === "T" || x === "Z" ? " " : x).join("").trim();

        

        if (i > 0) {
            html += "<br/>";
        }

        html += "<span style='color:green;font-family:monospace'>" + f_time_from + "</span> - "


        if (i + 1 === timestamps.length) {
            // No end
        } else {
            const time_to = timestamps[i + 1];
            const f_time_to = (new Date(time_to)).toISOString().split("").map(x => x === "T" || x === "Z" ? " " : x).join("").trim();
            html += "<span style='color:red;font-family:monospace'>" + f_time_to + "</span>"
        }
    }


    dom_stopwatch_timestamps.innerHTML = html;




    showDOM("view-edit-task");
});

/**
 * NOTE: this needs to be fixed.
 */
gs.setAction("getFullDuration", (taskID) => {

    const task = gs.data.tasks[taskID];

    
    const duration = gs.do("getTaskElapsedTime", taskID);

    let fullDuration = 0;
    fullDuration += duration;

    for (let i = 0; i < task._dependencies.length; i += 1) {
        const dependency = task._dependencies[i];
        fullDuration += gs.do("getFullDuration", dependency);
    }

    return fullDuration;

});

gs.setAction("deleteTask", taskID => {

    const task = gs.data.tasks[taskID];

    // Remove from task list
    tl1.removeTaskID(taskID);


    // Pause timer.
    if (!task._paused) {
        gs.do("pauseTimer", taskID);
    }

    // Mark as deleted.
    task._deleted = true;
    task._deleteDate = Date.now();

    // Move to deleted.

    // Set last edited
    task._lastEditedDate = Date.now();

    // TODO: remove dependencies
    // TODO: remove dependents
});

////////////////////////////////////////////////////////////////////////////////


tl1.init();


window.gs = gs;

document.body.addEventListener('touchmove', function (event) {
    // event.preventDefault();
});








