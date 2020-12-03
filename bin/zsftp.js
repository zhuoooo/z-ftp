#!/usr/bin/env node

const program = require('commander')
const _ = require('lodash')
const inquirer = require('inquirer')
const fse = require('fs-extra')
const path = require('path')

let { sftp } = require('../dist/index')

let accountPath = path.resolve(__dirname, '../sftp-account.json')

// TODO 登录管理？？？
program
  .version('0.0.1', '-v, --version')

program
  .command('login <host>')
  .description('连接到ftp服务器')
  .option('-P, --port [port]', '端口号', 22)
  .option('-u, --username [username]', '登录账号')
  .option('-p, --password [password]', '登录密码')
  .option('-r, --root [root]', '上传的文件地址')
  .action(async (host, opt) => {

    // ^((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})(\.((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})){3}$
    // 加密？
    curAccount = {
      host:  host,
      port: opt.port,
      user: opt.username,
      password: opt.password,
      root: opt.root || opt.username
    }

    await fse.outputJSON(accountPath, curAccount)
    console.log(`${curAccount.host}登录成功`);
  })

program
  .command('upload <path>')
  .option('-r, --root [root]', '目标文件夹', '.')
  .description('上传文件')
  .action(async (path, opt) => {

    let root = opt.root
    let curAccount = getAccount()

    if(!validAccount()) {
      console.log('未登录账号，请先执行zsftp login进行登录');
      return;
    }

    await sftp.connect(curAccount)
    await sftp.upload(path, root)
    sftp.close()
  })

program
  .command('view')
  .description('查看远程服务上文件列表')
  .option('-r, --root [root]', '目标文件夹', '.')
  .action(async (opt) => {

    let root = opt.root
    let curAccount = getAccount()

    if(!validAccount()) {
      console.log('未登录账号，请先执行zsftp login进行登录');
      return;
    }

    await sftp.connect(curAccount)
    await sftp.list(root)
    sftp.close()
  })

program
  .command('logout')
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