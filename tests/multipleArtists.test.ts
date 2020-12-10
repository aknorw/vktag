import { main } from '../src/main'
import { mockFileSystem, testExpectedTags } from './helpers'

const filesAndTags = {
  "01 - No Man's An Island.aiff": {
    title: "No Man's An Island",
    trackNumber: '1',
    artist: 'Desi D',
    album: "No Man's An Island / Stay Away",
    genre: 'Lovers Rock, UK Street Soul',
    publisher: 'Not On Label (MT-001)',
  },
  '03 - Stay Away.aiff': {
    title: 'Stay Away',
    trackNumber: '3',
    artist: 'Chazzlyn',
    album: "No Man's An Island / Stay Away",
    genre: 'Lovers Rock, UK Street Soul',
    publisher: 'Not On Label (MT-001)',
  },
}

const [beforeHook, afterHook] = mockFileSystem(Object.keys(filesAndTags))

beforeAll(beforeHook)
afterAll(afterHook)

it('should tag tracks for a release with multiple artists', async () => {
  const parameters = {
    releaseId: 3076785,
    answerYes: true,
  }

  await main(parameters)

  await testExpectedTags(filesAndTags)
})
