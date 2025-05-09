
mgraphics.init();
mgraphics.relative_coords = 0;
mgraphics.autofill        = 0;

let width  = 0;
let height = 0;

let current_x = 0;
let current_y = 0;
let spacing   = 50;
let gap       = 0;
let lines     = [];
let count     = 0;
let isRunning = false;
let loop_     = false;

let t; // Task

function run(state) {
  if (state != 0) {
    isRunning = true;
    start();
  }
  else {
    isRunning = false;
    stop();
  }
}

function clear() {
  lines     = [];
  current_x = 0;
  current_y = 0;
  count     = 0;
  mgraphics.redraw();
}

function start() {
  if (!t) {
    t          = new Task(run_10_PRINT);
    t.interval = 30;
  }
  t.repeat();
}

function stop() {
  if (t) {
    t.cancel();
  }
}

function loop(v) {
  if (v == 0) {
    loop_ = false;
  }
  else {
    if (!isRunning) {
      isRunning = true;
      start();
    }
    loop_ = true;
  }
}

function paint() {
  width  = mgraphics.size[0];
  height = mgraphics.size[1];
  background();

  if (isRunning) {
    step();
  }
  previous_steps();
}

function previous_steps() {
  for (let line of lines) {
    mgraphics.set_source_rgba(1, 1, 1, 1);
    mgraphics.set_line_width(2);

    mgraphics.move_to(line.x1, line.y1);
    mgraphics.line_to(line.x2, line.y2);
    mgraphics.stroke();
  }
}

function step() {
  let line   = {};
  let choice = make_choice();

  if (choice) {
    // Backward slash
    line = {
      x1 : current_x + gap,
      y1 : current_y + gap,
      x2 : current_x + spacing - gap,
      y2 : current_y + spacing - gap
    }
  }
  // Forward slash
  else {
    line = {
      x1 : current_x + gap,
      y1 : current_y + spacing - gap,
      x2 : current_x + spacing - gap,
      y2 : current_y + gap
    }
  }

  mgraphics.set_source_rgba(1, 1, 1, 1);
  mgraphics.set_line_width(2);

  mgraphics.move_to(line.x1, line.y1);
  mgraphics.line_to(line.x2, line.y2);
  mgraphics.stroke();

  if (lines[count]) {
    lines[count] = line;
  }
  else {
    lines.push(line);
  }

  current_x += spacing;
  count     += 1;

  if (current_x >= width) {
    current_x  = 0;
    current_y += spacing;
  }

  if (current_y >= height) {
    if (!loop_) {
      stop();
      isRunning = false;
    }
    else {
      current_y = 0;
      count     = 0;
    }
    outlet(0, "done");
  }
}

function make_choice() {
  return Math.random(1) < 0.5;
}

function run_10_PRINT() {
  mgraphics.redraw();
}

function background() {
  mgraphics.set_source_rgba(0, 0.51, 0.784, 1);
  mgraphics.rectangle(0, 0, width, height);
  mgraphics.fill();
}
