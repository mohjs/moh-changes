#!/usr/bin/env node
const version = require('../package.json').version
const prog = require('caporal')
const { getChangeInfo } = require('../lib')

prog
  .version(version)
  .description('A CLI tool to easily generate CHANGELOGS for project, based on PR on Github."')
  .action((args, options, logger) => {
    getChangeInfo()
  })

prog.parse(process.argv)
