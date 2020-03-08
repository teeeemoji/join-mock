const utils = require('./utils')
const parse = require('url').parse
const httpProxy = require('http-proxy')
const color = require('colors-cli/safe')

/**
 * 判断是命中代理配置
 * @param req 客户端请求
 * @param urlParse 客户端请求 url 的 parse 对象
 * @param proxyConfig 所有代理配置集合
 */
function hit(req, urlParse, proxyConfig) {
  return utils.pathMatch(req, proxyConfig)
}

function forward(urlParse, hitProxy, config, req, res, next) {
  const {
    changeHost = true,
    httpProxy: httpProxyConfig = {}
  } = config
  const {options: proxyOptions = {}, listeners: proxyListeners = {}} = httpProxyConfig

  const proxyHTTP = httpProxy.createProxyServer({})
  const url = parse(hitProxy.hit)
  if (changeHost) {// 设置 req 的 host
    req.headers.host = url.host
  }
  // 添加默认 error handler
  if (!proxyListeners.error) {
    proxyHTTP.on('error', defaultProxyErrorHandler)
  }
  // 为 proxyReq 设置 header
  proxyHTTP.on('proxyReq', function (proxyReq, req, res, opts) {
    if (opts.header) {
      Object.keys(opts.header).forEach(key => {
        proxyReq.setHeader(key, opts.header[key])
      })
    }
  })
  // 为 proxyHTTP 绑上自定义监听事件
  Object.keys(proxyListeners).forEach(event => {
    proxyHTTP.on(event, proxyListeners[event])
  })
  console.log(color.green(`forward: ${req.path} to ${hitProxy.hit}`))
  try {
    proxyHTTP.web(req, res, Object.assign({target: url.href}, proxyOptions))
  } catch (e) {
    console.error(e)
  }
}

function defaultProxyErrorHandler(e) {
  console.error(e)
}

module.exports = {
  hit,
  forward
}
