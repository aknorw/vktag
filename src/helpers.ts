import glob from 'glob-promise'

const AUDIO_EXTENSIONS = ['aif', 'aiff', 'alac', 'flac', 'wav']

export async function getAudioFilesInFolder(path: string) {
  return glob(`${path}/*.@(${AUDIO_EXTENSIONS.join('|')})`, {
    nocase: true
  })
}
