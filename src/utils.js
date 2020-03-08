const path = require('path')
const fs = require('fs')
const {pathToRegexp} = require('path-to-regexp')

// 当前工作路径
const cwd = process.cwd()

/**
 * resolve cwd 下的相对路径
 * @param paths 相对路径
 * @returns {string}
 */
const resolveCwd = function (...paths) {
  return path.resolve(cwd, ...paths)
}

/**
 * 是否文件判断
 * @param path
 * @returns {Boolean}
 */
const isFile = function (path) {
  return fs.existsSync(path) && fs.statSync(path).isFile()
}

/**
 * 是否文件夹判断
 * @param path
 * @returns {Boolean}
 */
const isDirectory = function (path) {
  return fs.existsSync(path) && fs.statSync(path).isDirectory()
}

/**
 * 查找 config 中被 req 命中的配置, 无命中返回 undefined
 * @param req
 * @param config
 * @returns {*}
 */
function pathMatch(req, config = {}) {
  /**
   * config key 包含下面 mocker key 和 proxy key两种类型, 但是规则是一致的:
   * 带上特定请求方法
   * => `GET /api/:owner/:repo/raw/:ref`
   * => `GET /api/:owner/:repo/raw/:ref/(.*)`
   * 不带特定请求方法
   * => `/api/:owner/:repo/raw/:ref/(.*)`
   * => `/user/:id/(.*)`
   */
  const key = Object.keys(config).find(kname => {
    return !!pathToRegexp(kname.replace((new RegExp('^' + req.method + ' ')), '')).exec(req.path)
  })
  if (!key) {
    return null
  }
  return {
    key: key,
    hit: config[key]
  }
}

/**
 * 从 url 中解析出 params 来
 * @param mockKey
 * @param pathname
 * @returns {boolean}
 */
function pathParamsParse(mockKey, pathname) {
  const keys = []
  const params = {}
  const regTemp = mockKey.replace(/^.*\s/, '')
  const regex = pathToRegexp(regTemp, keys, {sensitive: false, strict: false, end: false})
  const match = regex.exec(pathname)
  if (!match) {
    return false
  }
  let key
  let param
  for (let i = 0; i < keys.length; i++) {
    key = keys[i]
    param = match[i + 1]
    if (!param) {
      continue
    }
    params[key.name] = decodeURIComponent(param)
    if (key.repeat) {
      params[key.name] = params[key.name].split(key.delimiter)
    }
  }
  return params
}


/**
 * 根据目录来获取相应的文件
 * @param dir
 * @param filter
 * @param deep
 * @returns {Array}
 */
function readFiles(dir, filter = () => true, deep = Infinity) {
  if (deep <= 0) {
    return []
  }

  if (!dir) {
    throw new Error('you should provide a directory to search')
  }

  const exists = fs.existsSync(dir)
  if (!exists) {
    throw new Error(`this directory \`${dir}\` is not exist`)
  }

  const files = fs.readdirSync(dir)
  const allFiles = []

  for (const fileName of files) {
    const fullFileName = `${dir}/${fileName}`
    const stat = fs.statSync(fullFileName)
    if (stat.isDirectory()) {
      const subFiles = readFiles(fullFileName, filter, deep - 1) || []
      allFiles.push(...subFiles.map(name => `${fileName}/${name}`))
      continue
    }

    if (filter(fileName)) {
      allFiles.push(fileName)
    }
  }

  return allFiles
}

module.exports = {
  cwd,
  isFile,
  isDirectory,
  resolveCwd,
  pathMatch,
  pathParamsParse,
  readFiles
}
