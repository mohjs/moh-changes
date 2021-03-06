const GithubAPI = require('github')
const Promise = require('bluebird')

const github = new GithubAPI({
  // debug: true,
  Promise: Promise,
  timeout: 5000,
  host: 'api.github.com',
  protocol: 'https'
})

let info = null

Promise.promisifyAll(github.pullRequests)
Promise.promisifyAll(github.repos)

exports.initInfo = data => new Promise((resolve, reject) => {
  info = data
  return resolve()
})

exports.authenticate = authInfo => {
  github.authenticate({
    type: 'basic',
    username: authInfo.username,
    password: authInfo.password
  })
  return Promise.resolve()
}

exports.fetchPRs = (pageNo = 1, state = 'closed') => github.pullRequests.getAllAsync({
  owner: info.owner,
  repo: info.repo,
  state: state,
  sort: 'updated',
  direction: 'desc',
  per_page: 3,
  page: pageNo
}).catch(Promise.reject)

exports.fetchTags = (pageNo = 1) => github.repos.getTagsAsync({
  owner: info.owner,
  repo: info.repo,
  per_page: 3,
  page: pageNo
}).then(({data, meta}) => Promise.all(data.map(tag => github.repos.getCommitAsync({ // Fetch commit time
  owner: info.owner,
  repo: info.repo,
  sha: tag.commit.sha
}))).then(commits => {
  data.forEach((tag, index) => {
    data[index].createdAt = commits[index].data.commit.committer.date
  })
  return {data, meta}
})).catch(Promise.reject)
