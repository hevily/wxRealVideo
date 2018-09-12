var config = require('../../config.js');
var socketStomp = require('../../utils/socketStomp');
// var decodePhone = require('../../utils/decodePhone.js');
var app = getApp();

// pages/login/login.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    name: '',
    carNo: '',
    index: 0,
    array: [
      '鄂','京','津','沪','渝','蒙','新','藏',
      '宁','桂','港','澳','黑','吉','辽','晋',
      '冀','鲁','豫','苏','皖','浙','闽','赣',
      '湘','粤','琼','甘','陕','贵','云','川'],
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

  bindPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      index: e.detail.value
    })
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

  submit: function (e) {
    if (!this.data.name ) {
      wx.showToast({
        title: '请输入姓名',
        icon: 'none',
      });
      return;
    }
    if (!this.data.carNo) {
      wx.showToast({
        title: '请输入正确的车牌号码',
        icon: 'none',
      });
      return;
    }

    app.globalData.userName = this.data.name;
    // const userContact = '13800000001';
    app.globalData.carNo = this.data.array[this.data.index] + this.data.carNo;
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
              console.log(res);
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
      wx.hideLoading();
      wx.showToast({
        title: '获取信息失败',
      });
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
})