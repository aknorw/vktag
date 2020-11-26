import process from 'process'

import inquirer from 'inquirer'

import { getAudioFilesInFolder } from './helpers'

export async function askForReleaseId() {
  const { id } = await inquirer.prompt({
    type: 'number',
    name: 'id',
    message: 'Discogs release id',
    filter: (input) => (!Number.isNaN(input) ? input : undefined),
    validate: (input) => Boolean(input) || 'You must enter a valid release id!',
  })

  return id as number
}

async function askForFolder() {
  const { folder } = await inquirer.prompt({
    type: 'input',
    name: 'folder',
    message: 'Folder where the tracks are located',
    filter: (input) => (input.trim().length > 0 ? input : undefined),
    validate: (input) => Boolean(input) || 'You must enter a valid folder!',
  })

  return folder as string
}

export async function getFilesFromFolder(path?: string): Promise<Array<string>> {
  const hasPath = Boolean(path)
  const folder = path || process.cwd()

  const files = await getAudioFilesInFolder(folder)

  console.log(`Found ${files.length} in folder ${folder}`) // @TODO: Add chalk.

  if (!files.length) {
    const chosenFolder = await askForFolder()
    return getFilesFromFolder(chosenFolder)
  }

  // If `path` is undefined, it means we found audio files in the current working directory.
  // Ask the user to confirm we should use them.
  if (!hasPath && files.length > 0) {
    const { shouldUseCwd } = await inquirer.prompt({
      type: 'confirm',
      name: 'shouldUseCwd',
      message: 'Do you want to continue?',
    })

    if (!shouldUseCwd) {
      const chosenFolder = await askForFolder()
      return getFilesFromFolder(chosenFolder)
    }
  }

  return files
}
