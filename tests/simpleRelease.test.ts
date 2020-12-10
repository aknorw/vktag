import { main } from '../src/main'
import { mockFileSystem, testExpectedTags } from './helpers'

const filesAndTags = {
  '01 - Coeur Samba.aiff': {
    title: 'Coeur Samba',
    trackNumber: '1',
    artist: 'Barbara Bright',
    album: 'Coeur Samba',
    date: '1988-01-01',
    genre: 'Chanson',
    publisher: 'Triangle International (TRI 8826)',
  },
  '02 - Coeur Samba (Instrumental).aiff': {
    title: 'Coeur Samba (Instrumental)',
    trackNumber: '2',
    artist: 'Barbara Bright',
    album: 'Coeur Samba',
    date: '1988-01-01',
    genre: 'Chanson',
    publisher: 'Triangle International (TRI 8826)',
  },
}

const [beforeHook, afterHook] = mockFileSystem(Object.keys(filesAndTags))

beforeAll(beforeHook)
afterAll(afterHook)

it('should tag tracks for a simple release', async () => {
  const parameters = {
    releaseId: 11050908,
    answerYes: true,
  }

  await main(parameters)

  await testExpectedTags(filesAndTags)
})
