<template>
  <div>
    <canvas style="width:100vw;height:100vw" canvas-id="pacman"></canvas>
    score: {{score}}&nbsp; &nbsp; &nbsp; level: {{levelNumber}}&nbsp; &nbsp; &nbsp; lives： {{lives}}
    <gamepad @tapped="handleTaped"></gamepad>
  </div>
</template>

<script>
import Pac from "@/models/Pac";
import Ghost from "@/models/Ghost";
import AnimationItem from "@/models/AnimationItem";
import level from "@/models/level";
import level2 from "@/models/level2";
import { EventBus } from "@/models/event-bus";

export default {
  data() {
    return {
      lives: 3,
      score: 0,
      levelNumber: 1,
      levels: [],
      pac: null,
      ghosts: [],
      level: null,
      background: null
    };
  },
  computed: {
    ctx() {
      return wx.createCanvasContext("pacman");
    }
  },
  mounted() {
    this.levels = [level, level2];

    this.startNewLevel();
    this.loop();
  },
  methods: {
    loadNewLevel() {
      let levelIndex = (this.levelNumber - 1) % this.levels.length;
      return this.levels[levelIndex];
    },

    startNewLevel() {
      let level = this.loadNewLevel();
      level.restart();
      this.level = level;
      this.background = new AnimationItem({
        ctx: this.ctx,
        level: this.level
      });
      this.pac = new Pac({ ctx: this.ctx, level: this.level });

      this.ghosts = level.startingGhosts.map(
        s =>
          new Ghost({
            startingX: s.x,
            startingY: s.y,
            pac: this.pac,
            ctx: this.ctx,
            level: this.level
          })
      );
    },

    drawWall: function(x, y) {
      let ctx = this.ctx;
      let squareSize = this.level.squareSize;

      ctx.fillStyle = "#000";
      ctx.fillRect(x * squareSize, y * squareSize, squareSize, squareSize);
    },
    drawGrid() {
      let grid = this.level.grid;
      grid.forEach((row, rowIndex) => {
        row.forEach((cell, columnIndex) => {
          if (cell == 1) {
            this.drawWall(columnIndex, rowIndex);
          }
          if (cell == 2) {
            this.drawPellet(columnIndex, rowIndex);
          }
          if (cell == 3) {
            this.drawPowerPellet(columnIndex, rowIndex);
          }
        });
      });
    },
    drawPowerPellet(x, y) {
      let radiusDivisor = 4;
      this.background.drawCircle(x, y, radiusDivisor, "stopped", "red");
    },
    drawPellet(x, y) {
      this.background.drawCircle(x, y, 6, "stopped", "pink");
    },

    clearScreen() {
      let ctx = this.ctx;
      ctx.clearRect(0, 0, this.level.pixelWidth, this.level.pixelHeight);
    },

    loop() {
      this.pac.move();
      this.ghosts.forEach(ghost => {
        ghost.move();
      });

      this.processAnyPellets();

      this.clearScreen();
      this.drawGrid();
      this.pac.draw();
      this.ghosts.forEach(ghost => {
        ghost.draw();
      });

      let ghostCollisions = this.detectGhostCollisions();
      if (ghostCollisions.length > 0) {
        if (this.pac.powerMode) {
          ghostCollisions.forEach(ghost => ghost.retreat());
        } else {
          this.lives--;
          this.restart();
        }
      }
      this.ctx.draw();
      setTimeout(this.loop, 1000 / 60);
    },

    detectGhostCollisions() {
      return this.ghosts.filter(ghost => {
        return this.pac.x == ghost.x && this.pac.y == ghost.y;
      });
    },

    processAnyPellets() {
      let x = this.pac.x;
      let y = this.pac.y;
      let grid = this.level.grid;
      if (grid[y][x] == 2) {
        grid[y][x] = 0;
        this.score++;

        if (this.level.isComplete()) {
          this.levelNumber++;
          this.startNewLevel();
        }
      } else if (grid[y][x] == 3) {
        grid[y][x] = 0;
        this.pac.powerMode = true;
      }
    },

    restart() {
      if (this.lives <= 0) {
        this.score = 0;
        this.lives = 3;
        this.levelNumber = 1;
        this.startNewLevel();
      }
      this.pac.restart(this.level);
      this.ghosts.forEach(ghost => ghost.restart());
    },

    restartLevel: function() {
      this.pac.restart(this.level);
      this.level.restart();
    }
  },
  created() {
    EventBus.$on("padTapped", direction => {
      this.pac.intent = direction;
    });
  }
};
</script>
