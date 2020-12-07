#!/usr/bin/env node

const program = require('commander')
const _ = require('lodash')
const inquirer = require('inquirer')
const fse = require('fs-extra')
const path = require('path')

let {sftp} = require('../dist/index')

let accountPath = path.resolve(__dirname, '../sftp-account.json')

program
  .version('0.0.1', '-v, --version')

program
  .command('login')
  .alias('l')
  .description('连接到ftp服务器')
  .option('-P, --port [port]', '端口号', 22)
  .option('-u, --username [username]', '登录账号')
  .option('-p, --password [password]', '登录密码')
  .option('-r, --root [root]', '上传的文件地址')
  .action(async (opt) => {

    // ^((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})(\.((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})){3}$
    // 加密？
    let curAccount = {
      host: opt.host,
      port: opt.port,
      username: opt.username,
      password: opt.password,
      root: opt.root || opt.username
    }
    let promps = []

    if (!curAccount.host) {
      promps.push({
        type: 'input',
        name: 'host',
        message: '服务器地址:',
        validate: function (input) {
          if (!input) {
            return '不能为空'
          }
          if (!/^((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})(\.((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})){3}$/.test(input)) {
            return '请输入正确的ip'
          }
          return true
        }
      })
    }
    if (!curAccount.username) {
      promps.push({
        type: 'input',
        name: 'username',
        message: '账号:',
        validate: function (input) {
          if (!input) {
            return '不能为空'
          }
          return true
        }
      })
    }
    if (!curAccount.password) {
      promps.push({
        type: 'password',
        name: 'password',
        message: '密码:',
        validate: function (input) {
          if (!input) {
            return '不能为空'
          }
          return true
        }
      })
    }

    let answers = await inquirer.prompt(promps)

    _.assign(curAccount, answers)

    await fse.outputJSON(accountPath, curAccount)
    console.log(`${curAccount.host}登录成功`);
  })

program
  .command('upload <path>')
  .alias('u')
  .option('-r, --root [root]', '目标文件夹', '.')
  .description('上传文件')
  .action(async (path, opt) => {

    let root = opt.root
    let curAccount = getAccount()
    sftp.init(curAccount)

    if(!validAccount()) {
      console.log('未登录账号，请先执行zsftp login进行登录');
      return;
    }

    await sftp.connect(curAccount)
    sftp.upload(path, root).finally(sftp.close) 
  })

program
  .command('view [root]')
  .alias('v')
  .description('查看远程服务上文件列表')
  .action(async (r, opt) => {

    let curAccount = getAccount()
    let root = r || curAccount.root
    sftp.init(curAccount)

    if(!validAccount()) {
      console.log('未登录账号，请先执行zsftp login进行登录');
      return;
    }

    console.log(sftp.options)
    await sftp.connect()
    await sftp.list(root)
    sftp.close()
  })

program
  .command('logout')
  .alias('out')
  .description('退出登录')
  .action(opt => {
    
    fse.outputJSON(accountPath, {})
    sftp.logout()
  })

program.parse(process.argv)

function getAccount () {
  let curAccount = fse.readJSONSync(accountPath)

  return curAccount
}

function validAccount () {
  let curAccount = getAccount()

  // todo 身份认证？
  return Object.values(curAccount).length > 0
}
