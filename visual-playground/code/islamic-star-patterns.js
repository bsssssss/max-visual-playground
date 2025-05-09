let m = mgraphics;

m.init();
m.relative_coords = 0;
m.autofill        = 0;

// --------------------------------------------------- //

class Polygon {
  constructor() {
    this.vertices = [];
    this.edges    = [];
  }

  /**
   * @param {number} x
   * @param {number} y
   */
  addVertex(x, y) {
    const vector = new Vector2D(x, y);
    let   total  = this.vertices.length;

    if (total > 0) {
      let prev_vector = this.vertices[total - 1];
      let edge        = new Edge(prev_vector, vector);
      this.edges.push(edge);
    }

    this.vertices.push(vector)
  }

  close() {
    if (this.edges.length > 1) {
      let first = this.vertices[0];
      let last  = this.vertices.at(-1);
      let edge  = new Edge(last, first);
      this.edges.push(edge);
    }
  }

  show() {
    for (let edge of this.edges) {
      edge.show();
    }
  }

  hankin(delta, angle) {
    for (let edge of this.edges) {
      edge.hankin(delta, angle);
    }

    for (let i = 0; i < this.edges.length; i++) {
      for (let j = 0; j < this.edges.length; j++) {
        if (i != j) {
          this.edges[i].find_intersections(this.edges[j]);
        }
      }
    }
  }
}

class Edge {
  constructor(a, b) {
    this.a = a;
    this.b = b;
    this.h1;
    this.h2;
  }

  show() {
    m.set_source_rgba(1, 1, 1, 1);
    m.move_to(this.a.x, this.a.y);
    m.line_to(this.b.x, this.b.y);
    m.stroke();

    this.h1.show();
    this.h2.show();
  }

  hankin(delta, angle) {
    // let delta = 10;
    let mid = (Vector2D.add(this.a, this.b));
    mid.mult(0.5);

    m.set_source_rgba(0, 1, 0, 1);
    m.arc(mid.x, mid.y, 3, 0, degToRad(360))
    m.fill();

    let v1 = Vector2D.sub(this.a, mid);
    let v2 = Vector2D.sub(this.b, mid);

    let offset1 = mid;
    let offset2 = mid;

    if (delta > 0) {
      v1.setMag(delta);
      v2.setMag(delta);

      offset1 = Vector2D.add(mid, v2);
      offset2 = Vector2D.add(mid, v1);
    }

    v1.norm();
    v2.norm();

    v1.rot(degToRad(-angle));
    v2.rot(degToRad(angle));

    // Law of sines !

    this.h1 = new Hankin(offset1, v1);
    this.h2 = new Hankin(offset2, v2);
  }

  /**
   * @param {Edge} edge
   */
  find_intersections(edge) {
    this.h1.find_intersection(edge.h1);
    this.h1.find_intersection(edge.h2);
    this.h2.find_intersection(edge.h1);
    this.h2.find_intersection(edge.h2);
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
    this.intersection;
    this.prev_distance;
  }

  /**
   * @param {Hankin} h
   */
  find_intersection(h) {
    // this.a   -> P1,
    // this.v   -> (P2 - P1)
    // hankin.a -> P3
    // hankin.v -> (P4 - P3)

    let denom = (h.v.y * this.v.x) - (h.v.x * this.v.y);

    let num_a = (h.v.x * (this.a.y - h.a.y)) - (h.v.y * (this.a.x - h.a.x));
    let num_b = (this.v.x * (this.a.y - h.a.y)) - (this.v.y * (this.a.x - h.a.x));

    let ua = num_a / denom;
    let ub = num_b / denom;

    let x = this.a.x + (ua * this.v.x);
    let y = this.a.y + (ua * this.v.y);

    if (ua > 0 && ub > 0) {
      let candidate = new Vector2D(x, y);

      let d1   = Vector2D.dist(candidate, this.a);
      let d2   = Vector2D.dist(candidate, h.a);
      let dist = d1 + d2;

      let diff = Math.abs(d1 - d2);

      if (diff < 0.00001) {
        if (!this.intersection) {
          this.prev_distance = dist;
          this.intersection  = candidate;
        }
        else if (dist < this.prev_distance) {
          this.prev_distance = dist;
          this.intersection  = candidate;
        }
      }
    }
  }

  show() {
    if (this.intersection) {
      m.set_source_rgba(1, 0, 0, 1);
      m.save();

      m.move_to(this.a.x, this.a.y);
      m.line_to(this.intersection.x, this.intersection.y);
      m.stroke();

      m.restore(); // retourne a l'etat avant le rotate

      m.set_source_rgba(1, 1, 0, 1);
      m.arc(this.intersection.x, this.intersection.y, 3, 0, degToRad(360))
      m.fill();
    }
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
    let denom = Math.sqrt(this.x ** 2 + this.y ** 2);
    if (denom !== 0) {
      this.x = this.x / denom;
      this.y = this.y / denom;
    }
    return this;
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
function degToRad(deg) {
  return deg * (Math.PI / 180);
}

// --------------------------------------------------- //

let delta_ = 10;
let angle_ = 60;

function paint() {
  let width  = m.size[0];
  let height = m.size[1];

  background(width, height);
  draw_poly();
}

function draw_poly() {
  let poly = new Polygon();

  poly.addVertex(50, 50);
  poly.addVertex(400, 50);
  poly.addVertex(400, 400);
  poly.addVertex(50, 400);
  poly.close();
  poly.hankin(delta_, angle_);
  poly.show();
}

function delta(d) {
  if (d >= 0) {
    delta_ = d;
    m.redraw();
  }
}

function angle(a) {
  if (a > 0) {
    angle_ = a;
    m.redraw();
  }
}

function background(w, h) {
  m.set_source_rgba(0.1, 0.1, 0.1, 1);
  m.rectangle(0, 0, w, h);
  m.fill();
}
