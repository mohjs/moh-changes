'use strict'

const fs = require('fs')
const url = require('url')
const { exec } = require('child_process')
const Promise = require('bluebird')
const linkParser = require('parse-link-header')

const getRepoURL = 'git config --get remote.origin.url'

const transferUrl = input => {
  if (input.indexOf('git@') === 0) return `https://${input.slice(4).replace(':', '/')}`
  return input
}

const transChangesInfo = PRs => {
  return PRs.map(pr => ({
    id: pr.number,
    url: pr.html_url,
    title: pr.title,
    body: pr.body,
    updatedAt: pr.updated_at,
    user: {
      name: pr.user.login,
      url: pr.user.html_url
    }
  }))
}

exports.fetchRepoURL = () => new Promise((resolve, reject) => {
  if (fs.existsSync(process.cwd() + '/.git')) {
    exec(getRepoURL, (err, stdout, stderr) => {
      if (err || stderr) {
        return reject(new Error('Fech repo url info failed'))
      }
      const path = url.parse(transferUrl(stdout)).path
      const info = path.substring(1, path.length - 4).split('/')

      return resolve({owner: info[0], repo: info[1]})
    })
  } else {
    return reject(new Error(`Path [${process.cwd()}] is not a valid git repo folder.`))
  }
})

exports.generateChangesInfo = ({data, meta}) => {
  const linkHeader = linkParser(meta.link)
  const totalPages = (linkHeader && linkHeader.last) ? linkHeader.last.page : 1

  const chanInfo = transChangesInfo(data)
}
