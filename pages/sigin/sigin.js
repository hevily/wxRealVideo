// pages/sigin/sigin.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {

    getPhoneNumber: function (e) {
      if (e) {
        var globalData = getApp().globalData;
        globalData.encryptedData = e.detail.encryptedData;
        globalData.iv = e.detail.iv;
      }
      wx.navigateTo({
        url: '../login/login',
      })
    },

    makecall: function() {
      wx.makePhoneCall({
        phoneNumber: '95518'
      });
    },
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
      console.log("onShareAppMessage");
      return {
        title: '中国人保在线视频报案理赔小程序',
        path: '/pages/main/main',
        imageUrl: 'https://jieting.yunmfang.com/picc_share.jpg'
      }
    }
  }
})
