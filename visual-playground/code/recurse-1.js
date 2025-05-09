mgraphics.init();
mgraphics.relative_coords = 0;
mgraphics.autofill        = 0;

let colors = {
  black : [ 0, 0, 0, 1 ],
  white : [ 1, 1, 1, 1 ],
  grey : [ 0.5, 0.5, 0.5, 1 ],
}

function paint() {
  let width  = mgraphics.size[0];
  let height = mgraphics.size[1];

  mgraphics.set_source_rgba(colors.black);
  mgraphics.rectangle(0, 0, width, height);
  mgraphics.fill();

  draw_square(width, height, 0, 0, 0);
}

function draw_square(width, height, parent_x, parent_y, count) {
  let square_w = width * 0.8;
  let square_h = height * 0.8;
  let pos_x    = parent_x + (width - square_w) / 2;
  let pos_y    = parent_y + (height - square_h) / 2;
  let color    = count % 2 == 0 ? colors.white : colors.grey;

  mgraphics.set_source_rgba(colors.white);
  mgraphics.set_line_width(1);
  mgraphics.rectangle(pos_x, pos_y, square_w, square_h);
  mgraphics.stroke();

  count += 1;

  if (square_w > 15) {
    draw_square(square_w, square_h, pos_x, pos_y, count)
  }
}
