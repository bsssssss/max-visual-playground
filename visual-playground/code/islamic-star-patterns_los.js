// --------------------------------------------------- //
// CLASSES

class GridManager {
  constructor(mgraphics) {
    this.m           = mgraphics;
    this.width       = mgraphics.size[0];
    this.height      = mgraphics.size[1];
    this.currentGrid = null;
  }

  setGrid(grid) {
    this.currentGrid = grid;
  }

  updateSize(w, h) {
    this.width  = w;
    this.height = h;

    if (this.currentGrid) {
      this.currentGrid.polygons = [];
      this.currentGrid.generate(this.width, this.height);
    }

    m.redraw();
  }

  updateDelta(v) {
    this.currentGrid.config.delta = v;
    m.redraw();
  }

  updateAngle(v) {
    this.currentGrid.config.angle = v;
    m.redraw();
  }

  show() {
    // post(`-`.repeat(50) + "\n");
    this.draw_background();
    if (this.currentGrid) {
      // post("calling show on currentGrid\n");
      this.currentGrid.show();
    }
  }

  draw_background() {
    this.m.set_source_rgba(0.1, 0.1, 0.1, 1);
    this.m.rectangle(0, 0, this.width, this.height);
    this.m.fill();
  }
}

class Grid {
  constructor(config) {
    this.polygons = [];
    this.config   = Object.assign({
      delta : 0,
      angle : 60,
      divisions : 10,
    },
    config)
  }

  generate() {
    throw new Error("method generate() should be called in a sub-class of Grid.");
  };

  show() {
    // post("begin show loop\n");
    for (let polygon of this.polygons) {
      polygon.hankin(this.config.delta, this.config.angle)
      polygon.show();
    }
    // post();
  };
}

class SquareGrid extends Grid {

  generate(width, height) {
    let inc_x = width / this.config.divisions;
    let inc_y = height / this.config.divisions;

    for (let x = 0; x < width; x += inc_x) {
      for (let y = 0; y < height; y += inc_y) {
        let polygon = new Polygon(4);

        polygon.addVertex(x, y);
        polygon.addVertex(x + inc_x, y);
        polygon.addVertex(x + inc_x, y + inc_y);
        polygon.addVertex(x, y + inc_y);
        polygon.draw_last_edge();

        this.polygons.push(polygon);
      }
    }
  }
}

class Polygon {
  constructor(sides) {
    this.interior_angle = ((sides - 2) * Math.PI) / sides;
    this.vertices       = [];
    this.edges          = [];
    this.sides          = sides;
  }

  /**
   * @param {number} x
   * @param {number} y
   */
  addVertex(x, y) {
    const vector = new Vector2D(x, y);
    let total    = this.vertices.length;

    if (total > 0) {
      let prev_vector = this.vertices[total - 1];
      let edge        = new Edge(prev_vector, vector);
      this.edges.push(edge);
    }

    this.vertices.push(vector)
  }

  draw_last_edge() {
    if (this.edges.length > 1) {
      let first = this.vertices[0];
      let last  = this.vertices.at(-1);
      let edge  = new Edge(last, first);
      this.edges.push(edge);
    }
  }

  show() {
    // post("showing polygon\n");
    for (let edge of this.edges) {
      edge.show();
    }
  }

  hankin(delta, angle) {
    // post("calculate hankins\n");
    for (let edge of this.edges) {
      edge.sidesOfParent = this.sides;
      edge.hankin(delta, angle, this.interior_angle);
    }
  }
}

class Edge {
  constructor(a, b) {
    this.a = a;
    this.b = b;
    this.h1;
    this.h2;
    this.sidesOfParent;
  }

  show() {
    // post("showing edge\n");

    // Draw grid
    // m.set_source_rgba(1, 1, 1, 0.2);
    // m.move_to(this.a.x, this.a.y);
    // m.line_to(this.b.x, this.b.y);
    // m.stroke();

    this.h1.show();
    this.h2.show();
  }

