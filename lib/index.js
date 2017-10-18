'use strict'

const { fetchRepoURL, generateChangesInfo, generateLog } = require('./utils')
const { initInfo, authenticate } = require('./github')

exports.initRepoInfo = () => fetchRepoURL()
  .then(initInfo)

exports.initChangeInfo = authInfo => authenticate(authInfo)
  .then(generateChangesInfo)
  .then(generateLog)
