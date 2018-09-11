// pages/pdf/pdf.js
var config = require('../../config');
var upng = require('../../utils/UPNG.js');
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
    drawImgUrl: '',
    siginFile1: null,
    siginFile2: null,
    interval: null,
    distCtx: null,
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
    console.log(options);
    this.setData({
      selectedFile: options,
      drawImgUrl: options.imageUrl
    });
    this.data.distCtx = wx.createCanvasContext('distCanvas');
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
        // 3. png编码
        let pngData = upng.encode([res.data.buffer], res.width, res.height)
        // 4. base64编码
        let base64 = wx.arrayBufferToBase64(pngData); //'data:image/jpeg;base64,' +
        wx.request({
          url: config.serverUrl + '/api/live/uploadSignPicture',
          method: 'POST',
          data: {
            base64Url: base64,
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
              wx.navigateBack({
                delta: 1
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
    this.setData({
      showDist: true,
      isSingin: true,
      isThird: true
    });
    this.clear();
    touchs = [];
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
    this.setData({ showDist: false, isSingin: false } );
    touchs = [];
  },
  getSignOffset: function (signType, imgW, imgHeight, isThird) {
    console.log(signType);
    const offsetH = (imgHeight - 60) * this.data.pixelRatio;
    let offsetW = 0;
    if (signType == '1') {
      offsetW = (imgW - 120) * this.data.pixelRatio;
    } else if (signType == '2') {
      if (isThird) {
        offsetW = (imgW - 80) * this.data.pixelRatio;
      } else {
        offsetW = (imgW / 2 - 30) * this.data.pixelRatio;
      }
    } else if (signType == '3') {
      if (isThird) {
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
    this.setData({ showDist: true });
    const ctx = this.data.distCtx;
    const that = this;
    wx.getImageInfo({
      src: that.data.selectedFile.imageUrl,
      success: function (res) {
        console.log(res);
        const imgHeight = res.height / res.width * that.data.windowWidth * that.data.pixelRatio;
        const imgW = that.data.windowWidth * that.data.pixelRatio;

        that.setData({
          imgWidth: imgW,
          imgHeight: imgHeight,
        });

        wx.canvasToTempFilePath({
          canvasId: 'siginCanvas',
          destWidth: res.width,
          destHeight: res.height,
          success: function (result) {
            const tempPath = result.tempFilePath;
            const scaleRate = 0.2;
            const width = that.data.windowWidth * scaleRate;
            const height = width / 750 * 360;
            that.drawContext.clearRect(0, 0, that.data.windowWidth * that.data.pixelRatio, that.data.windowHeight * that.data.pixelRatio);

            ctx.drawImage(that.data.selectedFile.imageUrl, 0, 0, imgW, imgHeight);
            if (!that.data.siginFile1) {
              that.data.siginFile1 = tempPath;
              const offsets = that.getSignOffset(that.data.selectedFile.signType, imgW, imgHeight, false);
              ctx.drawImage(that.data.siginFile1, offsets.offsetW, offsets.offsetH, width * that.data.pixelRatio, height * that.data.pixelRatio);
            } else {
              const offsets = that.getSignOffset(that.data.selectedFile.signType, imgW, imgHeight, false);
              ctx.drawImage(that.data.siginFile1, offsets.offsetW, offsets.offsetH, width * that.data.pixelRatio, height * that.data.pixelRatio);
              if (!that.data.siginFile2) {
                that.data.siginFile2 = tempPath;
                const offsets1 = that.getSignOffset(that.data.selectedFile.signType, imgW, imgHeight, true);
                ctx.drawImage(tempPath, offsets1.offsetW, offsets1.offsetH, width * that.data.pixelRatio, height * that.data.pixelRatio);

              }
            }
            
            ctx.draw();
            that.setData({ isSingin: false });            
          }
        })
      }
    });
  }
})
