#!/usr/bin/env node

const yargs = require('yargs')

const { main } = require('../dist/main')

const program = yargs
  .option('releaseId', {
    alias: ['r'],
    type: 'number',
    description: 'Release id from Discogs.',
  })
  .option('folder', {
    alias: ['f'],
    type: 'string',
    description: 'Folder where the tracks to be tagged are located.',
  })
  .usage('Automatically tag tracks from Discogs!')
  .help()

main(program.argv)
