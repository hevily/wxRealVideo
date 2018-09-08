var Stomp = require('./stomp.js').Stomp;
var config = require('../config.js');
var getloginInfo = require('../getlogininfo.js');
var socketOpen = false;
var socketMsgQueue = [];

function sendSocketMessage(msg) {
  console.log('send msg:')
  console.log(msg);
  if (socketOpen) {
    wx.sendSocketMessage({
      data: msg
    })
  } else {
    socketMsgQueue.push(msg)
  }
}

/////////////////////////////////////////////////////
var ws = {
  openid: '',
  send: sendSocketMessage,
  onopen: null,
  onmessage: null,
}

Stomp.setInterval = function () { }
Stomp.clearInterval = function () { }
var client = Stomp.over(ws);

function initConnect(openid, callback) {
  console.log(openid);
  client.connect({}, function (sessionId) {
    console.log('sessionId', sessionId)

    client.subscribe('/user/'+ openid + '/message', function (res, headers) {
      console.log('From MQ:', res);
      const data = JSON.parse(res.body);
      // "{\"reply\":true,\"roomId\":1209,\"orderNo\":\"PICC2018090211153636798\"}"
      const content = JSON.parse(data.content);
      console.log(content);
      callback && callback(content);

      // var url = '/pages/webrtcroom/room/room?roomID=' + content.roomId + '&roomName=' + '' + '&userName=' + '';
      // wx.navigateTo({ url: url });
    });
  })

  ws.openid = openid;
}

function startSocket() {
  wx.connectSocket({
    url: config.wssUrl + '/api/portfolio',
    header: {
      'content-type': 'application/json',
    },
  })

  wx.onSocketOpen(function (res) {
    console.log('WebSocket连接已打开！')

    socketOpen = true
    for (var i = 0; i < socketMsgQueue.length; i++) {
      sendSocketMessage(socketMsgQueue[i])
    }
    socketMsgQueue = []
    ws.onopen && ws.onopen()

    sendRequestVedio(ws.openid);
  })

  wx.onSocketMessage(function (res) {
    console.log('收到onmessage事件:', res)
    ws.onmessage && ws.onmessage(res)
  })

  wx.onSocketError(function (res) {
    console.log('WebSocket连接打开失败，请检查！')
  })

}

function sendRequestVedio(options) {
  const content = {
    userName: options.userName,//'张三',
    userContact: options.userContact,//'13800000001',
    carNo: options.carNo,//'鄂A00001',
  };
  const msg = {
    fromUserId: options.openid, //传入小程序的openid
    toUserId: options.seatNo,//'seat123456', //坐席编号
    msgType: options.type || 2,  //消息类型2 json对象消息
    createtime: new Date().getTime(),//1234556, //创建消息时间戳 可不填
    content,
  };
  msg.content = JSON.stringify(content);
  client.send('/app/chat', {}, JSON.stringify(msg));
}

function unsubscibeCall(openid) {
  client.unsubscribe('/user/' + openid + '/message', function (res, headers) {
    console.log(res);
  });
}

function getSeatList(index, count = 15, success, fail) {
  var self = this;
  self.request({
    url: config.serverUrl + '/api/sysConfig/customerServiceList',
    data: {
      offset: index,
      pageSize: count || 15,
      shopGroupCode: 'PICC',
      orderCondition: 'create_datetime',
      orderDirection: 'desc'
    },
    success: success,
    fail: fail
  })
}

module.exports = {
  initConnect: initConnect,
  startSocket: startSocket,
  sendRequestVedio: sendRequestVedio,
  getSeatList: getSeatList,
}