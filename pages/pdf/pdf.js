// pages/pdf/pdf.js
var config = require('../../config');
var app = getApp();
let touchs = [];
Page({

  /**
   * 页面的初始数据
   */
  data: {
    drawContext: null,
    signImage: null,
    imgData: null,
    imgWidth: 0,
    imgHeight: 0,
    pixelRatio: 1,
    windowWidth: 750,
    windowHeight: 1206,
    distImg: null,
    isSingin: false,
    isThird: false,
    showDist: false,
    prevewImg: null,
    selectedFile: {
      fileId: '',
      fileName: '',
      imageUrl: '',//'../Resources/pdf2.jpg',../Resources/sign_3.jpg
      signType: 1
    } // signType 1--委托维修协议 2--委托维修协议三者 3--实物
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },

  canvasIdErrorCallback: function (e) {
    console.error(e.detail.errMsg)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          // pixelRatio: res.pixelRatio,
          windowWidth: res.windowWidth,
          windowHeight: res.windowHeight
        })
      }
    })
  },
  // 画布的触摸移动开始手势响应
  start: function (event) {
    //获取触摸开始的 x,y
    let point = { x: event.changedTouches[0].x, y: event.changedTouches[0].y }
    touchs.push(point)
  },

  // 画布的触摸移动手势响应
  move: function (e) {
    let point = { x: e.touches[0].x, y: e.touches[0].y }
    touchs.push(point)
    if (touchs.length >= 2) {
      this.draw(touchs)
    }
  },

  // 画布的触摸移动结束手势响应
  end: function (e) {
    console.log("触摸结束" + e)
    //清空轨迹数组
    for (let i = 0; i < touchs.length; i++) {
      touchs.pop()
    }
  },
  //绘制
  draw: function (touchs) {
    let point1 = touchs[0]
    let point2 = touchs[1]
    touchs.shift()
    this.drawContext.moveTo(point1.x, point1.y)
    this.drawContext.lineTo(point2.x, point2.y)
    this.drawContext.stroke()
    this.drawContext.draw(true)
  },
  //清除操作
  clear: function () {
    //清除画布
    this.drawContext.clearRect(0, 0, this.data.windowWidth * this.data.pixelRatio, this.data.windowHeight * this.data.pixelRatio)
    this.drawContext.draw(true)
  },
  //保存图片
  ok: function () {
    wx.showLoading({
      title: '正在提交文件',
    });
    console.log('save image');
    var that = this
    wx.canvasGetImageData({
      canvasId: 'distCanvas',
      x: 0,
      y: 0,
      width: that.data.imgWidth,
      height: that.data.imgHeight,
      success(res) {
        let base64 = wx.arrayBufferToBase64(res.data.buffer);
        console.log(base64);
        wx.request({
          url: config.serverUrl + '/api/live/uploadSignPicture',
          method: 'POST',
          data: {
            base64Url: base64,
            prevewImg: 'data:image/jpg;base64,' + base64,
            fileId: that.data.selectedFile.fileId,
            fileName: that.data.selectedFile.fileName
          },
          success: function(res) {
            wx.hideLoading();
            console.log(res);
            if (res.statusCode === 200 ){
              wx.showToast({
                title: '提交成功'
              });
            } else {
              wx.showToast({
                title: res.data.message,
              });
            }
          },
          error(error) {
            console.log(error);
            wx.hideLoading();
          }
        });
      },
      error(error) {
        console.log(error);
        wx.hideLoading();
      }
    })
  },
  nextOne: function() {
    const that = this;
    wx.canvasGetImageData({
      canvasId: 'distCanvas',
      x: 0,
      y: 0,
      width: this.data.imgWidth,
      height: this.data.imgHeight,
      success(res) {
        console.log(res);
        let base64 = wx.arrayBufferToBase64(res.data.buffer)
        that.setData({
          isThird: true,
          selectedFile: {
            // imageUrl: 'data:image/jpg;base64,' + base64,
          },
          showDist: true
        });
        touchs = [];
        that.clear();
      }
    });
  },
  sigin: function() {
    //获得Canvas的上下文
    this.drawContext = wx.createCanvasContext('siginCanvas')
    //设置线的颜色
    this.drawContext.setStrokeStyle("#0000FF")
    //设置线的宽度
    this.drawContext.setLineWidth(3)
    //设置线两端端点样式更加圆润
    this.drawContext.setLineCap('round')
    //设置两条线连接处更加圆润
    this.drawContext.setLineJoin('round')
    this.setData({ isSingin: true })
  },
  showCancel: function() {
    this.setData({ showDist: false });
  },
  back: function() {
    this.setData({ isSingin: false } );
    touchs = [];
  },
  getSignOffset: function (signType, imgW, imgHeight) {
    console.log(signType);
    const offsetH = (imgHeight - 60) * this.data.pixelRatio;
    let offsetW = 0;
    if (signType === 1) {
      offsetW = (imgW - 120) * this.data.pixelRatio;
    } else if (signType === 2) {
      if (this.data.isThird) {
        offsetW = (imgW - 80) * this.data.pixelRatio;
      } else {
        offsetW = (imgW / 2 - 30) * this.data.pixelRatio;
      }
    } else if (signType === 3) {
      if (this.data.isThird) {
        offsetW = (imgW/2 + 30) * this.data.pixelRatio;
      } else {
        offsetW = 60 * this.data.pixelRatio;
      }
    }
    return {
      offsetH: offsetH,
      offsetW: offsetW
    }
  },
  mixinFile: function() {
    this.setData({ showDist: true })
    const ctx = wx.createCanvasContext('distCanvas');
    const that = this;
    wx.canvasToTempFilePath({
      canvasId: 'siginCanvas',
      success: function (res) {
        const tempPath = res.tempFilePath;
        const scaleRate = 0.2;
        const width = that.data.windowWidth * scaleRate;
        const height = width / 750 * 360;
        wx.getImageInfo({
          src: that.data.selectedFile.imageUrl,
          success: function (res) {
            console.log(res);
            const imgHeight = res.height / res.width * 375 * that.data.pixelRatio;
            const imgW = 375 * that.data.pixelRatio;
            const offsets = that.getSignOffset(that.data.selectedFile.signType, imgW, imgHeight);
            that.setData({
              imgWidth: imgW,
              imgHeight: imgHeight,
            });

            ctx.drawImage(that.data.selectedFile.imageUrl, 0, 0, imgW, imgHeight);
            //设置保存的图片
            ctx.drawImage(tempPath, offsets.offsetW, offsets.offsetH, width * that.data.pixelRatio, height * that.data.pixelRatio);
            ctx.draw();
          }
        })
      }
    });
  }
})
