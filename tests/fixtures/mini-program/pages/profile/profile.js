Page({
  data: {
    userInfo: null,
  },
  onLoad() {
    const app = getApp()
    this.setData({ userInfo: app.globalData.userInfo })
  },
})
