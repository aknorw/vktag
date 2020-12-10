#!/usr/bin/env node

const yargs = require('yargs')

const { main } = require('../dist/main')

const program = yargs
  .option('releaseId', {
    alias: ['r'],
    type: 'number',
    description: 'Release id from Discogs.',
  })
  // Must use double quotes for paths.
  .option('folder', {
    alias: ['f'],
    type: 'string',
    description: 'Folder where the tracks to be tagged are located.',
  })
  .option('threshold', {
    alias: ['t'],
    type: 'number',
    description: 'Threshold to be used to find Discogs best match. Default to 0.5.',
  })
  .option('answerYes', {
    alias: ['y'],
    type: 'boolean',
    description: 'Answer yes to program prompts. Useful to automatically tag large number of tracks.',
  })
  .check(({ threshold }) => {
    const isThresholdValid = typeof threshold === 'undefined' || (threshold >= 0 && threshold <= 1)

    if (!isThresholdValid) throw new Error(`Threshold argument must be between 0 and 1 (you provided ${threshold}).`)

    return true
  })
  .usage('Automatically tag tracks from Discogs!')
  .version()
  .help()

main(program.argv)
