var webrtcroom = require('../../../utils/webrtcroom.js');
var socketStomp = require('../../../utils/socketStomp.js');

Page({

	/**
	 * 页面的初始数据
	 */
  data: {
    roomName: '',
    roomList: [],
    userName: '',
    firstshow: true, // 第一次显示页面
    tapTime: '',
    tapJoinRoom: false,
    ring: false,
    ringContent: '正在等待接听',
    interval: null,
    ticks: 0,
  },

  // 拉取房间列表
  getRoomList: function (callback) {
    var self = this;
    webrtcroom.getRoomList(0, 20, function (res) {
      console.log('拉取房间列表成功:', res);
      if (res.data && res.data.result) {
        const services = [];
        for (var item of res.data.result) {
          if (item.isService === 'T') {
            services.push(item);
          }
        }

        self.setData({
          roomList: services
        });
      }
    }, function (res) { });
  },

  // 创建房间，进入创建页面
  create: function () {
    var self = this;
    // 防止两次点击操作间隔太快
    var nowTime = new Date();
    if (nowTime - this.data.tapTime < 1000) {
      return;
    }
    var url = '../roomname/roomname?type=create&roomName=' + self.data.roomName + '&userName=' + self.data.userName;
    wx.navigateTo({
      url: url
    });
    self.setData({
      'tapTime': nowTime
    });
  },

  // 进入webrtcroom页面
  goRoom: function (e) {
    // 防止两次点击操作间隔太快
    var nowTime = new Date();
    if (nowTime - this.data.tapTime < 1000) {
      return;
    }
    if (e.currentTarget.dataset.servicestatus == '1') {
      wx.showModal({
        title: '提示',
        content: '坐席忙碌请切换坐席或刷新等待',
        showCancel: false,
        complete: function () { }
      });
      return;
    }
    console.log(e.currentTarget.dataset.roomid);
    const globaData = getApp().globalData;
    const userName = globaData.userName;
    const userContact = globaData.userContact || '13800000001';
    const carNo = globaData.carNo;
    const seatNo = e.currentTarget.dataset.roomid || 'seat123456';
    const openid = globaData.openid;
    const options = {
      userName: userName || '张三',
      userContact: userContact || '13800000001',
      carNo: carNo || '',
      openid: openid,
      seatNo: seatNo || 'seat123456',
    };

    this.setData({
      ring: true,
    })
    socketStomp.startSocket(options);
    this.data.interval = setInterval(() => {
      this.data.ticks ++;
      let dots = '';
      switch (this.data.ticks % 4) {
        case 0:
          dots = '';
          break;
        case 1:
          dots = '.';
          break;
        case 2:
          dots = '..';
          break;
        case 3:
          dots = '...';
          break;
        default:
          dots = '';
      }
      this.setData({
        ringContent: '正在等待接听' + dots
      });

      if (this.data.ticks >= 30) {
        this.setData({
          ring: false
        });
        clearInterval(this.data.interval);
        this.data.interval = null;
      }
    }, 1000);
  },

  compareVersion: function (v1, v2) {
    v1 = v1.split('.')
    v2 = v2.split('.')
    var len = Math.max(v1.length, v2.length)

    while (v1.length < len) {
      v1.push('0')
    }
    while (v2.length < len) {
      v2.push('0')
    }

    for (var i = 0; i < len; i++) {
      var num1 = parseInt(v1[i])
      var num2 = parseInt(v2[i])

      if (num1 > num2) {
        return 1
      } else if (num1 < num2) {
        return -1
      }
    }

    return 0
  },

	/**
	 * 生命周期函数--监听页面加载
	 */
  onLoad: function (options) {
    var app = getApp();
    const openid = getApp().globalData.openid;
    socketStomp.initConnect(openid, (content) => {
      const reply = content.reply;
      if (reply) {
        app.globalData.options.roomID = content.roomId;
        app.globalData.orderNo = content.orderNo;
        wx.navigateTo({
          url: '../../realstream/realstream',
        });
      } else {
        wx.showToast({
          title: content.message,
        });
      }
      
    });
  },

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
  onReady: function () {
    return;
    var self = this;
    console.log(this.data);
    var systemInfo = wx.getSystemInfoSync();
    console.error('系统消息:', systemInfo);
    if (self.compareVersion(systemInfo.version, '6.6.6') < 0) {
      var pages = getCurrentPages();
      if (pages.length > 1 && (pages[pages.length - 1].__route__ == 'pages/webrtcroom/roomlist/roomlist')) {
        wx.showModal({
          title: '提示',
          content: "当前微信版本不支持webrtc功能，请使用6.6.6以上的版本",
          showCancel: false,
          complete: function () {
            pages = getCurrentPages();
            if (pages.length > 1 && (pages[pages.length - 1].__route__ == 'pages/webrtcroom/roomlist/roomlist')) {
              wx.navigateBack({
                delta: 1
              });
            }
          }
        });
      }
    }
  },

	/**
	 * 生命周期函数--监听页面显示
	 */
  onShow: function () {
    console.log('roomlist onshow');
    this.getRoomList(function () { });
  },

	/**
	 * 生命周期函数--监听页面隐藏
	 */
  onHide: function () {
    this.cancelCall();
  },

  cancelCall: function() {
    if (this.data.interval) {
      clearInterval(this.data.interval);
      this.data.interval = null;
    }
    this.setData({
      ring: false
    });
  },

	/**
	 * 生命周期函数--监听页面卸载
	 */
  onUnload: function () { },

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
  onPullDownRefresh: function () {
    this.getRoomList(function () { });
    wx.stopPullDownRefresh();
  },

	/**
	 * 页面上拉触底事件的处理函数
	 */
  onReachBottom: function () {

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