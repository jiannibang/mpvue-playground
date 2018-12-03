import MoveableItem from "./MoveableItem.js";
export default class Pac extends MoveableItem {
  constructor({ ctx, level }) {
    super({ ctx, level });
    this.direction = "down";
    this.intent = "down";
    this.x = this.level.startingPac.x;
    this.y = this.level.startingPac.y;
    this.powerMode = false;
  }

  restart() {
    this.x = this.level.startingPac.x;
    this.y = this.level.startingPac.y;
    this.frameCycle = 0;
    this.direction = "stopped";
  }

  draw() {
    let x = this.x;
    let y = this.y;
    let radiusDivisor = 2;
    let color = this.powerMode ? "#AF0" : "#FE0";
    // if (this.powerMode) {
    //   this.drawPicture(x, y, "/assets/images/pangzia.jpg", this.direction);
    // } else {
    //   this.drawPicture(x, y, "/assets/images/pangzi.jpg", this.direction);
    // }

    this.drawCircle(x, y, radiusDivisor, this.direction, color);
  }

  changeDirection() {
    let intent = this.intent;
    if (this.pathBlockedInDirection(intent)) {
      this.direction = "stopped";
    } else {
      this.direction = intent;
    }
  }
}