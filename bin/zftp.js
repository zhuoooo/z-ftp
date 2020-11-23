#!/usr/bin/env node

const program = require('commander')
const _ = require('lodash')
const inquirer = require('inquirer')

// TODO 登录管理？？？
program
  .version('0.0.1', '-v, --version')

program
  .command('login <host>')
  .description('连接到ftp服务器')
  .option('-p, --port [port]', '端口号', 22)
  .option('-u, --username [username]', '登录账号')
  .option('-P, --password [password]', '登录密码')
  .action((host, opt) => {

    // cb 中不支持 let 生命变量
    var promps = []

    inquirer.prompt(promps).then(function (answers) {
      _.assign(opt, answers)
      console.log(`${host}:${opt.port}`)
    })
  })

program
  .command('upload <source>')
  .description('上传文件')
  .requiredOption('-p, --path [path]', '主机地址')
  .action(opt => {
    console.log('上传文件')
  })

program
  .command('view <source>')
  .description('查看远程服务上文件列表')
  .action(opt => {
    console.log('查看文件')
  })
  
program
  .command('logout <source>')
  .description('退出登录')
  .action(opt => {
    console.log('登出账号')
  })

program.parse(process.argv)