  hankin(delta, angle, interior_angle) {
    // post("calculate hankin\n");

    let mid = (Vector2D.add(this.a, this.b));
    mid.mult(0.5);

    // Draw mid points
    //
    // m.set_source_rgba(0, 1, 0, 1);
    // m.arc(mid.x, mid.y, 3, 0, degToRad(360))
    // m.fill();

    let v1 = Vector2D.sub(this.a, mid);
    let v2 = Vector2D.sub(this.b, mid);

    let half_length = v1.mag();

    let offset1 = mid;
    let offset2 = mid;

    if (delta != 0) {
      v1.setMag(delta);
      v2.setMag(delta);
      offset1 = Vector2D.add(mid, v2);
      offset2 = Vector2D.add(mid, v1);
    }

    v1.norm();
    v2.norm();

    v1.rot(deg_to_rad(-angle));
    v2.rot(deg_to_rad(angle));

    // Law of sines !

    let alpha = interior_angle * 0.5;
    let beta  = Math.PI - alpha - deg_to_rad(angle);

    // Avoid singularity at 135 degrees
    if (Math.abs(beta) > 0.000001) {
      let length = Math.sin(alpha) * ((half_length + delta) / Math.sin(beta));

      v1.setMag(length);
      v2.setMag(length);

      this.h1 = new Hankin(offset1, v1);
      this.h2 = new Hankin(offset2, v2);

      // Dessiner et remplir le triangle formé par les deux lignes Hankin et le point central
      // m.new_path();
      // m.move_to(this.h1.a.x, this.h1.a.y);
      // m.line_to(this.h1.b.x, this.h1.b.y);
      // m.line_to(this.h2.b.x, this.h2.b.y);
      // m.close_path();
      //
      // // Couleur de remplissage
      // m.set_source_rgba(0.8, 0.2, 0.2, 0.3); // Rouge semi-transparent
      // m.fill();
    }
  }
}

class Hankin {
  /**
   * @param {Vector2D} a
   * @param {Vector2D} v
   */
  constructor(a, v) {
    this.a = a;
    this.v = v;
    this.b = Vector2D.add(a, v);
  }

  show() {
    // post("showing hankin\n")
    //
    m.set_source_rgba(1, 0, 0, 1);
    m.move_to(this.a.x, this.a.y);
    m.line_to(this.b.x, this.b.y);
    m.stroke();

    // Draw intersection points
    //
    // m.set_source_rgba(1, 1, 0, 1);
    // m.arc(this.b.x, this.b.y, 3, 0, degToRad(360))
    // m.fill();
  }

  toString() {
    return `${this.a, this.b}`
  }
}

class Vector2D {
  /**
   * @param {number} x
   * @param {number} y
   */
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  /*
   * Multiply the Vector by n
   * @param {number} n
   * @returns {Vector2D} The multiplied Vector object
   * */
  mult(n) {
    this.x *= n;
    this.y *= n;
    return this;
  }

  /*
   * Rotate the Vector by an angle (in radians)
   * @param {number} angle
   * @returns {Vector2D} The rotated Vector object
   * */
  rot(angle) {
    let new_x = this.x * Math.cos(angle) - this.y * Math.sin(angle);
    let new_y = this.x * Math.sin(angle) + this.y * Math.cos(angle);

    this.x = new_x;
    this.y = new_y;

    return this;
  }

  /*
   * Normalize the Vector
   * @returns {Vector2D} The normalized Vector object
   * */
  norm() {
    let mag = this.mag();
    if (mag !== 0) {
      this.x = this.x / mag;
      this.y = this.y / mag;
    }
    return this;
  }

  mag() {
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  }

  setMag(mag) {
    this.norm();
    this.mult(mag);
    return this;
  }

  /**
   * String representations of the vector's components x and y
   */
  toString() {
    return `${this.x}, ${this.y}\n`;
  }

  /**
   * @description Add two vectors
   * @param {Vector2D} v1
   * @param {Vector2D} v2
   * @returns {Vector2D} The summed vector as a new Vector2D object
   * */
  static add(v1, v2) {
    return new Vector2D(v1.x + v2.x, v1.y + v2.y);
  }

  /**
   * @description Substract two vectors
   * @param {Vector2D} v1
   * @param {Vector2D} v2
   * @returns {Vector2D} The substracted vector as a new Vector2D object
   * */
  static sub(v1, v2) {
    return new Vector2D(v1.x - v2.x, v1.y - v2.y);
  }

  /**
   * Calculate the distance between two vectors
   * @param {Vector2D} v1
   * @param {Vector2D} v2
   * @returns {number} distance
   */
  static dist(v1, v2) {
    return Math.sqrt(Math.pow(v1.x - v2.x, 2) + Math.pow(v1.y - v2.y, 2));
  }
}

/**
 * Converts degrees to radians
 * @param {number} deg
 * @returns {number} radians
 */
function deg_to_rad(deg) {
  return deg * (Math.PI / 180);
}

// --------------------------------------------------- //
// DRAWING

let m = mgraphics;

m.init();
m.relative_coords = 0;
m.autofill        = 0;

const manager    = new GridManager(m)
const squareGrid = new SquareGrid({divisions : 1});

squareGrid.generate(manager.width, manager.height);
manager.setGrid(squareGrid);

function paint() {
  manager.show();
}

/**
 * Change the delta value from Max
 * @param {number} v
 */
function delta(v) {
  manager.updateDelta(v);
}

/**
 * Change the angle value from Max
 * @param {number} v
 */
function angle(v) {
  manager.updateAngle(v);
}

function onresize(w, h) {
  manager.updateSize(w, h);
}
