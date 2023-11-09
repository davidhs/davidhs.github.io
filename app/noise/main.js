const html = document.querySelector("html");
html.style.height = "100%";

const body = document.querySelector("body");
body.style.height = "100%";
body.style.margin = "0";
body.style.background = "rgb(127, 127, 127)";
body.style.display = "flex";
body.style.flexDirection = "column";
body.style.justifyContent = "center";
body.style.alignItems = "center";


const container = document.createElement("div");
body.appendChild(container);


const canvas = document.createElement("canvas");
canvas.style.background = "rgb(255, 0, 255)";
canvas.style.boxShadow = "0px 0px 5px 2px rgba(0, 0, 0, 0.25)";


// Control UI
{
	const cui_container = document.createElement("div");

	const button = document.createElement("button");
	button.innerText = "Download";
	button.onclick = (e) => {
		const link = document.createElement("a");
		link.download = "canvas.png";
		link.href = canvas.toDataURL("image/png");
		link.click();
	};

	cui_container.appendChild(button);

	container.appendChild(cui_container);
}

container.appendChild(canvas);



let w = 256;
let h = 256;

canvas.width = 256;
canvas.height = 256;

const ctx = canvas.getContext("2d");

const image_data = ctx.getImageData(0, 0, w, h);
const { data } = image_data;



for (let y = 0; y < h; y++) {
	for (let x = 0; x < w; x++) {

		const i = 4 * (x + y * w);

		const r = Math.floor(256 * Math.random());
		const g = Math.floor(256 * Math.random());
		const b = Math.floor(256 * Math.random());
		const a = 255;

		data[i + 0] = r;
		data[i + 1] = g;
		data[i + 2] = b;
		data[i + 3] = a;
	}
}

// TODO: try to implement something like Perlin noise or simplex noise.


ctx.putImageData(image_data, 0, 0);

