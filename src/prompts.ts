import process from 'process'

import inquirer from 'inquirer'

import { EnrichedFile, getAudioFilesInFolder, ReleaseData, tagFile } from './helpers'

export async function askForReleaseId() {
  const { id } = await inquirer.prompt({
    type: 'number',
    name: 'id',
    message: '💿 Discogs release id',
    filter: (input) => (!Number.isNaN(input) ? input : undefined),
    validate: (input) => Boolean(input) || '❌ You must enter a valid release id!',
  })

  return id as number
}

async function askForFolder() {
  const { folder } = await inquirer.prompt({
    type: 'input',
    name: 'folder',
    message: '📂 Folder where the tracks are located',
    filter: (input) => (input.trim().length > 0 ? input : undefined),
    validate: (input) => Boolean(input) || '❌ You must enter a valid folder!',
  })

  return folder as string
}

export async function getFilesFromFolder(path?: string, forceUseCwd?: boolean): Promise<Array<string>> {
  const hasPath = Boolean(path)
  const folder = path || process.cwd()

  const files = await getAudioFilesInFolder(folder)

  console.log(`🎵 Found ${files.length} audio files in folder ${folder}`)

  if (!files.length) {
    const chosenFolder = await askForFolder()
    return getFilesFromFolder(chosenFolder)
  }

  // If `path` is undefined, it means we found audio files in the current working directory.
  // Ask the user to confirm we should use them.
  if (!hasPath && files.length > 0 && !forceUseCwd) {
    const { shouldUseCwd } = await inquirer.prompt({
      type: 'confirm',
      name: 'shouldUseCwd',
      message: '❓ Do you want to continue?',
    })

    if (!shouldUseCwd) {
      const chosenFolder = await askForFolder()
      return getFilesFromFolder(chosenFolder)
    }
  }

  return files
}

export async function askForAutoTagConfirmation(enrichedFiles: ReadonlyArray<EnrichedFile>) {
  // Display what has been found to let the user know we're smart (or not).
  enrichedFiles.forEach(({ fileName, track, confidence }) => {
    const { position, title } = track!
    console.log(`🧲 ${fileName} ➡️  ${position} - ${title} (${(100 * confidence).toFixed(0)}% confident)`)
  })

  const { shouldAutoTag } = await inquirer.prompt({
    type: 'confirm',
    name: 'shouldAutoTag',
    message: '🤖 VKtag is able to automatically tag your files, do you want to continue?',
  })

  return shouldAutoTag as boolean
}

export async function tagEnrichedFiles(
  enrichedFiles: ReadonlyArray<EnrichedFile>,
  { album, publisher, date, genre, tracks }: ReleaseData,
  shouldAutoTag = false,
) {
  for await (const file of enrichedFiles) {
    const { chosenTrack } = shouldAutoTag
      ? { chosenTrack: file.track!.title }
      : await inquirer.prompt({
          type: 'list',
          name: 'chosenTrack',
          message: `🔗 Choose track for ${file.fileName}`,
          choices: [...tracks.keys()],
        })

    const { artists, title, trackNumber } = tracks.get(chosenTrack)!

    // Remove chosen track from the tracklist to avoid displaying it in future prompts.
    tracks.delete(chosenTrack)

    // Create tags for the file.
    const tags = {
      title,
      trackNumber: trackNumber.toString(),
      artist: artists.join(' / '),
      album,
      date,
      genre,
      publisher,
    }

    await tagFile(file, tags)

    // If autotagging files, display something in the console to let the user know that we're doing something.
    if (shouldAutoTag) console.log(`🔖 ${file.fileName} has been tagged!`)
  }

  console.log('🎉 All files have been tagged!')
}
