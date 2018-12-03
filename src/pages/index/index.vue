<template>
  <div class="container">
    <!-- <button v-if="!hasWxAuth" open-type="getUserInfo" @getuserinfo="handleUserInfo">登录</button> -->
    <!-- <div class="playground" v-if="hasWxAuth">
      <div
        class="player"
        v-for="player in players"
        v-bind:style="{ left: player.left+'vw', top: player.top+'vw' }"
        :key="player.left"
      >
        <img class="player-avatar" v-bind:src="player.avatarUrl">
        <div class="player-nickname">{{player.nickName}}</div>
      </div>
    </div>
    <div
      class="Container"
      v-for="player in players"
      :key="player.left"
      v-if="player.avatarUrl == userInfo.avatarUrl"
    >
      <div class="CombatMessages">{{player.combatMessage}}</div>
      <div class="Attrbutes">HP:{{player.HP}} ATK:{{player.ATK}} DEF:{{player.DEF}}</div>
    </div>-->
    <pacman></pacman>
    <div class="controller">
      <div class="panel">
        <div class="dpad-container">
          <div class="dpad-backdrop"></div>
          <div class="dpad dpad-up" @click="emitTapEvent('up')">
            <div class="arrow-up"></div>
            <div class="arrow-up2"></div>
          </div>
          <div class="dpad dpad-right" @click="emitTapEvent('right')">
            <div class="arrow-right2"></div>
            <div class="arrow-right"></div>
          </div>
          <div class="dpad dpad-down" @click="emitTapEvent('down')">
            <div class="arrow-down2"></div>
            <div class="arrow-down"></div>
          </div>
          <div class="dpad dpad-left" @click="emitTapEvent('left')">
            <div class="arrow-left"></div>
            <div class="arrow-left2"></div>
          </div>
          <div class="dpad dpad-center"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import card from "@/components/card";
import pacman from "@/components/pacman";
import { EventBus } from "@/models/event-bus";

