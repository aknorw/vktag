import { Discojs } from 'discojs'
import glob from 'glob-promise'

const client = new Discojs()

const AUDIO_EXTENSIONS = ['aif', 'aiff', 'alac', 'flac', 'wav']

export async function getAudioFilesInFolder(path: string) {
  return glob(`${path}/*.@(${AUDIO_EXTENSIONS.join('|')})`, {
    nocase: true,
  })
}

function parseArtists(artists: ReadonlyArray<{ name: string }>) {
  return artists.map(({ name }) => name.replace(/\([0-9]*\)/g, '').trim())
}

// @TODO: Use `type_` to check for multiple track.
function parseTracklist(tracklist?: ReadonlyArray<{ position: string; title: string; type_: string }>) {
  if (!tracklist) return []

  return tracklist.map(({ position, title }) => ({
    position,
    title: title.trim(),
  }))
}

export async function getReleaseData(releaseId: number) {
  const { artists, styles, title, tracklist, year } = await client.getRelease(releaseId)

  return {
    artists: parseArtists(artists),
    title: title.trim(),
    year,
    genre: styles?.join(', '),
    tracks: parseTracklist(tracklist),
  }
}
