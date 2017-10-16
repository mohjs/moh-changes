'use strict'

const fs = require('fs')
const url = require('url')
const { exec } = require('child_process')
const Promise = require('bluebird')
const linkParser = require('parse-link-header')
const { m2j, j2m } = require('./m2j2m')
const { fetchPRs, fetchReleases } = require('./github')

const getRepoURL = 'git config --get remote.origin.url'

const transferUrl = input => {
  if (input.indexOf('git@') === 0) return `https://${input.slice(4).replace(':', '/')}`
  return input
}

const transPRInfo = PRs => {
  if (!PRs || PRs.length === 0) return []
  return PRs.map(pr => ({
    id: pr.number,
    url: pr.html_url,
    title: pr.title,
    body: pr.body,
    updatedAt: pr.updated_at,
    user: {
      name: pr.user.login,
      avatar: pr.user.avatar_url,
      url: pr.user.html_url
    }
  }))
}

const transReleaseInfo = releases => {
  if (!releases || releases.length === 0) return []
  return releases.map(release => ({
    id: release.number,
    url: release.html_url,
    title: release.title,
    tag: release.tag_name,
    body: release.body,
    publishedAt: release.published_at,
    user: {
      name: release.author.login,
      avatar: release.author.avatar_url,
      url: release.author.html_url
    }
  }))
}

const getAllPRInfo = state => fetchPRs(null, state).then(({data, meta}) => {   // feach firsr group PR info
  const linkHeader = linkParser(meta.link)
  const totalPages = (linkHeader && linkHeader.last) ? linkHeader.last.page : 1

  let prInfo = transPRInfo(data)

  if (totalPages > 1) {
    let fetchLeftPRs = []
    // fetch all left PR info
    for (var i = 2; i <= totalPages; i++) {
      fetchLeftPRs.push(fetchPRs(i), state)
    }
    // TODO: Update with exist infos
    return Promise.all(fetchLeftPRs).then(leftPRs => {
      const leftInfo = leftPRs.map(PRs => transPRInfo(PRs.data)).reduce((pre, cur) => pre.concat(cur), [])

      return prInfo.concat(leftInfo)
    })
  } else {
    return prInfo
  }
})

const getAllReleaseInfo = () => fetchReleases().then(({data, meta}) => {   // feach firsr group release info
  const linkHeader = linkParser(meta.link)
  const totalPages = (linkHeader && linkHeader.last) ? linkHeader.last.page : 1

  let releaseInfo = transPRInfo(data)

  if (totalPages > 1) {
    let fetchLeftReleases = []
    // fetch all left PR info
    for (var i = 2; i <= totalPages; i++) {
      fetchLeftReleases.push(fetchReleases(i), state)
    }
    // TODO: Update with exist infos
    return Promise.all(fetchLeftReleases).then(leftReleases => {
      const leftInfo = leftReleases.map(releases => transReleaseInfo(releases.data)).reduce((pre, cur) => pre.concat(cur), [])

      return releaseInfo.concat(leftInfo)
    })
  } else {
    return releaseInfo
  }
})

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

exports.generateChangesInfo = () => {
  return Promise.all([
    getAllPRInfo('open'),
    getAllPRInfo('closed'),
    getAllReleaseInfo()
  ]).then(data => {
    // TODO: FIX releases and version info
    let changes = {
      unreleased: data[0],
      released: data[1],
      releases: data[2]
    }

    return changes
  })
}

exports.generateLog = changes => {
  fs.writeFile('./CHANGELOG.MD', j2m(changes).join('\n\n'), err => console.log(err))
}
