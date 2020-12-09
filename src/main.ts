import { getReleaseData } from './helpers'
import { askForReleaseId, getFilesFromFolder, tagAudioFile } from './prompts'

interface Parameters {
  releaseId?: number
  folder?: string
}

export async function main(params: Parameters) {
  const releaseId = params.releaseId ?? (await askForReleaseId())
  const files = await getFilesFromFolder(params.folder)

  const releaseData = await getReleaseData(releaseId)

  console.log(releaseId, files)
  const availableTracks = new Set(Array.from(releaseData.tracks).map(({ position, title }) => `${position} - ${title}`))

  for (const file of files) {
    await tagAudioFile(file, releaseData, availableTracks)
  }
}
