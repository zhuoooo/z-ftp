#!/usr/bin/env node

const program = require('commander')
const _ = require('lodash')
const inquirer = require('inquirer')

// TODO 登录管理？？？
program
  .version('0.0.1', '-v, --version')
  .option('-t, --type [type]', '选择上传类型，可选值：ftp/sftp', 'ftp')
  .option('-h, --host [host]', '主机地址')
  .option('-p, --port [port]', '端口号', 22)
  .option('-u, --username [username]', '登录账号')
  .option('-P, --password [password]', '登录密码')
  .action(opt => {

    // cb 中不支持 let 生命变量
    var promps = []

    if (!opt.host) {
      promps.push({
        type: 'input',
        name: 'host',
        message: '请输入ftp服务器地址，例如：127.0.0.1',
        validate: function (input) {
          if (!input) {
            return '不能为空'
          }
          return true
        }
      })
    }

    if(!['ftp', 'sftp'].includes(opt.type)) {
      promps.push({
        type: 'list',
        name: 'type',
        message: '请选择传输的类型：',
        choices: [
          {
            name: 'FTP',
            value: 'ftp'
          },
          {
            name: 'SFTP',
            value: 'sftp'
          }
        ]
      })
    }

    inquirer.prompt(promps).then(function (answers) {
      _.assign(opt, answers)
      console.log(`${opt.host}:${opt.port}`)
    })
  })
  .parse(process.argv)
