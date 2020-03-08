#!/usr/bin/env node
const path = require('path')
const color = require('colors-cli/safe')
const copydir = require('copy-dir')
const program = require('commander')
const package = require('../package.json')
const utils = require('../src/utils')
const mockClient = require('../index')

program
  .version(package.version)
  .usage('join-mock <sample | start[options] | dist-test[options]>')

if (!process.argv.slice(2).length) {
  console.log(color.yellow('Warning: 请输入您地命令!'))
  program.outputHelp(color.red);
}

program
  .command('sample')
  .description('create join-mock sample configuration files')
  .action(() => {
    copydir(path.join(__dirname, '../.join-mock/'), utils.resolveCwd('.join-mock/'), {}, function (err) {
      if (err) {
        console.log(color.red('err'))
      } else {
        console.log(color.green('done'))
      }
    })
  })

program
  .command('start')
  .description('start mock server')
  .option('-s, --https', 'use https server', false)
  .option('--no-https', 'use http server')
  .option('-p, --port <port>', 'http or https server port', '8080')
  .option('-e, --entry <entry>', 'config entry', './.join-mock')
  .option('--slient', 'output mock server log', false)
  .action(async ({https, port, entry, silent}) => {
    const mockClientOptions = {
      port,
      entry: utils.resolveCwd(entry),
      silent,
      serverCreator: https ? 'https' : 'http'
    }

    await mockClient(mockClientOptions)

    console.log(`http${https ? 's' : ''}> join mock server started, server running at ${port}`)
  })

program
  .command('dist-test')
  .description('start a mock server servicing static content')
  .option('-d, --dir <dist directory>', 'static content directory', './dist')
  .option('-c, --context <context>', 'url context', '/')
  .option('-s, --https', 'use https server', true)
  .option('--no-https', 'use http server')
  .option('-p, --port <port>', 'http or https server port', '8080')
  .option('-e, --entry <entry>', 'mock config entry', './.join-mock')
  .option('--slient', 'output static files request log', false)
  .option('--mock-slient', 'output mock server log', false)
  .action(async ({port, dir: directory, context, https, slient, mockSlient, entry}) => {
    const mockClientOptions = {
      static: {
        directory,
        context,
        slient
      },
      port,
      entry: utils.resolveCwd(entry),
      slient: mockSlient,
      serverCreator: https ? 'https' : 'http',
    }

    await mockClient(mockClientOptions)

    console.log(`http${https ? 's' : ''}> join mock dist test server started, server running at ${port}`)

    // log 所有可访问的 html 文件
    const staticDir = utils.resolveCwd(directory)
    const contextStr = context.replace(/^\/|\/$/g, '')
    const htmlFiles = utils.readFiles(staticDir, fileName => fileName.match(/.html$/))
    console.log(color.green('可访问的html文件：'))
    htmlFiles.forEach(fileName => {
      console.log(`${color.green('static:')} http${https ? 's' : ''}://localhost:${port}/${contextStr ? contextStr + '/' : ''}${fileName}`)
    })
  })

// error on unknown commands
program.on('command:*', function () {
  console.error('Invalid command: %s\nSee --help for a list of available commands.', program.args.join(' '))
  process.exit(1)
})

program.parse(process.argv)
