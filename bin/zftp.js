#!/usr/bin/env node

const program = require('commander')
const _ = require('lodash')
const inquirer = require('inquirer')
const fse = require('fs-extra')
const path = require('path')

let { ftp } = require('../dist/index')

let accountPath = path.resolve(__dirname, '../ftp-account.json')

program
  .version('0.0.1', '-v, --version')

program
  .command('login')
  .alias('l')
  .description('连接到ftp服务器')
  .option('-P, --port [port]', '端口号', 22)
  .option('-h, --host [host]', '服务器地址')
  .option('-u, --username [username]', '登录账号')
  .option('-p, --password [password]', '登录密码')
  .option('-r, --root [root]', '上传的文件地址')
  .action(async (opt) => {

    // 加密？
    let curAccount = {
      host: opt.host,
      port: opt.port,
      user: opt.username,
      password: opt.password,
      root: opt.root || opt.username
    }
    let promps = []

    if (!curAccount.host) {
      promps.push(...[{
        type: 'input',
        name: 'host',
        message: '服务器地址：',
        validate: function (input) {
          if (!input) {
            return '不能为空'
          }
          if (!/^((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})(\.((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})){3}$/.test(input)) {
            return '请输入正确的ip'
          }
          return true
        }
      }, 
      {
        type: 'input',
        name: 'port',
        default: curAccount.port,
        message: '端口：'
      },
      {
        type: 'input',
        name: 'user',
        message: '登录账号：'
      },
      {
        type: 'password',
        name: 'password',
        message: '账号密码：'
      },
      {
        type: 'input',
        name: 'root',
        default: curAccount.root,
        message: '文件夹：'
      }])
    }

    let answers = await inquirer.prompt(promps)

    _.assign(curAccount, answers)

    await fse.outputJSON(accountPath, curAccount)
    console.log(`${curAccount.host}登录成功`)
  })

program
  .command('upload <path>')
  .alias('u')
  .option('-r, --root [root]', '目标文件夹', '.')
  .description('上传文件')
  .action(async (path, opt) => {

    let curAccount = getAccount()
    ftp.init(curAccount)

    if (!validAccount()) {
      console.log('未登录账号，请先执行zftp login进行登录');
      return;
    }

    await ftp.connect()
    await ftp.upload(path)
    ftp.close()
  })

program
  .command('view')
  .alias('v')
  .description('查看远程服务上文件列表')
  .option('-r, --root [root]', '目标文件夹', './zhuo')
  .action(async (opt) => {

    let root = opt.root
    let curAccount = getAccount()

    ftp.init(curAccount)

    if (!validAccount()) {
      console.log('未登录账号，请先执行zftp login进行登录');
      return;
    }

    await ftp.connect(curAccount)

    let list = await ftp.list(root)
    console.table(list)
    ftp.close()
  })

program
  .command('logout')
  .alias('out')
  .description('退出登录')
  .action(opt => {

    fse.outputJSON(accountPath, {})
    ftp.logout()
  })

program.parse(process.argv)

function getAccount() {
  let curAccount = fse.readJSONSync(accountPath)

  return curAccount
}

function validAccount() {
  let curAccount = getAccount()

  // todo 身份认证？
  return Object.values(curAccount).length > 0
}
