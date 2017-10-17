exports.j2m = changes => {
  const today = new Date()
  const todayTime = [today.getFullYear(), today.getMonth() + 1, today.getDate()].join('-')

  const unreleased = [
    `## Unreleased  @${todayTime}`
  ].concat(changes.unreleased.length > 0 ? changes.unreleased.map(unrelease => {
    const userInfo = unrelease.user ? `by: [_${unrelease.user.name || 'Unknow'}_](${unrelease.user.url || ''})` : ''
    return `- [#${unrelease.id}](${unrelease.url}) ${unrelease.title} ` + userInfo
  }).join('\n') : '- _None_').join('\n\n')

  const released = changes.released.map(release => {
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

  const tags = changes.tags.map(info => `\\[${info.name}\\]: [${info.url}](${info.url})`).join('  \n')

  return [
    '# Changelog',
    'All notable changes to this project will be documented in this file.',
    'The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)\n' +
    'and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).'
  ].concat([unreleased])
  .concat(released)
  .concat([tags])
}

exports.m2j = input => {
// TODO: Featch exist infos from CHANGELOG.md
}
