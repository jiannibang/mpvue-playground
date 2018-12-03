const state = {
  level: null,
  showModal: false
};

// getters
const getters = {
  cards: state => {
    return state.list.length;
  },
  showBreakLevelModal(state) {
    return state.showModal;
  },
  oldestCardId: state => {
    return state.list[0].id;
  }
};

// actions
const actions = {
  getCards({ commit }) {
    wx.showLoading();
    api.fly
      .get(`/jyx-learning-service/api/v1.0/cards?status=unused`)
      .then(({ data: { cards } }) => {
        wx.hideLoading();
        commit(types.GET_CARDS, { cards: cards });
      })
      .catch(() => {
        wx.hideLoading();
        wx.showModal({ title: "请求失败", content: "获取复活卡列表失败" });
      });
  },

  postCard({ commit }, body) {
    return new Promise(resolve => {
      wx.showLoading();
      api.fly
        .post(`/jyx-learning-service/api/v1.0/cards`, body)
        .then(({ data }) => {
          wx.hideLoading();
          commit(types.POST_CARD, { newCard: data });
          resolve(data);
        })
        .catch(() => {
          wx.hideLoading();
          wx.showModal({ title: "请求失败", content: "新增复活卡失败" });
        });
    });
  },
  closeBreakLevelModal({ commit }) {
    commit(types.CLOSE_BREAK_LEVEL_MODAL);
  }
};

// mutations
const mutations = {
  [types.GET_CARDS](state, { cards }) {
    state.list = cards;
  },
  [types.POST_CARD](state, { newCard }) {
    state.list.push(newCard);
    state.showModal = true;
  },
  [types.CLOSE_BREAK_LEVEL_MODAL](state) {
    state.showModal = false;
  },
  [types.USE_CARD](state) {
    state.list.shift();
  }
};

export default {
  // namespaced: true,
  state,
  getters,
  actions,
  mutations
};
