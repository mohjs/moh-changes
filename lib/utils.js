'use strict'

const fs = require('fs')
const url = require('url')
const EventEmitter = require('events')
const { exec } = require('child_process')
const Promise = require('bluebird')
const linkParser = require('parse-link-header')
const { j2m } = require('./m2j2m')
const { fetchPRs, fetchTags } = require('./github')

const getRepoURL = 'git config --get remote.origin.url'

class ChangesEmitter extends EventEmitter {}
const emitter = new ChangesEmitter()

const transferUrl = input => {
  if (input.indexOf('git@') === 0) return `https://${input.slice(4).replace(':', '/')}`
  return input
}

const transRepoInfo = infoUrl => {
  const { host, path } = url.parse(infoUrl)
  let info = null

  if (host.split('.')[0] === 'github') {
    info = path.substring(1, path.length - 4).split('/')
  } else {
    // api.github.com
    info = path.substring(7).split('/')
  }
  return {owner: info[0], repo: info[1]}
}

const transPRInfo = PRs => {
  if (!PRs || PRs.length === 0) return []
  return PRs.map(pr => ({
    id: pr.number,
    url: pr.html_url,
    title: pr.title,
    body: pr.body,
    updatedAt: pr.updated_at,
    mergedAt: pr.merged_at,
    user: {
      name: pr.user.login,
      avatar: pr.user.avatar_url,
      url: pr.user.html_url
    }
  }))
}

const transTagInfo = tags => {
  if (!tags || tags.length === 0) return []

  return tags.map(tag => ({
    name: tag.name,
    commit: tag.commit,
    url: `https://github.com/${transRepoInfo(tag.zipball_url).owner}/${transRepoInfo(tag.zipball_url).repo}/releases/tag/${tag.name}`,
    createdAt: tag.createdAt
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

const getAllTagInfo = () => fetchTags().then(({data, meta}) => {   // feach firsr group release info
  const linkHeader = linkParser(meta.link)
  const totalPages = (linkHeader && linkHeader.last) ? linkHeader.last.page : 1

  let tagInfo = transTagInfo(data)

  if (totalPages > 1) {
    let fetchLeftTags = []
    // fetch all left tag info
    for (var i = 2; i <= totalPages; i++) {
      fetchLeftTags.push(fetchTags(i))
    }
    // TODO: Update with exist infos
    return Promise.all(fetchLeftTags).then(leftReleases => {
      const leftInfo = leftReleases.map(releases => transTagInfo(releases.data)).reduce((pre, cur) => pre.concat(cur), [])

      return tagInfo.concat(leftInfo)
    })
  } else {
    return tagInfo
  }
})

exports.fetchRepoURL = () => new Promise((resolve, reject) => {
  emitter.emit('CHECK_REPO', 'start')
  if (fs.existsSync(process.cwd() + '/.git')) {
    exec(getRepoURL, (err, stdout, stderr) => {
      if (err || stderr) {
        emitter.emit('CHECK_REPO', 'fail', 'Fech repo url info failed')
        return reject(new Error('Fech repo url info failed'))
      }
      emitter.emit('CHECK_REPO', 'succeed', ' Get repo info succeed')
      return resolve(transRepoInfo(transferUrl(stdout)))
    })
  } else {
    emitter.emit('CHECK_REPO', 'fail', ' Wrong folder, please make sure in the root of a git repo folder')
    return reject(new Error(`Path [${process.cwd()}] is not a valid git repo folder.`))
  }
})

exports.generateChangesInfo = () => {
  emitter.emit('FETCH_INFO', 'start')
  return Promise.all([
    getAllPRInfo('open'),
    getAllPRInfo('closed'),
    getAllTagInfo()
  ]).then(data => {
    emitter.emit('FETCH_INFO', 'succeed', ' Fetch release and PR info succeed')
    // TODO: FIX releases and version info
    const closePRs = data[1]
    const tags = data[2]

    let releaseByTags = tags.map((tag, index, tags) => {
      tag.endAt = tag.createdAt
      tag.startAt = index + 1 < tags.length ? tags[index + 1].createdAt : null
      return tag
    }).map(relTag => {
      emitter.emit('GENERATE_LOG', 'start')
      closePRs.forEach(pr => {
        relTag.prs = new Date(pr.mergedAt) > new Date(relTag.startAt) && new Date(pr.mergedAt) <= new Date(relTag.endAt)
          ? relTag.prs
            ? relTag.prs.concat(pr)
            : [pr]
          : relTag.prs || []
      })
      return relTag
    })

    const changes = {
      unreleased: data[0],
      released: releaseByTags,
      tags: tags
    }

    return changes
  }).catch(err => {
    emitter.emit('FETCH_INFO', 'fail', ' Unexpected error during fetch release or PR info')
    return Promise.reject(err)
  })
}

exports.generateLog = changes => {
  fs.writeFile('./CHANGELOG.md', j2m(changes).join('\n\n'), err => {
    if (err) {
      emitter.emit('GENERATE_LOG', 'fail', ' Failed to generate Changelog')
    }
    emitter.emit('GENERATE_LOG', 'succeed', ' Generate Changelog succeed')
  })
}

exports.emitter = emitter

exports.generateExistInfo = () => {
  const changePath = process.cwd() + '/CHANGELOG.md'
  const prRegx = /\[#\d+\]/g
  const tagRegx = /\[v\d+\.\d+\.\d+\\\]/g

  if (fs.existsSync(changePath)) {
    fs.readFile(changePath, 'UTF-8', (err, data) => {
      if (err) return emitter.emit('READ_INFO', 'fail', 'Fail to read local Changelog')
      emitter.emit('READ_INFO', 'start')
      const releasePart = data.split('##').slice(2).join('')
      const prIndexs = releasePart.match(prRegx)
      const tagIndexs = releasePart.match(tagRegx)

      console.log('>>> index', prIndexs, tagIndexs)
    })
  } else {
    return Promise.resolve()
  }
}
