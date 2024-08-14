/**
 * @template T
 * @param {undefined | null | T} x
 * @returns {T}
 */
function unwrap(x) {
  if (x === undefined || x === null) throw new Error("Unwrapping error!");
  return x;
}

/**
 * @param {HTMLCanvasElement} canvas
 * @param {MouseEvent} event
 */
function getMousePosition(canvas, event) {
  const rect = canvas.getBoundingClientRect();

  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  return { x, y };
}

/**
 * @param {number} x 
 * @param {number} min 
 * @param {number} max 
 */
function wrapNumber(x, min, max) {
  // Assumes min < max
  const span = max - min;

  const ox = x - min;

  const owx = ((ox % span) + span) % span;

  const wx = owx + min;

  return wx;
}

const PI = Math.PI;
const TAU = 2 * PI;

console.log("Hello world!");

/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("canvas");
canvas.width = 600;
canvas.height = 600;

const ctx = unwrap(canvas.getContext("2d"));

let mx = 0;
let my = 0;

window.addEventListener("mousemove", (e) => {
  const { x, y } = getMousePosition(canvas, e);

  mx = x;
  my = y;

  render();
});

window.addEventListener("wheel", (e) => {
  if (e.deltaY < 0) core_nr_of_spokes += 1;
  else core_nr_of_spokes -= 1;

  if (core_nr_of_spokes < 1) core_nr_of_spokes = 1;
  if (core_nr_of_spokes > 32) core_nr_of_spokes = 32;

  console.log(core_nr_of_spokes);

  render();
});

let core_nr_of_spokes = 6;

function render() {
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  //const short_radius = Math.min(cx, cy);

  const start_radius = 25; // 0.1 * short_radius;
  const end_radius = 162.5; // 0.65 * short_radius;

  const nr_of_spokes = 8 * core_nr_of_spokes;

  // Clear canvas
  {
    ctx.save();

    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.restore();
  }

  // Draw spokes
  {
    ctx.save();

    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;

    for (let i = 0; i < nr_of_spokes; i++) {
      const angle = (i * TAU) / nr_of_spokes;

      const dx = Math.cos(angle);
      const dy = Math.sin(angle);

      const ax = cx + dx * start_radius;
      const ay = cy + dy * start_radius;

      const bx = cx + dx * end_radius;
      const by = cy + dy * end_radius;

      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.stroke();
    }

    ctx.restore();
  }

  /**
   * @param {number} angleOffset
   * @param {string} color
   */
  function drawPointer(angleOffset, color) {
    let angle = angleOffset + Math.atan2(my - cy, mx - cx);

    // Displayed angle, mirrored around x-axis.
    const d_angle = wrapNumber(-angle, 0, TAU);

    const d_angle_deg = d_angle * 180 / PI;

    const dx = Math.cos(angle);
    const dy = Math.sin(angle);

    const px = cx + dx * (end_radius + 10);
    const py = cy + dy * (end_radius + 10);

    ctx.save();

    ctx.fillStyle = color;

    ctx.beginPath();
    ctx.arc(px, py, 3, 0, TAU);
    ctx.fill();

    ctx.font = "14px sans-serif";
    
    if (d_angle_deg <= 180) {
      ctx.fillText(`${d_angle_deg.toFixed(3)}°`, px, py - 10);
    } else {
      ctx.fillText(`${d_angle_deg.toFixed(3)}° [-${(360 - d_angle_deg).toFixed(3)}°]`, px, py - 10);
    }

    
    

    ctx.restore();
  }

  drawPointer((-1 / 8) * TAU, "#808080");
  drawPointer((-3 / 8) * TAU, "#808080");
  drawPointer((-5 / 8) * TAU, "#808080");
  drawPointer((-7 / 8) * TAU, "#808080");

  drawPointer(( 0 / 8) * TAU, "#ff0000"); // mouse
  drawPointer((-2 / 8) * TAU, "#0000ff"); // 90°
  drawPointer((-4 / 8) * TAU, "#ff8000"); // mouse antipode
  drawPointer((-6 / 8) * TAU, "#8000ff"); // 90° antipode
}

render();
