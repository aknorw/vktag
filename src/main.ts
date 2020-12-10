import { enrichFiles, getReleaseData } from './helpers'
import { askForAutoTagConfirmation, askForReleaseId, getFilesFromFolder, tagEnrichedFiles } from './prompts'

interface Parameters {
  releaseId?: number
  folder?: string
  threshold?: number
  answerYes?: boolean
}

export async function main(params: Parameters) {
  const releaseId = params.releaseId ?? (await askForReleaseId())
  const files = await getFilesFromFolder(params.folder)

  const releaseData = await getReleaseData(releaseId)

  const enrichedFiles = enrichFiles(files, releaseData, params.threshold)

  // If every file has a position and a best match, maybe ask if the user wants to auto-tags tracks.
  const shouldAutoTag = enrichedFiles.every(({ hasPosition, isCandidate }) => hasPosition && isCandidate)
    ? params.answerYes
      ? true
      : await askForAutoTagConfirmation()
    : false

  await tagEnrichedFiles(enrichedFiles, releaseData, shouldAutoTag)
}
