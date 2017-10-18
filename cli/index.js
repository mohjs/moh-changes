#!/usr/bin/env node
const version = require('../package.json').version
const prog = require('caporal')
const inquirer = require('inquirer')
const Preferences = require('preferences')

const { initSpinner } = require('./spinner')

const { initRepoInfo, initChangeInfo, emitter } = require('../lib')
let prefs = new Preferences('moh-changes')

const prepaerInfo = () => {
  initSpinner()
  return initRepoInfo()
}

const login = () => new Promise((resolve, reject) => {
  if (prefs.authInfo) {
    emitter.emit('LOGIN', 'succeed', 'Success auto login')
    return resolve(prefs.authInfo)
  }

  return inquirer.prompt([
    {
      name: 'username',
      type: 'input',
      message: 'Enter your Github username or e-mail address:',
      validate: value => value.length ? true : 'Please enter your username or e-mail address'
    },
    {
      name: 'password',
      type: 'password',
      message: 'Enter your password:',
      validate: value => value.length ? true : 'Please enter your password'
    }
  ]).then(authInfo => {
    prefs.authInfo = authInfo
    resolve(authInfo)
  })
  .catch(reject)
})

prog
  .version(version)
  .description('A CLI tool to easily generate CHANGELOGS for project, based on PR on Github."')
  .action((args, options, logger) => {
    prepaerInfo()
      .then(login)
      .then(initChangeInfo)
      .catch(err => {
        if (err.code && err.code === 401) {
          prefs.authInfo = undefined
          console.log('>>> AuthInfo failed, please retry.')
        }
      })
  })

prog.parse(process.argv)
