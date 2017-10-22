exports.j2m = ({ currentInfo, changes }) => {
  const title = '# Changelog'
  const today = new Date()
  const todayTime = [today.getFullYear(), today.getMonth() + 1, today.getDate()].join('-')

  let { lastTag } = currentInfo || {}
  let { desc, released: currentReleased, releases: currentTags } = currentInfo || {}

  desc = desc || [
    'All notable changes to this project will be documented in this file.',
    'The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)\n' +
    'and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html). \n\n',
    'Auto generated with [moh-changes](https://github.com/mohjs/moh-changes)'
  ].join('')

  const unreleased = [
    `## Unreleased  @${todayTime}`
  ].concat(changes.unreleased.length > 0 ? changes.unreleased.map(unrelease => {
    const userInfo = unrelease.user ? `by: [_${unrelease.user.name || 'Unknow'}_](${unrelease.user.url || ''})` : ''
    return `- [#${unrelease.id}](${unrelease.url}) ${unrelease.title} ` + userInfo
  }).join('\n') : '- _None_').join('\n\n')

  const released = changes.released.reduce((pre, cur) => {
    if (cur.name <= lastTag) return pre

    pre.push(cur)
    return pre
  }, []).map(release => {
    const createDate = new Date(release.createdAt)
    const createTime = [createDate.getFullYear(), createDate.getMonth() + 1, createDate.getDate()].join('-')

    const releasedInfo = release.prs.length > 0 ? release.prs.map(info => {
      const userInfo = info.user ? `by: [_${info.user.name || 'Unknow'}_](${info.user.url || ''})` : ''
      return `- [#${info.id}](${info.url}) ${info.title} ` + userInfo
    }).join('\n') : '- _None_'

    return [
      `## ${release.name}  @${createTime}`
    ].concat([releasedInfo]).join('\n\n')
  })

  const tags = changes.tags.reduce((pre, cur) => {
    if (cur.name <= lastTag) return pre

    pre.push(cur)
    return pre
  }, []).map(info => `\\[${info.name}\\]: [${info.url}](${info.url})`).join('  \n')

  return [title]
  .concat([desc])
  .concat([unreleased])
  .concat(released)
  .concat(currentReleased ? [currentReleased] : [])
  .concat([tags])
  .concat(currentTags ? [currentTags] : [])
}

exports.m2j = data => {
  const prRegx = /\[#\d+\]/g
  const tagRegx = /\[v\d+\.\d+\.\d+\\\]/g

  let currentInfo = {}
  const body = `##` + data.split('##').slice(2).join('##')
  currentInfo.desc = data.split('##').slice(0, 1).join('').split('\n').slice(2).join('\n').trim()

  const prIndexs = body.match(prRegx)
  const tagIndexs = body.match(tagRegx)

  currentInfo.released = body.split('\n').slice(0, -tagIndexs.length).join('\n').trim()
  // TODO: remvoe extra spaces between released and releases
  currentInfo.releases = body.split('\n').slice(-tagIndexs.length).join('\n').trim()

  const lastPR = prIndexs.sort().pop()
  const lastTag = tagIndexs.sort().pop()
  currentInfo.lastPR = lastPR.substr(2, lastPR.length - 1)
  currentInfo.lastTag = lastTag.substr(1, lastTag.length - 3)

  return currentInfo
}
