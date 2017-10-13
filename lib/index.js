'use strict'

const { fetchRepoURL, generateChangesInfo } = require('./utils')
const { initInfo, authenticate, fetchPRs } = require('./github')

exports.getChangeInfo = () =>
  fetchRepoURL()
    .then(initInfo)
    .then(authenticate)
    .then(fetchPRs)
    .then(generateChangesInfo)
    .catch(console.log)
