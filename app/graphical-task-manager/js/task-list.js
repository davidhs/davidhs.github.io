const ICON_PLAY = "▶";
const ICON_PAUSE = "||";

class TaskList {

    constructor(list_id, global_state) {
        this._ = {
            el: document.getElementById(list_id),
            tasks: {},
            gs: global_state,
            initialized: false
        };
    }

    init() {
        if (this._.initialized) {
            // Secondary initialization

            const task_ids = Object.keys(this._.tasks);
            for (let i = 0; i < task_ids.length; i += 1) {
                const task_id = task_ids[i];
                this.removeTaskID(task_id);
            }

        }

        // Primary initialization
        this._.initialized = true;

        // Initialize

        const gs = this._.gs;

        if (!gs.data.hasOwnProperty("tasks")) {
            gs.data.tasks = {};
        }

        const tasks = gs.data.tasks;
        const task_ids = Object.keys(tasks);
        for (let i = 0; i < task_ids.length; i += 1) {
            const task_id = task_ids[i];
            const task = tasks[task_id];
            if (!task._deleted) this.addTask(task);
        }
    }

    updateView() {

        const task_ids = Object.keys(this._.tasks);

        for (let i = 0; i < task_ids.length; i += 1) {
            const task_id = task_ids[i];
            this._.tasks[task_id].updateView();
        }
    }

    removeTaskID(taskID) {

        if (this._.tasks[taskID]) {
            delete this._.tasks[taskID];
        }

        // REMOVE DOM THINGIE

        $("[data-name=" + taskID + "]").remove();

        //$("[data-name=taskID]").remove();

    }

    addTask(task) {
        const el_li = document.createElement("li");

        el_li.setAttribute("data-name", task._id);

        const el_play = document.createElement("button");
        el_play.type = "button";
        el_play.classList.add("btn");
        el_play.classList.add("btn-primary");
        el_play.innerText = task._paused ? ICON_PLAY : ICON_PAUSE;
        el_play.style.marginRight = "5px";

        const el_text = document.createElement("span");

        el_text.innerText = task.text;


        const el_more = document.createElement("button");
        el_more.type = "button";
        el_more.style.marginRight = "10px";
        el_more.classList.add("btn");
        el_more.classList.add("btn-info");
        el_more.innerText = "...";

        el_more.onclick = evt => {
            this._.gs.do("initEditTask", task._id);
        };



        const el_duration = document.createElement("label");
        el_duration.style.float = "right";
        el_duration.style.fontFamily = "monospace";
        el_duration.innerText = this._.gs.do("getFormattedFullDuration", task._id);


        el_li.appendChild(el_more);
        el_li.appendChild(el_play);
        el_li.appendChild(el_text);
        el_li.appendChild(el_duration);



        this._.el.insertBefore(el_li, this._.el.firstChild);

        // this._.el.appendChild(el_li);

        el_play.onclick = evt => {

            if (el_play.innerText === ICON_PLAY) {
                el_play.innerText = ICON_PAUSE;
                this._.gs.do("startTimer", task._id);

            } else if (el_play.innerText === ICON_PAUSE) {
                el_play.innerText = ICON_PLAY;
                this._.gs.do("pauseTimer", task._id);

            }

            el_duration.innerText = this._.gs.do("getFormattedFullDuration", task._id);
        };

        const self = this;

        this._.tasks[task._id] = {
            task: task,
            updateView: function () {

                if (task._paused) {
                    el_play.innerText = ICON_PLAY;
                } else {
                    el_play.innerText = ICON_PAUSE;
                }

                el_duration.innerText = self._.gs.do("getFormattedFullDuration", task._id);
                el_text.innerText = gs.data.tasks[task._id].text;
            }
        };
    }
}


export { TaskList };

