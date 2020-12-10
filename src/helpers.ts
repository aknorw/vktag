import { basename, extname } from 'path'

import { Discojs } from 'discojs'
import glob from 'glob-promise'
import { Promise as id3, Tags } from 'node-id3'
import { findBestMatch } from 'string-similarity'

const client = new Discojs()

const AUDIO_EXTENSIONS = ['aif', 'aiff', 'alac', 'flac', 'wav']

export async function getAudioFilesInFolder(path: string) {
  return glob(`${path}/*.@(${AUDIO_EXTENSIONS.join('|')})`, {
    nocase: true,
  })
}
interface Track {
  position: string
  trackNumber: number
  title: string
  type_?: string
}

export async function getReleaseData(releaseId: number) {
  const { artists, styles, title, tracklist, year, labels } = await client.getRelease(releaseId)

  const trimmedArtists = artists.map(({ name }) => name.replace(/\([0-9]*\)/g, '').trim())

  const trueLabels = labels.filter(({entity_type_name}) => entity_type_name === 'Label')
  const {name, catno} = trueLabels[0] ?? {};
  // @TODO: Check if catno is defined
  const publisher = name ? `${name.trim()} (${catno})` : undefined

  const tracklistMap = new Map<string, Track>()

  // @TODO: Use `type_` to check for multiple track.
  tracklist?.forEach(({ position, title }, index) => {
    const trimmedTitle = title.trim()

    tracklistMap.set(trimmedTitle, {
      position,
      trackNumber: index + 1,
      title: trimmedTitle,
    })
  })

  return {
    artists: trimmedArtists,
    album: title.trim(),
    publisher,
    year,
    genre: styles?.join(', '),
    tracks: tracklistMap,
  }
}

type Awaited<T> = T extends PromiseLike<infer U> ? Awaited<U> : T
export type ReleaseData = Awaited<ReturnType<typeof getReleaseData>>

interface FileBestMatch {
  track?: Track
  confidence: number
  isCandidate: boolean
}

function findBestMatchForFile(fileName: string, tracks: Map<string, Track>, bestMatchThreshold: number) {
  const trackNames = [...tracks.keys()]

  const {
    bestMatch: { target, rating },
  } = findBestMatch(fileName, trackNames)

  return {
    track: tracks.get(target),
    confidence: rating,
    isCandidate: rating >= bestMatchThreshold,
  }
}

export interface EnrichedFile extends FileBestMatch {
  file: string
  fileName: string
  hasPosition: boolean
}

const trackPositionRegExp = new RegExp('[a-z]?[0-9]+', 'i')

export function enrichFiles(
  files: Array<string>,
  releaseData: ReleaseData,
  bestMatchThreshold = 0.5,
): ReadonlyArray<EnrichedFile> {
  return files.map((file) => {
    const fileName = basename(file, extname(file))

    // Check if filename contains `01` or `A1` for example.
    const hasPosition = trackPositionRegExp.test(fileName)

    // Retrieve best match from Discogs tracks for this file.
    const bestMatch = findBestMatchForFile(fileName, releaseData.tracks, bestMatchThreshold)

    return {
      file,
      fileName,
      hasPosition,
      ...bestMatch,
    }
  })
}

// is partOfSet compilation?
export async function tagFile({ file }: EnrichedFile, tags: Tags) {
  await id3.update(tags, file)
}
