import MoveableItem from "./MoveableItem.js";
export default class Ghost extends MoveableItem {
  constructor({ ctx, level, startingX, startingY, pac }) {
    super({ ctx, level });
    this.pac = pac;
    this.x = startingX;
    this.y = startingY;
    this.pac = pac;
    this.startingX = startingX;
    this.startingY = startingY;
    this.removed = false;
    this.avatarUrl = `/static/images/mon_${Math.ceil(Math.random() * 3)}.jpg`;
  }

  init() {
    this.startingX = this.x;
    this.startingY = this.y;
  }
  restart() {
    this.x = this.startingX;
    this.y = this.startingY;
    this.frameCycle = 0;
    this.direction = "stopped";
  }
  draw() {
    let x = this.x;
    let y = this.y;
    this.drawPicture(x, y, this.avatarUrl, this.direction);
    // let radiusDivisor = 2;
    // this.drawCircle(x, y, radiusDivisor, this.direction, "#F55");
  }
  changeDirection() {
    let directions = ["left", "right", "up", "down"];
    let directionWeights = directions.map(d =>
      this.chanceOfPacmanIfInDirection(d)
    );

    let bestDirection = this.getRandomItem(directions, directionWeights);
    this.direction = bestDirection;
  }

  chanceOfPacmanIfInDirection(direction) {
    if (this.pathBlockedInDirection(direction)) {
      return 0;
    } else {
      let desirabilityOfDirection =
        (this.pac.y - this.y) * this.directions[direction].y +
        (this.pac.x - this.x) * this.directions[direction].x;
      if (this.pac.powerMode) {
        desirabilityOfDirection *= -1;
      }
      return Math.max(desirabilityOfDirection, 0) + 0.2;
    }
  }

  retreat() {
    this.removed = true;
    this.frameCycle = 0;
    this.x = this.level.ghostRetreat.x;
    this.y = this.level.ghostRetreat.y;
  }

  getRandomItem(list, weight) {
    var total_weight = weight.reduce(function(prev, cur, i, arr) {
      return prev + cur;
    });

    var random_num = Math.random() * total_weight;
    var weight_num = 0;

    for (var i = 0; i < list.length; i++) {
      weight_num += weight[i];
      weight_num = Number(weight_num.toFixed(2));

      if (random_num < weight_num) {
        return list[i];
      }
    }
  }
}
