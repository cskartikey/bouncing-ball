import { VerletPhysics2D } from "toxiclibsjs/physics2d";
import { Rect } from "toxiclibsjs/geom";
import Vec2D from "toxiclibsjs/geom/Vec2D";
import { GravityBehavior } from "toxiclibsjs/physics2d/behaviors";
import VerletParticle2D from "toxiclibsjs/physics2d/VerletParticle2D";
import VerletSpring2D from "toxiclibsjs/physics2d/VerletSpring2D";

class SoftParticle extends VerletParticle2D {
  constructor(p, x, y, r) {
    super(x, y);
    this.p = p;
    this.r = r;
    physics.addParticle(this);
  }

  show() {
    this.p.circle(this.x, this.y, this.r);
  }
}

class Spring extends VerletSpring2D {
  constructor(p, a, b, len, s) {
    super(a, b, len, s);
    this.p = p;
    physics.addSpring(this);
  }

  show() {
    this.p.stroke(4);
    this.p.line(this.a.x, this.a.y, this.b.x, this.b.y);
  }
}

let physics, vector, gravity;
let particles = [];
let springs = [];
let draggedParticle = null;

export default (p) => {
  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    physics = new VerletPhysics2D();

    const bounds = new Rect(0, 0, p.windowWidth, p.windowHeight);
    physics.setWorldBounds(bounds);

    vector = new Vec2D(0, 1);
    gravity = new GravityBehavior(vector);
    physics.addBehavior(gravity);

    physics.setDrag(0.05);

    const numParticles = 15;
    const ellipseWidth = 400;
    const ellipseHeight = 1000;
    const centerX = p.windowWidth / 2;
    const centerY = p.windowHeight / 2;

    for (let i = 0; i < numParticles; i++) {
      const angle = (i / numParticles) * p.TWO_PI;
      const x = centerX + ellipseWidth * Math.cos(angle);
      const y = centerY + ellipseHeight * Math.sin(angle);
      particles.push(new SoftParticle(p, x, y, 10));
    }

    for (let i = 0; i < numParticles; i++) {
      const a = particles[i];
      const b = particles[(i + 1) % numParticles];
      springs.push(new Spring(p, a, b, 50, 0.2));
    }

    for (let i = 0; i < numParticles; i++) {
      const a = particles[i];
      const b = particles[(i + 2) % numParticles];
      springs.push(new Spring(p, a, b, 100, 0.1));
    }
  };

  p.draw = () => {
    p.background(200);
    physics.update();

    p.fill("#FF204E");
    p.beginShape();
    for (let particle of particles) {
      p.vertex(particle.x, particle.y);
      // particle.show()
    }
    p.endShape(p.CLOSE);
    //   for (let spring of springs){
    //     spring.show()
    // }
    if (draggedParticle) {
      draggedParticle.lock();
      draggedParticle.set(p.mouseX, p.mouseY);
      draggedParticle.unlock();
    }
  };

  p.mousePressed = () => {
    draggedParticle = getNearestParticle(p.mouseX, p.mouseY);
  };

  p.mouseReleased = () => {
    draggedParticle = null;
  };

  const getNearestParticle = (x, y) => {
    let nearest = null;
    let minDist = Infinity;
    for (let particle of particles) {
      const d = p.dist(x, y, particle.x, particle.y);
      if (d < minDist) {
        minDist = d;
        nearest = particle;
      }
    }
    return nearest;
  };
};
