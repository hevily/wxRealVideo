// pages/pdf/pdflist/pdflist.js
var config = require('../../../config');
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    files: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(config);
    var that = this;
    if (!app.globalData.orderNo) {
      return;
    }
    wx.request({
      url: config.serverUrl + '/api/live/files',
      data: {
        orderNo: app.globalData.orderNo
      },
      success: (res) => {
        const files = res.data.result;
        that.setData(
          {
            files: files
          }
        )
        console.log(res.data.result);
      }
    })
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

  back: function() {
    wx.navigateBack({
      delta: 1
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})