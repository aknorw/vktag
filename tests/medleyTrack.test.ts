import { main } from '../src/main'
import { mockFileSystem, testExpectedTags } from './helpers'

const filesAndTags = {
  '10 - Dance Medley.aiff': {
    title: 'Dance Medley',
    trackNumber: '10',
    artist: 'Nazia Hassan, Zoheb Hassan',
    album: 'Young Tarang',
    date: '1984-01-01',
    genre: 'Bollywood, Disco',
    publisher: 'Sirocco (2) (SG-SC 001)',
  },
}

const [beforeHook, afterHook] = mockFileSystem(Object.keys(filesAndTags))

beforeAll(beforeHook)
afterAll(afterHook)

it('should tag medley tracks', async () => {
  const parameters = {
    releaseId: 2763379,
    answerYes: true,
  }

  await main(parameters)

  await testExpectedTags(filesAndTags)
})
