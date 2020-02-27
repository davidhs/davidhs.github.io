(function () {

    const head = document.getElementsByTagName('head')[0];
    const body = document.getElementsByTagName('body')[0];

    // The order here may matter!

    // Append the following to the head in this order.
    // Form:
    // <link rel="stylesheet" type="text/css" href="..." />
    const files_css = [
        "css/normalize.css",
        "css/style.css",
        "lib/bootstrap.min.css",
        "lib/bootstrap-reboot.min.css",
        "lib/bootstrap-grid.min.css"
    ];

    const files_html = [
        {
            path: "html/page.html",
            id: "content"
        }
    ];

    const files_regular_js_pre = [
        "js/setup-pre.js"
    ];

    // Append the following to body in this order
    // Form:
    // <script type="text/javascript" src="..."></script>
    const files_regular_js = [
        "lib/jquery.min.js",
        "lib/vue.min.js",
        "lib/popper.min.js",
        "lib/bootstrap.min.js",
        "js/extra.js"
    ];

    // Append the following to body in this order.
    // Form:
    // <script type="module" src="..."></script>
    const files_module_js = [
        "js/main.js"
    ];

    const files_regular_js_post = [
        "js/setup-post.js"
    ];

    // Queue things up.

    const job_queue = [];

    for (let i = 0; i < files_css.length; i += 1) {
        const job = {
            type: "css",
            data: files_css[i]
        };
        job_queue.push(job);
    }

    for (let i = 0; i < files_html.length; i += 1) {
        const job = {
            type: "html",
            data: files_html[i]
        };
        job_queue.push(job);
    }

    for (let i = 0; i < files_regular_js_pre.length; i += 1) {
        const job = {
            type: "js",
            data: files_regular_js_pre[i]
        };
        job_queue.push(job);
    }

    for (let i = 0; i < files_regular_js.length; i += 1) {
        const job = {
            type: "js",
            data: files_regular_js[i]
        };
        job_queue.push(job);
    }

    for (let i = 0; i < files_module_js.length; i += 1) {
        const job = {
            type: "module",
            data: files_module_js[i]
        };
        job_queue.push(job);
    }

    for (let i = 0; i < files_regular_js_post.length; i += 1) {
        const job = {
            type: "js",
            data: files_regular_js_post[i]
        };
        job_queue.push(job);
    }

    let job_idx = 0;

    function doNextJob() {

        if (job_idx < job_queue.length) {
            const job = job_queue[job_idx];
            job_idx += 1;

            const type = job.type;

            if (type === "css") {
                const path = job.data;

                const el = document.createElement('link');
                el.setAttribute('rel', 'stylesheet');
                el.setAttribute('type', 'text/css');
                el.onload = () => {
                    doNextJob();
                };
                el.setAttribute('href', path);
                head.appendChild(el);
            } else if (type === "js") {
                const path = job.data;
                const el = document.createElement('script');
                el.setAttribute('type', 'text/javascript');
                el.onload = () => {
                    doNextJob();
                };
                el.setAttribute('src', path);
                body.appendChild(el);
            } else if (type === "module") {
                const path = job.data;
                const el = document.createElement('script');
                el.setAttribute('type', 'module');
                el.onload = () => {
                    doNextJob();
                };
                el.setAttribute('src', path);
                body.appendChild(el);
            } else if (type === "html") {

                const path = job.data.path;
                const id = job.data.id;

                const xhr = new XMLHttpRequest();
                xhr.onreadystatechange = () => {
                    if (xhr.readyState === 4 && xhr.status === 200) {
                        const html = xhr.responseText;
                        document.getElementById(id).innerHTML = html;
                        doNextJob();
                    }
                };
                xhr.open("GET", path, true);
                xhr.send();
            } else {
                throw new Error("Unsupported type: " + type);
            }
        }
    }

    function start() {
        doNextJob();
    }

    setTimeout(function () {
        start();
    }, 10);
})();
