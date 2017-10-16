const inquirer = require('inquirer')
const GithubAPI = require('github')
const Promise = require('bluebird')

const github = new GithubAPI({
  // debug: true,
  Promise: Promise,
  timeout: 5000,
  host: 'api.github.com',
  protocol: 'https'
})

let info = null

Promise.promisifyAll(github.pullRequests)
Promise.promisifyAll(github.repos)

exports.initInfo = data => new Promise((resolve, reject) => {
  info = data
  return resolve()
})

exports.authenticate = () => inquirer.prompt([
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
]).then(logIn => {
  github.authenticate({
    type: 'basic',
    username: logIn.username,
    password: logIn.password
  })
  return Promise.resolve()
})

exports.fetchPRs = (pageNo = 1, state = 'closed') => github.pullRequests.getAllAsync({
  owner: info.owner,
  repo: info.repo,
  state: state,
  sort: 'updated',
  direction: 'desc',
  per_page: 3,
  page: pageNo
})

exports.fetchReleases = (pageNo = 1) => github.repos.getReleasesAsync({
  owner: info.owner,
  repo: info.repo,
  per_page: 3,
  page: pageNo
})
