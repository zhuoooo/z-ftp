#!/usr/bin/env node

const program = require('commander')
const _ = require('lodash')
const inquirer = require('inquirer')

// let ftp = require('../src/index')

// TODO 登录管理？？？
program
  .version('0.0.1', '-v, --version')

program
  .command('login <host>')
  .description('连接到ftp服务器')
  .option('-p, --port [port]', '端口号', 22)
  .option('-u, --username [username]', '登录账号')
  .option('-P, --password [password]', '登录密码')
  .option('-r, --root [root]', '上传的文件地址')
  .action((host, opt) => {

    // ^((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})(\.((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})){3}$

    // cb 中不支持 let 生命变量
    var promps = []

    inquirer.prompt(promps).then(function (answers) {
      _.assign(opt, answers)
      console.log(`${host}:${opt.port}`)
    })

    // ftp.connect({
    //   host: opt.host,
    //   port: opt.port,
    //   user: opt.username,
    //   password: opt.password,
    //   root: opt.root || opt.username
    // })
  })

program
  .command('upload <path>')
  .description('上传文件')
  .action((path, opt) => {

    console.log('上传文件' + path)

    // ftp.upload(path)
  })

program
  .command('view')
  .description('查看远程服务上文件列表')
  .option('-r, --root [root]', '目标文件夹', '.')
  .action((opt) => {
    console.log('查看文件' + opt.root)
  })

program
  .command('logout')
  .description('退出登录')
  .action(opt => {
    console.log('退出登录')
  })

program.parse(process.argv)
