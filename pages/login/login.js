var config = require('../../config.js');
var socketStomp = require('../../utils/socketStomp');
var app = getApp();

// pages/login/login.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    name: '',
    carNo: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  nameInputEvent: function (e) {
    console.log(e);
    this.setData({
      name: e.detail.value
    })
  },

  carNoInputEvent: function (e) {
    console.log(e);
    this.setData({
      carNo: e.detail.value
    })
  },

  formSubmit: function (e) {
    app.globalData.userName = this.data.name;
    // const userContact = '13800000001';
    app.globalData.carNo = this.data.carNo;
    app.globalData.userContact = this.data.carNo;

    wx.showLoading({
      title: '正在获取信息',
    })

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
          data: { userId: app.globalData.openid },
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
        userID: app.globalData.openid,
        userSig: info.userSig,
        sdkAppID: info.sdkAppId,
        accType: info.accountType,
      }

      getApp().globalData.options = options;
      wx.hideLoading();
      wx.navigateTo({
        url: '../webrtcroom/roomlist/roomlist',
      })
    }).catch((error) => {
      console.log(error);
    });
    
    // const seatNo = 'seat123456';
    // const openid = getApp().globalData.openid;
    // const options = {
    //   userName: userName || '张三',
    //   userContact: userContact || '13800000001',
    //   carNo: carNo || '',
    //   openid: openid,
    //   seatNo: seatNo || 'seat123456',
    // };

    // wx.showLoading({
    //   title: '正在等待接通',
    // })
    // socketStomp.startSocket(options);
  
   
    console.log('form发生了submit事件，携带数据为：', e.detail.value)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})