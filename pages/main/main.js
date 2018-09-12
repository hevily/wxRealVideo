var config = require('../../config');
var rtcroom = require('../../utils/webrtcroom.js');
var app = getApp();

/////////////////////////////////////////////////////
// pages/main/main.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    canShow: 0,
    canIUse: wx.canIUse('button.open-type.getPhoneNumber'),
    tapTime: '',		// 防止两次点击操作间隔太快
    openid: '',
    entryInfos: [
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("onLoad");
  },

  onShow: function() {
    setTimeout(() => {
      wx.navigateTo({
        url: '../sigin/sigin',
      });
    }, 1000);
  },

  getPhoneNumber: function (e) {
    console.log(e.detail.errMsg)
    console.log(e.detail.iv)
    console.log(e.detail.encryptedData)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    console.log("onReady");
    if(!wx.createLivePlayerContext) {
      setTimeout(function(){
        wx.showModal({
          title: '提示',
          content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后再试。',
          showCancel: false
        });
      },0);
    } else {
      // 版本正确，允许进入
      this.data.canShow = 1;
    }
  },

  bindGetUserInfo: function (e) {
    // wx.navigateTo({
    //   url: '../pdf/pdf',
    // });
    // return;
    // console.log('here');
    // this.startSocket(e.detail.userInfo.openId);

    
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
})