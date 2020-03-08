join-mock
---

`join-mock` 帮助你快速启动一个 mock 服务器, 或提供一个轻而易举就能使用的 express 中间件让你在 vue 项目中使用.

**特性:**  
🚀 超快的配置, 超简单的配置.  
🔥 内置热更新模块, 所有 mock 相关的配置都是热更新的.  
🌱 在 vue 项目中将获得非凡的体验.  
💥 可以独立于 webpack 使用, 也可以搭配 webpack-dev-server 使用

## 快速上手

```bash
mkdir join-mock-sample && cd join-mock-sample

# 全局安装 join-mock 吧
npm install join-mock -g

# 生成一份默认参考配置吧
join-mock sample

# 启动 server
join-mock start

# 试试访问你的 mock 接口吧
open http://localhost:8080/api/user/list
```

## 安装
你可以让 `join-mock` 作为当前项目的依赖

```bash
npm install join-mock --save-dev
```

也可以全局安装使用 `join-mock`

```bash
npm install join-mock -g 
```

## 使用

`join-mock` 依赖的配置将放置在 `./join-mock/index.js`. 遵守约定将提升您的体验.

你可以在其中修改 [http-proxy](https://www.npmjs.com/package/http-proxy) 的配置, 通常, 你不需要定制它.

```js
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
    '/goods_compose/(.*)': 'https://github.com/',
    // http-proxy 的配置, 详情查看 https://www.npmjs.com/package/http-proxy
    _config: {
      // 是否改变 req.header.host, 通用配置, 默认 true
      changeHost: true,
      httpProxy: {
        options: {
          // 可以为每一个代理请求增加 header
          header: {
            'x-session-employeeNumber': '3619673',
            'X-Requested-With': 'XMLHttpRequest'
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
```

## API & 配置说明
### start
启动一个 mock server, 或者传入 express app, start 方法会为他注册 mock 路由的
#### Parameters
-   `options`
    - entry : join mock server 的配置入口文件, 所有的热更新都是基于此文件进行依赖分析的. 默认使用 `${cwd}/.join-mock/index.js`
    - silent: 是否 打印日志
    - port: 如果是启动 mock server, 那么您可以传入 port
    - serverCreator: 可以是字符串('http' | 'https')，也可以是一个函数。函数支持自定义 server 的类型，需要接受一个 express app 作为参数，返回一个 server 实例。默认是`'http'`
    - static: 静态资源配置对象，如果没有传入该对象，则默认不开启静态资源托管
      - directory: 指定静态资源的路径，默认是 `'./dist'`
      - context: 指定 url 的上下文，默认是 `'/'`
      - slient: 是否输出静态资源请求日志

-   `injectApp`
    - 一个 express app, start 方法会为他做这样的操作 `injectApp.use('/*', mockMiddleware)`

### middleware
传入 options, 返回 mock 中间件
#### Parameters
-   `options`
    - entry : join mock server 的配置入口文件, 所有的热更新都是基于此文件进行依赖分析的
    - silent: 是否 打印日志

### ./join-mock/index.js

```json
{
  "proxy": {
    "/api-relative-path": "http(s?)://proxy-to-url/",
    "上面的配置": "将会被代理到 http(s?)://proxy-to-url/api-relative-path"
  },
  "mock": {
    "GET/POST/? /mock-api-path": "JS Object/express 中间件",
    "如果写了 method": "配置将只会响应配置的请求方法",
    "如果不写": "配置讲支持所有的请求方法"
  }
}
```  
 
## start

```js
const start = require('join-mock')
start({}, app)
// 或
start()
```

```js
const {middleware} = require('join-mock')
app.use('/*', middleware({
    entry: '/path/to/mock/entry.js', // 所有相关的文件都将会热更新
    silent: false
}))
```

## 使用 CLI 命令
>⚠️  不依赖于 [webpack](https://github.com/webpack/webpack) 或 [webpack-dev-server](https://github.com/webpack/webpack-dev-server). 

```bash
# 全局安装
npm install join-mock -g
# 生成默认配置
join-mock sample
# 运行 server
join-mock start
# 运行一个有静态资源托管服务的 mock server
join-mock dist-test --dir '/path/to/static/' --https --port 8080
```

### Options
#### join-mock start

```bash
Usage: join-mock start [options]

start mock server

Options:
  -s, --https          use https server (default: false)
  --no-https           use http server
  -p, --port <port>    http or https server port (default: "8080")
  -e, --entry <entry>  config entry (default: "./.join-mock")
  --slient             output mock server log (default: false)
  -h, --help           output usage information
```

#### join-mock dist-test

```bash
Usage: join-mock dist-test [options]

start a mock server servicing static content

Options:
  -d, --dir <dist directory>  static content directory (default: "./dist")
  -c, --context <context>     url context (default: "/")
  -s, --https                 use https server (default: true)
  --no-https                  use http server
  -p, --port <port>           http or https server port (default: "8080")
  -e, --entry <entry>         mock config entry (default: "./.join-mock")
  --slient                    output static files request log (default: false)
  --mock-slient               output mock server log (default: false)
  -h, --help                  output usage information
```

## 在 [Express](https://github.com/expressjs/express) 中使用

>⚠️  Not dependent on [webpack](https://github.com/webpack/webpack) and [webpack-dev-server](https://github.com/webpack/webpack-dev-server).
### 步骤一: 安装 join-mock

```shell
# 全局安装
npm install join-mock -g
# 在项目根目录生成 .join-mock 实例, 开箱即用
cd /path/to/project
join-mock sample
# 运行完成, 会发现项目根目录下出现了一个 .join-mock 目录

# 为我们的项目安装 join-mock
npm install join-mock -D
```

### 步骤二: 改动 app.js 文件

```diff
const express = require('express');
+ const path = require('path');
+ const start = require('join-mock');

const app = express();

+ start({port: 8080}}, app)
- app.listen(8080);
```

### 步骤三: 启动开发服务器
尝试访问: `http://localhost:8080/api/user/list`
您已经接入成功啦


## 在 [Webpack](https://github.com/webpack/webpack) 中使用

在 [Webpack](https://github.com/webpack/webpack) 中使用, 仅仅需要小小设置一下 [webpack-dev-server](https://github.com/webpack/webpack-dev-server) 的参数:
### 步骤一: 安装 join-mock

```shell

# 全局安装
npm install join-mock -g
# 在项目根目录生成 .join-mock 实例, 开箱即用
cd /path/to/project
join-mock sample
# 运行完成, 会发现项目根目录下出现了一个 .join-mock 目录

# 为我们的项目安装 join-mock
npm install join-mock -D
```

### 步骤二: 改动 webpack.config.js 文件
`webpack.config.js`文件的改动如下:

```diff
const HtmlWebpackPlugin = require('html-webpack-plugin');
+ const joinMockClient = require('join-mock');

module.exports = {
  entry: {
    app: './src/index.js',
    print: './src/print.js'
  },
  devtool: 'inline-source-map',
+ devServer: {
+   ...
+   before(app){
+     joinMockClient({}, app)
+   }
+ },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Development'
    })
  ],
  output: {
    filename: '[name].bundle.js',
    path: require.resolve(__dirname, 'dist')
  }
};
```

### 步骤三: 启动开发服务器
尝试访问: `http://localhost:8080/api/user/list`
您已经接入成功啦

## 在 [Vue](https://cn.vuejs.org/v2/guide/) 中使用

在 [Vue](https://cn.vuejs.org/v2/guide/) 中使用, 仅仅需要小小设置一下 [vue.config](https://cn.vuejs.org/v2/api/#%E5%85%A8%E5%B1%80%E9%85%8D%E7%BD%AE) 的参数:
### 步骤一: 安装 join-mock

```shell

# 全局安装
npm install join-mock -g
# 在项目根目录生成 .join-mock 实例, 开箱即用
cd /path/to/project
join-mock sample
# 运行完成, 会发现项目根目录下出现了一个 .join-mock 目录

# 为我们的项目安装 join-mock
npm install join-mock -D
```

### 步骤二: 改动 vue.config.js 文件

`vue.config.js`文件的改动如下:

```diff
const HtmlWebpackPlugin = require('html-webpack-plugin');
+ const joinMockClient = require('join-mock');

module.exports = {
  chainWebpack: config => {
    ...
  },
  ...
+ devServer: {
+   ...
+   before(app){
+     joinMockClient({}, app)
+   }
+ },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Development'
    })
  ]
};
```

### 步骤三: 启动开发服务器
尝试访问: `http://localhost:8080/api/user/list`
您已经接入成功啦

您可能需要做一些小小的迁移改动, `join-mock` 的配置和 [webpack-dev-server](https://github.com/webpack/webpack-dev-server) 非常相似, 这并不会花费您多少时间.


## License

MIT © teeeemoji
