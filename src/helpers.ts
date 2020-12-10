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
  artists: ReadonlyArray<string>
  type_?: string
}

function trimArtistName({ name }: { name: string }) {
  return name.replace(/\([0-9]*\)/g, '').trim()
}

export async function getReleaseData(releaseId: number) {
  const { artists, styles, title, tracklist, year, labels } = await client.getRelease(releaseId)

  const trimmedArtists = artists.map(trimArtistName)

  const trueLabels = labels.filter(({ entity_type_name }) => entity_type_name === 'Label')
  const { name, catno } = trueLabels[0] ?? {}
  let publisher = name?.trim()
  if (catno) publisher += ` (${catno})`

  const date = year ? `${year}-01-01` : undefined

  const tracklistMap = new Map<string, Track>()

  // Medley tracks have `type_` set to `heading`.
  // As a first step, we'll simply filter out tracks that contain a dot.
  tracklist
    ?.filter(({ position }) => !position.includes('.'))
    .forEach((track, index) => {
      const trimmedTitle = track.title.trim()

      tracklistMap.set(trimmedTitle, {
        position: track.position,
        trackNumber: index + 1,
        title: trimmedTitle,
        // @TODO: Add `artists` in tracklist in Discojs.
        // @ts-ignore
        artists: track.artists?.map(trimArtistName) ?? trimmedArtists,
      })
    })

  return {
    album: title.trim(),
    publisher,
    date,
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
