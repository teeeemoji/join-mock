const mock = require('./process-mock')
const proxy = require('./process-proxy')

// 延迟时间
const delay = function () {
  // TODO
}

/**
 * 响应添加默认跨域响应头
 * @param req
 * @param res
 */
const processDefaultHeader = function (req, res) {
  const origin = req.get('Origin') || '*'
  res.setHeader('Access-Control-Allow-Origin', origin)
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With')
  res.setHeader('Access-Control-Allow-Credentials', true)
}

module.exports = {
  processDefaultHeader,
  delay,
  mock,
  proxy
}
