var config = require('../../config');
var rtcroom = require('../../utils/webrtcroom.js');

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
    console.log('here');
    // this.startSocket(e.detail.userInfo.openId);
    wx.showLoading({
      title: '正在获取信息',
    })
    const userId = 'user0123456';

    new Promise((resolve, reject) => {
      wx.login({
        success: function (res) {
          console.log(res);
          if (res.code) {
            resolve(res.code);
          } else {
            reject(res.errMsg);
          }
        },
        fail: function (error) {
          console.log(error);
          reject(error);
        }
      });
    }).then((code) => {
      return new Promise((resolve, reject) => {
        wx.request({
          url: config.serverUrl + '/api/wechat/getOpenId',
          data: {
            code: code
          },
          success: (res) => {
            if (res && res.data && res.data.result) {
              this.openid = res.data.result.openid;
              var app = getApp();
              app.globalData.openid = this.openid;
              resolve();
            } else {
              reject('invalid response');
            }
          },
          fail: (error) => {
            reject(error);
          }
        })
      });
    }).then(() => {
      return new Promise((resolve, reject) => {
        wx.request({
          url: config.serverUrl + '/api/live/userSig',
          data: { userId: userId },
          success: function (res) {
            console.log(res.data.result);
            resolve(res.data.result);
          },
          fail: function (error) {
            console.log(error);
            reject(error);
          }
        })
      });
    }).then((info) => {
      console.log(this.openid);
      const options = {
        userID: userId,
        userSig: info.userSig,
        sdkAppID: info.sdkAppId,
        accType: info.accountType,
        roomID: '1521324381',
      }

      getApp().globalData.options = options;
      console.log(options);
    //   return new Promise((resolve, reject) => {
    //     rtcroom.login({
    //       data: options,
    //       success: (res) => {
    //         console.log(res);
    //         resolve();
    //       },
    //       fail: (error) => {
    //         reject(error);
    //       }
    //     });
    //   });
    // }).then(() => {
      wx.hideLoading();
      wx.navigateTo({
        url: '../realstream/realstream',
      });
    }).catch((error) => {
      console.log(error);
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    console.log("onShareAppMessage");
    return {
      title: '腾讯视频云',
      path: '/pages/main/main',
      imageUrl: 'https://mc.qcloudimg.com/static/img/dacf9205fe088ec2fef6f0b781c92510/share.png'
    }
  }
})