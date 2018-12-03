import AnimationItem from "./AnimationItem.js";
export default class MoveableItem extends AnimationItem {
  constructor({ level, ctx }) {
    super({ level, ctx });
    this.x = null;
    this.y = null;
    this.direction = "stopped";
  }

  move() {
    if (this.animationCompleted()) {
      this.finalizeMove();
      this.changeDirection();
    } else if (this.direction === "stopped") {
      this.changeDirection();
    } else {
      this.frameCycle++;
    }
    if (this.removed) {
      // do nothing, it's gone
    } else if (this.animationCompleted()) {
      //...
    }
  }

  animationCompleted() {
    return this.frameCycle === this.framesPerMovement;
  }

  finalizeMove() {
    let direction = this.direction;
    this.x = this.nextCoordinate("x", direction);
    this.y = this.nextCoordinate("y", direction);

    this.frameCycle = 1;
  }

  pathBlockedInDirection(direction) {
    let cellTypeInDirection = this.cellTypeInDirection(direction);
    return !cellTypeInDirection || cellTypeInDirection === 1;
  }

  cellTypeInDirection(direction) {
    let nextX = this.nextCoordinate("x", direction);
    let nextY = this.nextCoordinate("y", direction);
    return this.level.grid[nextY][nextX];
  }

  nextCoordinate(coordinate, direction) {
    let next = this[coordinate] + this.directions[direction][coordinate];
    if (this.level.teleport) {
      if (direction == "up" || direction == "down") {
        return this.modulo(next, this.level.height);
      } else {
        return this.modulo(next, this.level.width);
      }
    } else {
      return next;
    }
  }

  modulo(num, mod) {
    return (num + mod) % mod;
  }
}
