const utils = require('./utils')
const bodyParser = require('body-parser')
const color = require('colors-cli/safe')
/**
 * 判断是否命中 mock 配置
 * @param req
 * @param urlParse
 * @param mockConfig
 */
function hit(req, urlParse, mockConfig) {
  return utils.pathMatch(req, mockConfig)
}

function getBodyParser(contentType) {
  switch (contentType) {
    case 'text/plain':
    case 'raw':
      return bodyParser.raw()
    case 'text/html':
    case 'text':
      return bodyParser.text()
    case 'application/x-www-form-urlencoded':
    case 'urlencoded':
      return bodyParser.urlencoded({extended: false})
    case 'json':
    default:
      return bodyParser.json()
  }
}

async function forward(urlParse, hitMock, req, res, next) {
  const bodyParserMethod = getBodyParser(req.get('Content-Type'))
  console.log(color.green(`forward: ${req.path} to local mock`))
  if (typeof hitMock.hit === 'function') {
    bodyParserMethod(req, res, async () => {
      req.params = utils.pathParamsParse(hitMock.key, urlParse.pathname)
      await hitMock.hit(req, res)
      return next()
    })
  } else {
    res.send(hitMock.hit)
  }
}

module.exports = {
  hit,
  forward
}
