<template>
  <div class="container">
    <button v-if="!hasWxAuth" open-type="getUserInfo" @getuserinfo="handleUserInfo">登录</button>
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
  </div>
</template>

<script>
import card from "@/components/card";
import pacman from "@/components/pacman";

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

  methods: {
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
</style>
