const express = require('express')
const {Server: HttpsServer} = require('https')
const color = require('colors-cli/safe')
const utils = require('./utils')
const middleware = require('./middleware')
const {getServerCreator} = require('./server-creator')

// 所有的配置项
const DEFAULT_OPTIONS = {
  entry: utils.resolveCwd('./.join-mock'), // mock 配置入口文件
  port: '8080', // 假如单独启动一个服务的话
  silent: false, // 是否打印 mock 日志
  serverCreator: 'http'
}

/**
 *
 * @param options
 * port: 如果是启动 mock server, 可以传入 port
 * silent: 如果是启动 mock server, 可以传入 silent, 表示是否打印日志
 * mockOptions: 参考 middleware 的 options
 * @param injectApp express app
 * @param serverCreator use to create a server, like: http.createSercer, https.createServer
 * serverCreator，可以是http.createServer，也可以是自己封装的https和http2的方法
 * 接受一个app参数，需要返回一个server实例
 * @ref https://nodejs.org/dist/latest-v13.x/docs/api/http.html#http_class_http_server
 * @returns {Promise<app>}
 */
function start(options, injectApp) {
  const {
    port = '8080',
    static,
    serverCreator: serverCreatorOpt = 'http',
    ...mockOptions
  } = {...DEFAULT_OPTIONS, ...options}

  let staticMiddleware = null
  if (static) {
    // 如果有配置静态资源
    const {directory = './dist', context = '/', slient = false} = static
    const staticDir = utils.resolveCwd(directory)

    const expressStaticMiddleware = express.static(staticDir, {
      // hack into express.static to log request info
      setHeaders(response, file_path, _file_stats) {
        const request = response.req
        const portStr = injectApp ? '' : `:${port}`
        // WARNING
        // In Express 4, the req.host stripped off the port number if it was present. 
        // In Express 5 the port number is maintained.
        // it means that it will iccorectly log the port if there is an inject app in express 4x
        // so it won't log the port when there is an inject app
        const url = `${request.protocol}://${request.hostname}${portStr}${request.originalUrl}`
        if (!slient) {
          console.log(`${color.green('static:')} ${url} ${color.green('from')} ${file_path}`)
        }
      }
    })

    staticMiddleware = [context, expressStaticMiddleware]
  }

  // 作为中间件使用
  if (injectApp) {
    if (staticMiddleware) {
      injectApp.use(...staticMiddleware)
    }
    injectApp.all('/*', middleware(mockOptions))
    return Promise.resolve(injectApp)
  }

  // 启动一个 express 服务
  const app = express()
  if (staticMiddleware) {
    app.use(...staticMiddleware)
  }
  app.all('/*', middleware(mockOptions))

  return new Promise(async (resolve, reject) => {
    const serverCreator = await getServerCreator(serverCreatorOpt)
    const server = serverCreator(app)

    server.listen(port, function (err) {
      if (err) reject(err)
      else {
        const isHttps = server instanceof HttpsServer

        !mockOptions.silent && console.log(color.green(`Server run on http${isHttps ? 's' : ''}://localhost:${port}`))

        app.close = function (callback) {
          server.close(callback)
        }
        resolve(app)
      }
    })
  })
}

Object.assign(start, middleware)
module.exports = start
