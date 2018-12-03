export default {
  layout: [
    [1, 1, 1, 2, 1, 1, 1, 1, 1],
    [1, 2, 2, 2, 2, 2, 2, 1, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 2, 1, 1, 1, 2, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 1, 2, 1, 2, 1, 2, 1],
    [1, 3, 2, 2, 2, 2, 2, 2, 1],
    [1, 1, 1, 2, 1, 1, 1, 1, 1]
  ],
  grid: [
    [1, 1, 1, 2, 1, 1, 1, 1, 1],
    [1, 2, 2, 2, 2, 2, 2, 1, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 2, 1, 1, 1, 2, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 1, 2, 1, 2, 1, 2, 1],
    [1, 3, 2, 2, 2, 2, 2, 2, 1],
    [1, 1, 1, 2, 1, 1, 1, 1, 1]
  ],
  startingPac: {
    x: 1,
    y: 1
  },
  startingGhosts: [
    {
      x: 6,
      y: 6
    },
    {
      x: 5,
      y: 1
    }
  ],
  ghostRetreat: {
    x: 4,
    y: 3
  },
  teleport: true,

  get squareSize() {
    return wx.getSystemInfoSync().screenWidth / this.width;
  },
  get width() {
    return this.grid[0].length;
  },
  get height() {
    return this.grid.length;
  },
  get pixelWidth() {
    return wx.getSystemInfoSync().screenWidth;
  },
  get pixelHeight() {
    return wx.getSystemInfoSync().screenWidth;
  },

  isComplete() {
    let hasPelletsLeft = false;
    let grid = this.grid;

    grid.forEach(row => {
      row.forEach(cell => {
        if (cell === 2) {
          hasPelletsLeft = true;
        }
      });
    });
    return !hasPelletsLeft;
  },

  restart() {
    this.grid = this.layout;
  }
};
