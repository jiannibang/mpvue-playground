export default class AnimationItem {
  constructor({ ctx, level }) {
    this.ctx = ctx;
    this.level = level;
    this.frameCycle = 1;
    this.framesPerMovement = 20;
    this.directions = {
      up: { x: 0, y: -1 },
      down: { x: 0, y: 1 },
      left: { x: -1, y: 0 },
      right: { x: 1, y: 0 },
      stopped: { x: 0, y: 0 }
    };
  }
  drawPicture(x, y, src, direction) {
    let squareSize = this.level.squareSize;
    let pixelX = (x + this.offsetFor("x", direction)) * squareSize;
    let pixelY = (y + this.offsetFor("y", direction)) * squareSize;
    var img = new Image();
    img.src = src;
    this.ctx.drawImage(img, pixelX, pixelY, squareSize, squareSize);
  }
  drawCircle(x, y, radiusDivisor, direction, color = "#000") {
    let squareSize = this.level.squareSize;
    let pixelX = (x + 1 / 2 + this.offsetFor("x", direction)) * squareSize;
    let pixelY = (y + 1 / 2 + this.offsetFor("y", direction)) * squareSize;
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(
      pixelX,
      pixelY,
      squareSize / radiusDivisor,
      0,
      Math.PI * 2,
      false
    );
    this.ctx.closePath();
    this.ctx.fill();
  }
  offsetFor(coordinate, direction) {
    let frameRatio = this.frameCycle / this.framesPerMovement;
    return this.directions[direction][coordinate] * frameRatio;
  }
}
