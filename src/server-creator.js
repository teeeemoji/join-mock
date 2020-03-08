const {createServer: createHttpServer} = require('http')
const {getHttpsServerCreator} = require('./https-server')

/**
 *
 * @param serverCreator 可以是('http' | 'https')，也可以是一个function
 * 接受一个app参数，需要返回一个server实例
 * getServerCreator(string | function) => serverCreator(app) => Server
 * Server 可以是http.Server, https.Server, http2.Server的实例
 * example: serverCreator可以是http.createServer，也可以是自己封装的https和http2的方法
 * @returns {Promise<serverCreator>}
 */
async function getServerCreator(serverCreator) {
  if (typeof serverCreator === 'function') {
    return serverCreator
  }

  if (typeof serverCreator === 'string') {
    switch(serverCreator) {
      case 'http':
        return createHttpServer
      case 'https':
        const createHttpsServer = await getHttpsServerCreator()
        return createHttpsServer
      default:
        console.error(`Unsupport server creator type: ${serverCreator}`)
        console.error(`Will fall back to http server`)
        return createHttpServer
    }
  }

  console.error(`Option \`serverCreator\` should be string or function`)
  console.error(`Will fall back to http server`)
  return createHttpServer
}

module.exports = {
  getServerCreator
}