export default {
  data() {
    return {
      motto: "Hello World",
      userInfo: {},
      hasWxAuth: false,
      players: [],
      ws: {
        open: false
      }
    };
  },

  components: {
    card,
    pacman
  },
  onHide() {
    EventBus.$emit("pageChange", "hide");
  },
  onShow() {
    EventBus.$emit("pageChange", "show");
  },
  methods: {
    emitTapEvent(direction) {
      EventBus.$emit("padTapped", direction);
    },
    move(direction) {
      let player = this.players.find(
        player => player.avatarUrl == this.userInfo.avatarUrl
      );
      switch (direction) {
        case "up":
          player.top -= 10;
          if (player.top < 0) {
            player.top = 0;
          }
          break;
        case "down":
          player.top += 10;
          if (player.top > 90) {
            player.top = 90;
          }
          break;
        case "left":
          player.left -= 10;
          if (player.left < 0) {
            player.left = 0;
          }
          break;
        case "right":
          player.left += 10;
          if (player.left > 90) {
            player.left = 90;
          }
          break;
        default:
          break;
      }
      wx.sendSocketMessage({
        data: JSON.stringify({
          type: "move",
          data: { user: this.userInfo, direction: direction }
        }),
        fail: () => {
          this.openSocket();
        }
      });
    },

    handleUserInfo({
      mp: {
        detail: { encryptedData, iv, userInfo }
      }
    }) {
      if (userInfo) {
        this.openSocket().then(() => {
          this.login(userInfo);
        });
      }
    },
    openSocket() {
      return new Promise((resolve, reject) => {
        wx.connectSocket({
          url: "wss://archeryscorecalculator.com/wss",
          // url: "ws://localhost:8080",
          data: {
            x: "",
            y: ""
          },
          header: {
            "content-type": "application/json"
          },
          protocols: ["protocol1"],
          method: "GET"
        });
        wx.onSocketOpen(res => {
          this.ws.open = true;
          resolve();
          console.log("WebSocket连接已打开！");
        });
        wx.onSocketError(function(res) {
          reject();
          console.log("WebSocket连接打开失败，请检查！");
        });
        wx.onSocketMessage(this.handleMessage);
        wx.onSocketClose(() => {
          this.openSocket();
        });
      });
    },
    handleMessage(res) {
      // console.log("收到服务器内容：" + res.data);
      let changedPlayers = JSON.parse(res.data);
      let playersMap = this.players.reduce((map, next) => {
        map[next.avatarUrl] = next;
        return map;
      }, {});
      changedPlayers.forEach(changedPlayer => {
        if (playersMap[changedPlayer.avatarUrl]) {
          for (let property in playersMap[changedPlayer.avatarUrl]) {
            playersMap[changedPlayer.avatarUrl][property] =
              changedPlayer[property];
          }
        } else {
          this.players.push(changedPlayer);
        }
      });
    },
    async init() {
      this.hasWxAuth = await this.checkWxAuth();
      if (this.hasWxAuth) {
        let code = await this.getWxcode();
        let { encryptedData, iv, userInfo } = await this.getUserInfo();
        console.log(userInfo);
        await this.openSocket();
        let { user } = await this.login(userInfo);
        this.currentUser = user;
      }
    },
    login(userInfo) {
      return new Promise(async resolve => {
        this.hasWxAuth = true;
        this.userInfo = userInfo;
        wx.sendSocketMessage({
          data: JSON.stringify({ type: "login", data: userInfo }),
          success: resolve
        });
      });
    },
    getWxcode() {
      return new Promise(resolve => {
        wx.login({
          success: res => {
            if (res.code) {
              resolve(res.code);
            } else {
              console.log("登录失败！" + res.errMsg);
            }
          }
        });
      });
    },
    getUserInfo() {
      return new Promise(resolve => {
        wx.getUserInfo({
          lang: "zh_CN",
          success: res => {
            resolve(res);
          }
        });
      });
    },
    checkWxAuth() {
      return new Promise(resolve => {
        wx.getSetting({
          success: res => {
            resolve(res.authSetting["scope.userInfo"]);
          }
        });
      });
    }
  },

  onShareAppMessage: function(res) {
    if (res.from === "button") {
      // 来自页面内转发按钮
      console.log(res.target);
    }
    return {
      title: "PACMAN",
      path: "/pages/index/main"
    };
  },
  created() {
    // 调用应用实例的方法获取全局数据
    this.init();
  }
};
</script>

<style scoped>
.playground {
  height: 100vw;
  width: 100vw;
  position: relative;
}
.buttons {
  height: 20vh;
  width: 100vw;
  display: grid;
  grid-template-columns: 33% 33% 33%;
}
.buttons-button {
  line-height: 18px;
  padding-top: 28rpx;
  padding-bottom: 28rpx;
  border-radius: 50%;
  margin: auto;
}
.player {
  position: absolute;
}
.player-avatar {
  width: 10vw;
  height: 10vw;
  border-radius: 50%;
}
.player-nickname {
  width: 10vw;
  font-size: 13px;
  text-align: center;
}
.controller {
  height: calc((95vh - 100vw) / 0.7);
  position: absolute;
  width: calc(100vw / 0.7);
  transform: scale(0.7);
  transform-origin: 0 0;
}

.panel {
  background: #2b3334;
  height: 100%;
  position: relative;
  width: 100%;
}

/* D-PAD */

.dpad-container {
  bottom: 40px;
  height: 200px;
  left: 40px;
  position: absolute;
  width: 200px;
}

.dpad-backdrop {
  background: #cfd8dc;
  border-radius: 10px;
  height: 200px;
  margin: 0 auto;
  position: relative;
  width: 80px;
}

.dpad-backdrop::after {
  background: #cfd8dc;
  border-radius: 10px;
  content: "";
  display: block;
  height: 80px;
  left: -60px;
  position: absolute;
  top: 60px;
  width: 200px;
}

