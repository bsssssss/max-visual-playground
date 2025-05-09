mgraphics.init();
mgraphics.relative_coords = 0;
mgraphics.autofill        = 0;

let width  = 0;
let height = 0;

let rosepale = {
  a : [ 0.1, 0.1, 0.1 ], // Contrast
  b : [ 0.5, 0.5, 0.5 ], // Brightness
  c : [ 1.1, 0.6, 0.4 ], // Frequency
  d : [ 0.0, 0.3, 0.5 ], // Phaseshift
}

function paint() {
  width  = mgraphics.size[0];
  height = mgraphics.size[1];

  background();
  draw_square(10, 10, 50, 50);
}

function background() {
  let color = palette(0.83, rosepale, 1);
  mgraphics.set_source_rgba(color);
  mgraphics.rectangle(0, 0, width, height);
  mgraphics.fill();
}

function draw_square(x, y, dx, dy) {
  if (x > width || y > height) {
    return
  }

  let color = palette(0.9, rosepale, 1);
  mgraphics.set_source_rgba(color);
  mgraphics.rectangle(x, y, dx, dy);
  mgraphics.fill();

  // post(x);
  draw_square(x + dx + 10, y + (y / 1.145), dx, dy)
}

// --------------------------------------------------- //
/*
 * Color selector from palette {params}
 * */
function palette(t, params, alpha) {
  // Vector style map
  const rgb = [ 0, 1, 2 ].map(i => {
    // Calculate the color
    const val = params.a[i] + params.b[i] * Math.cos(6.283185 * (params.c[i] * t + params.d[i]));

    // Keep it in 0-1 range
    return Math.max(0, Math.min(1, val));
  })
  return [...rgb, alpha ];
}
