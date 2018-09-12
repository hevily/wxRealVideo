var config = require('../../config.js');

Page({
  data: {
    //...
    roomID: '',
    userID: '',
    userSig: '',
    sdkAppID: '',
    beauty: 3,
    muted: false,
    debug: false,
    enableIM: false,
    frontCamera: true,
  },

  onIMEvent: function (e) {
    switch (e.detail.tag) {
      case 'big_group_msg_notify':
        //收到群组消息
        console.debug(e.detail.detail)
        break;
      case 'login_event':
        //登录事件通知
        console.debug(e.detail.detail)
        break;
      case 'connection_event':
        //连接状态事件
        console.debug(e.detail.detail)
        break;
      case 'join_group_event':
        //进群事件通知
        console.debug(e.detail.detail)
        break;
    }
  },

  onRoomEvent: function (e) {
    switch (e.detail.tag) {
      case 'roomClosed':
      case 'error': {
        /*
          房间关闭时会收到此通知，客户可以提示用户房间已经关闭，做清理操作
        */
        // 在房间内部才显示提示
        console.log("roomClose:", e.detail.detail);
        var pages = getCurrentPages();
        console.log(pages, pages.length, pages[pages.length - 1].__route__);
        if (pages.length > 1 && (pages[pages.length - 1].__route__ == 'pages/webretcroom/room/room')) {
          wx.showModal({
            title: '提示',
            content: e.detail.detail || '房间已解散',
            showCancel: false,
            complete: function () {
              pages = getCurrentPages();
              console.log(pages, pages.length, pages[pages.length - 1].__route__);
              if (pages.length > 1 && (pages[pages.length - 1].__route__ == 'pages/webretcroom/room/room')) {
                wx.navigateBack({ delta: 1 });
              }
            }
          });
        }
        break;
      }
    }
  },
  togglePlay: function () {
    var rtcroomCom = this.selectComponent('#webrtcroom');
    if (rtcroomCom) {
      rtcroomCom.stop();
      wx.navigateBack({ delta: 1 });
    }
  },
  changeCamera: function () {
    var rtcroomCom = this.selectComponent('#webrtcroom');
    if (rtcroomCom) {
      rtcroomCom.switchCamera();
    }
    this.setData({
      frontCamera: !this.data.frontCamera
    });
  },
  changeMute: function () {
    this.data.muted = !this.data.muted;
    this.setData({
      muted: this.data.muted
    });
  },
  showFile: function () {
    console.log('show file');
    wx.navigateTo({
      url: '../pdf/pdflist/pdflist',
    });
  },

  onLoad: function () {
    wx.hideLoading();
    const options = getApp().globalData.options;
    console.log(options);
    var self = this;
    wx.request({
      url: config.serverUrl + '/api/live/pmk',
      data: {
        userId: options.userID,
        roomId: options.roomID,
      },
      success: (res) => {
        const privateMapKey = res.data.result;
        console.log('userID', options.userID);
        console.log('roomID', options.roomID);
        self.setData({
          userID: options.userID,
          userSig: options.userSig,
          sdkAppID: options.sdkAppID,
          roomID: options.roomID,
          privateMapKey: privateMapKey
        }, function () {
          console.log(this.data);
          var webrtcroomCom = this.selectComponent('#webrtcroom');
          if (webrtcroomCom) {
            webrtcroomCom.start();
          }
        })
      },
      fail: (error) => {
        console.log(error);
      }
    })
    
    
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