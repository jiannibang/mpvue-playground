<template>
  <div class="container" @click="clickHandle('test click', $event)">
    <button v-if="!hasWxAuth" open-type="getUserInfo" bindgetuserinfo="handleUserInfo">登录</button> 
    <div class="playground"></div>
    <div class="buttons">
      <div></div>
      <button class="buttons-button" v-on:click="move('top')">上</button>
      <div></div>
      <button class="buttons-button" v-on:click="move('left')">左</button>
      <button class="buttons-button" v-on:click="move('down')">下</button>
      <button class="buttons-button" v-on:click="move('right')">右</button>
    </div>
  </div>
</template>

<script>
import card from "@/components/card";

export default {
  data() {
    return {
      motto: "Hello World",
      userInfo: {},
      hasWxAuth: false
    };
  },

  components: {
    card
  },

  methods: {
    move(direction) {},

    async handleUserInfo({ detail: { encryptedData, iv, userInfo } }) {
      if (userInfo) {
        await this.openSocket();
        await this.login(userInfo);
      }
    },
    openSocket() {
      return new Promise((resolve, reject) => {
        wx.connectSocket({
          url: "wss://archeryscorecalculator.com/wss",
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
        wx.onSocketOpen(function(res) {
          resolve();
          console.log("WebSocket连接已打开！");
        });
        wx.onSocketError(function(res) {
          reject();
          console.log("WebSocket连接打开失败，请检查！");
        });
        wx.onSocketMessage(this.handleMessage);
      });
    },
    handleMessage(res) {
      console.log("收到服务器内容：" + res.data);
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
        wx.sendSocketMessage({
          data: JSON.stringify(userInfo),
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

  created() {
    // 调用应用实例的方法获取全局数据
    this.init();
  }
};
</script>

<style scoped>
.playground {
  height: 80vh;
  width: 100vw;
  background: #f5f7f8;
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
</style>
