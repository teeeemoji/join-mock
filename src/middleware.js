const utils = require('./utils')
const url = require('url')
const processer = require('./processer')
const path = require('path')
const makeHotRequire = require('hot-module-require')
const color = require('colors-cli/safe')

/**
 * @param options 可以查看 index.js 文件的描述
 * @returns {Function} express 中间件
 */
function middleware(options) {
  // 判断配置是否 OK
  if (!utils.isFile(options.entry) && !utils.isFile(path.join(options.entry, 'index.js'))) {
    console.warn(color.yellow('[WARNING] There is no mock entry!'))
    return function (req, res, next) {
      // skip
      next()
    }
  }
  // 获得热更新的 mock 配置以及 mock 文件
  const hotRequire = makeHotRequire(options.entry)
  const hotModuleGetter = hotRequire(options.entry)

  // 主体中间件
  return async function (req, res, next) {
    const config = hotModuleGetter()

    const urlParsed = url.parse(req.url)
    // 设置默认的 CORS 响应头
    processer.processDefaultHeader(req, res)
    // 是否 mock
    const hitMock = processer.mock.hit(req, urlParsed, config.mock)
    if (hitMock) {
      return await processer.mock.forward(urlParsed, hitMock, req, res, next)
    }
    // 是否代理
    const hitProxy = processer.proxy.hit(req, urlParsed, config.proxy)
    if (hitProxy) {
      return processer.proxy.forward(urlParsed, hitProxy, config.proxy._config, req, res, next)
    }
    // 没有匹配
    return next()
  }
}

module.exports = middleware
