const canvas = document.getElementById("points-canvas");
const ctx = canvas.getContext("2d");

const points = [];

const mouse = {
  x: null,
  y: null,
};

const spacing = 70;
const randomOffset = 22;
const interactionRadius = 180;
const connectionDistance = 105;

/*
  Cuanto más cerca de 1, más tarda en desaparecer.
  0.99 dura más.
  0.97 desaparece más rápido.
*/
const fadeSpeed = 0.985;

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const pixelRatio = window.devicePixelRatio || 1;

  canvas.width = rect.width * pixelRatio;
  canvas.height = rect.height * pixelRatio;

  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

  createPoints(rect.width, rect.height);
}

function createPoints(width, height) {
  points.length = 0;

  for (let y = spacing / 2; y < height; y += spacing) {
    for (let x = spacing / 2; x < width; x += spacing) {
      points.push({
        x: x + randomRange(-randomOffset, randomOffset),
        y: y + randomRange(-randomOffset, randomOffset),
        energy: 0,
      });
    }
  }
}

function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

function updatePointEnergy(point) {
  if (mouse.x !== null && mouse.y !== null) {
    const distanceToMouse = getDistance(
      point.x,
      point.y,
      mouse.x,
      mouse.y
    );

    if (distanceToMouse < interactionRadius) {
      const force = 1 - distanceToMouse / interactionRadius;

      /*
        Solo aumenta la energía si la nueva intensidad
        es mayor que la que ya tenía.
      */
      point.energy = Math.max(point.energy, force);
    }
  }

  /*
    La energía disminuye poco a poco.
  */
  point.energy *= fadeSpeed;

  if (point.energy < 0.001) {
    point.energy = 0;
  }
}

function drawPoint(point) {
  const radius = 1 + point.energy * 2.2;
  const opacity = 0.12 + point.energy * 0.45;

  ctx.beginPath();
  ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(20, 20, 20, ${opacity})`;
  ctx.fill();
}

function drawConnections() {
  for (let i = 0; i < points.length; i++) {
    const pointA = points[i];

    if (pointA.energy <= 0.01) {
      continue;
    }

    for (let j = i + 1; j < points.length; j++) {
      const pointB = points[j];

      if (pointB.energy <= 0.01) {
        continue;
      }

      const distanceBetweenPoints = getDistance(
        pointA.x,
        pointA.y,
        pointB.x,
        pointB.y
      );

      if (distanceBetweenPoints < connectionDistance) {
        const energy = Math.min(
          pointA.energy,
          pointB.energy
        );

        const opacity = energy * 0.22;

        ctx.beginPath();
        ctx.moveTo(pointA.x, pointA.y);
        ctx.lineTo(pointB.x, pointB.y);
        ctx.strokeStyle = `rgba(20, 20, 20, ${opacity})`;
        ctx.lineWidth = 0.7;
        ctx.stroke();
      }
    }
  }
}

function animate() {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  ctx.clearRect(0, 0, width, height);

  for (const point of points) {
    updatePointEnergy(point);
  }

  drawConnections();

  for (const point of points) {
    drawPoint(point);
  }

  requestAnimationFrame(animate);
}

function getDistance(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;

  return Math.sqrt(dx * dx + dy * dy);
}

window.addEventListener("mousemove", function (event) {
  const rect = canvas.getBoundingClientRect();

  const isInsideCanvas =
    event.clientX >= rect.left &&
    event.clientX <= rect.right &&
    event.clientY >= rect.top &&
    event.clientY <= rect.bottom;

  if (isInsideCanvas) {
    mouse.x = event.clientX - rect.left;
    mouse.y = event.clientY - rect.top;
  } else {
    mouse.x = null;
    mouse.y = null;
  }
});

window.addEventListener("mouseleave", function () {
  mouse.x = null;
  mouse.y = null;
});

window.addEventListener("resize", resizeCanvas);

resizeCanvas();
animate();