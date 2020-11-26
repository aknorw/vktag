import { askForReleaseId, getFilesFromFolder } from './prompts'

interface Parameters {
  releaseId?: number
  folder?: string
}

export async function main(params: Parameters) {
  const releaseId = params.releaseId ?? (await askForReleaseId())
  const files = await getFilesFromFolder(params.folder)

  console.log(releaseId, files)
}
