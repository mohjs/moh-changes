const ora = require('ora')

const { emitter } = require('../lib')

const isValidType = type => ['start', 'succeed', 'fail', 'stop'].indexOf(type) >= 0

exports.initSpinner = () => {
  const spinners = {
    checkSpinner: ora(' Checking repo info...'),
    loginSpinner: ora(),
    readSpinner: ora(' Reading exist Changelog info...'),
    fetchSpinner: ora(' Fetching PR & Release info...'),
    logSpinner: ora(' Generating Changelog info...')
  }

  emitter.on('CHECK_REPO', (type, info) => {
    if (isValidType(type)) spinners.checkSpinner[type](info)
  })

  emitter.on('LOGIN', (type, info) => {
    if (isValidType(type)) spinners.loginSpinner[type](info)
  })

  emitter.on('READ_INFO', (type, info) => {
    if (isValidType(type)) spinners.readSpinner[type](info)
  })

  emitter.on('FETCH_INFO', (type, info) => {
    if (isValidType(type)) spinners.fetchSpinner[type](info)
  })

  emitter.on('GENERATE_LOG', (type, info) => {
    if (isValidType(type)) spinners.logSpinner[type](info)
  })
}

exports.infoSpinner = ora()
