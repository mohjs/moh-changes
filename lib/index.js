'use strict'

const { fetchRepoURL, generateExistInfo, generateChangesInfo, generateLog, emitter } = require('./utils')
const { initInfo, authenticate } = require('./github')

exports.initRepoInfo = () => fetchRepoURL()
  .then(initInfo)

exports.initChangeInfo = authInfo => authenticate(authInfo)
  .then(generateExistInfo)
  .then(generateChangesInfo)
  .then(generateLog)

exports.emitter = emitter
