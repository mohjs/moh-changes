'use strict'

const { fetchRepoURL, generateChangesInfo, generateLog } = require('./utils')
const { initInfo, authenticate } = require('./github')

exports.getChangeInfo = () =>
  fetchRepoURL()
    .then(initInfo)
    .then(authenticate)
    .then(generateChangesInfo)
    .then(generateLog)
    .catch(console.log)
