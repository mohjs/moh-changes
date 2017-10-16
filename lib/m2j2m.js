exports.j2m = changes => {
  const unreleased = changes.unreleased.map(info => `- [#${info.id}](${info.url}) ${info.title} by: [_${info.user.name}_](${info.user.url})`).join('\n')
  const released = changes.released.map(info => `- [#${info.id}](${info.url}) ${info.title} by: [_${info.user.name}_](${info.user.url})`).join('\n')
  return [
    '#Changelog',
    'All notable changes to this project will be documented in this file.',
    'The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)\n' +
    'and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).'
  ].concat(['## [Unreleased]'])
  .concat([unreleased])
  .concat(['## [Released]'])
  .concat([released])
}

exports.m2j = input => {

}