.dpad {
  background: #202020;
  box-shadow: 0 1px 10px #37474f;
  height: 60px;
  position: absolute;
  width: 60px;
}

.dpad-up {
  border-radius: 5px 5px 0 0;
  bottom: 130px;
  left: 70px;
}

.dpad-right {
  border-radius: 0 5px 5px 0;
  bottom: 70px;
  left: 130px;
}

.dpad-down {
  border-radius: 0 0 5px 5px;
  bottom: 10px;
  left: 70px;
}

.dpad-left {
  border-radius: 5px 0 0 5px;
  bottom: 70px;
  left: 10px;
}

.dpad-center {
  border: #202020 1px solid;
  border-radius: 1px;
  bottom: 69px;
  box-shadow: none;
  left: 69px;
}

/* D-PAD arrows */

.arrow-up {
  border-bottom: 24px solid #455a64;
  border-left: 24px solid transparent;
  border-right: 24px solid transparent;
  height: 0;
  margin: 20px auto 0;
  width: 0;
}

.arrow-up2 {
  background: #455a64;
  height: 12px;
  margin: -2px auto 0;
  width: 24px;
}

.arrow-right {
  border-bottom: 24px solid transparent;
  border-left: 24px solid #455a64;
  border-top: 24px solid transparent;
  height: 0;
  left: 16px;
  position: absolute;
  top: 6px;
  width: 0;
}

.arrow-right2 {
  background: #455a64;
  height: 24px;
  margin: 18px 0 0 6px;
  width: 12px;
}

.arrow-down {
  border-left: 24px solid transparent;
  border-right: 24px solid transparent;
  border-top: 24px solid #455a64;
  height: 0;
  margin: 0 auto;
  width: 0;
}

.arrow-down2 {
  background: #455a64;
  height: 12px;
  margin: 6px auto -2px;
  width: 24px;
}

.arrow-left {
  border-bottom: 24px solid transparent;
  border-right: 24px solid #455a64;
  border-top: 24px solid transparent;
  height: 0;
  margin: 6px 0 0 20px;
  width: 0;
}

.arrow-left2 {
  background: #455a64;
  height: 24px;
  margin: 0 auto;
  position: absolute;
  right: 6px;
  top: 18px;
  width: 12px;
}

/* Active arrows */

.dpad:active {
  background-color: #303030;
}

.dpad:active .arrow-up {
  border-bottom-color: #ffeb3b;
}

.dpad:active .arrow-up2 {
  background-color: #ffeb3b;
}

.dpad:active .arrow-right {
  border-left-color: #ffeb3b;
}

.dpad:active .arrow-right2 {
  background-color: #ffeb3b;
}

.dpad:active .arrow-down {
  border-top-color: #ffeb3b;
}

.dpad:active .arrow-down2 {
  background-color: #ffeb3b;
}

.dpad:active .arrow-left {
  border-right-color: #ffeb3b;
}

.dpad:active .arrow-left2 {
  background-color: #ffeb3b;
}

/* Buttons */

.buttons-container {
  bottom: 40px;
  height: 200px;
  right: 40px;
  position: absolute;
  width: 160px;
}

.button-backdrop {
  background: #cfd8dc;
  border-radius: 5px;
  height: 60px;
  position: relative;
  width: 60px;
}

.button-backdrop + .button-backdrop {
  margin-top: 10px;
}

.button {
  background: #202020;
  border-radius: 50px;
  box-shadow: 0 1px 10px #37474f;
  height: 50px;
  left: 5px;
  position: absolute;
  top: 5px;
  width: 50px;
}

.button:active {
  background-color: #303030;
}

.icon {
  display: inline-block;
  fill: #f4ff81;
  height: 30px;
  width: 30px;
}

.button .icon {
  padding: 10px 0 0 10px;
}

.button:active .icon {
  fill: #eeff41;
}
</style>
