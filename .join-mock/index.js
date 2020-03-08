// 是否禁用代理: 一键开启 mock or 关闭 mock
let joinMockSwitchOn
let joinProxySwitchOn

joinMockSwitchOn = true // 通过注释快速打开或关闭 local mock
// joinMockSwitchOn = false
joinProxySwitchOn = true // 通过注释快速打开或关闭 proxy
// joinProxySwitchOn = false

const config = {
  // local mock 配置
  // 注意: mock 规则声明顺序越靠前, 优先级越高
  // 注意: mock 的优先级高于 proxy
  mock: {
    // 场景一: 接口 mock 硬编码数据, 适用于简单接口
    // 这个 mock 接口支持所有请求方法, 如: post, get, put, delete
    '/api/user/list': [{
      id: 2,
      username: 'kenny',
      sex: 6
    }, {
      id: 2,
      username: 'kenny',
      sex: 6
    }],
    // 场景二: 接口 mock 复杂数据, 避免影响配置文件长度, 另外抽离出一个 js 文件, 当然, ./user 也能热更新哦
    // 这个 mock 接口只支持 GET 方法
    'GET /app-api/raw': require('./raw'),
    'GET /app-api/user/info': require('./user'),
    // 场景三: 你可以获取 get 请求 url 上地参数
    'GET /api/:owner/:repo/raw/:ref/(.*)': (req, res) => {
      const {owner, repo, ref} = req.params
      const {action} = req.query
      // http://localhost:8081/api/ztc/join-mock/raw/master/add/ddd.md?action=see
      // owner => admin
      // repo => join-mock
      // ref => master
      // req.params[0] => add/ddd.md
      // action => see
      return res.json({
        id: 1,
        owner,
        repo,
        ref,
        action,
        path: req.params[0]
      })
    },
    // 场景四: 获取 post 请求地请求体
    'POST /api/login/account': (req, res) => {
      const {password, username} = req.body
      if (password === '888888' && username === 'admin') {
        return res.json({
          status: 'ok',
          code: 0,
          token: 'sdfsdfsdfdsf',
          data: {
            id: 1,
            username: 'kenny',
            sex: 6
          }
        })
      }
      return res.status(403)
        .json({
          status: 'error',
          code: 403
        })
    },
    'GET /api/user/:id': (req, res) => {
      res.send({
        status: 'ok',
        message: '删除成功！123'
      })
    }
  },
  // 接口代理的配置, 优先于 mock 配置
  // 注意: 不完全同于 webpack devServer 的配置
  // 注意: mock 规则声明顺序越靠前, 优先级越高
  proxy: {
    // {api 名称: 远端服务路径} => forward to `${远端服务路径}/${api 名称}`
    '/user/context': 'https://github.com/',
    // 请使用通配符
    '/api/(.*)': 'https://github.com/',
    // http-proxy 的配置, 详情查看 https://www.npmjs.com/package/http-proxy
    _config: {
      // 是否改变 req.header.host, 通用配置, 默认 true
      changeHost: true,
      httpProxy: {
        options: {
          // 可以为每一个代理请求增加 header
          header: {
            'cookie': 'name=teeeemoji;' // 可以用于模拟登录
          }
        },
        // http-proxy 所有支持的事件, 均可以
        listeners: {
          proxyReq(proxyReq, req, res, options) {
            console.log(`除了 join-mock 的日志, 我还能打印更多日志 proxy: ${req.path} to ${proxyReq.getHeader('host')}${req.path}`)
          }
        }
      }
    }
  }
}

module.exports = {
  mock: joinMockSwitchOn ? config.mock : {},
  proxy: joinProxySwitchOn ? config.proxy : {}
}
