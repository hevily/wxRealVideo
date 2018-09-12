var WXBizDataCrypt = require('./WXBizDataCrypt')

function decodePhone(options) {
  var pc = new WXBizDataCrypt(options.appId, options.sessionKey)
  var data = pc.decryptData(options.encryptedData, options.iv) 
  return data;
}

module.exports = decodePhone;


