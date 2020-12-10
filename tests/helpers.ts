import fs from 'fs'
import path from 'path'

import mockFS from 'mock-fs'
import type FileSystem from 'mock-fs/lib/filesystem'
import { Promise as id3, Tags } from 'node-id3'

// https://github.com/tschaub/mock-fs/issues/239#issuecomment-704939419
async function lazyLoadNodeModules(mockedFileSystem: FileSystem.DirectoryItems, from: string, depth = 6) {
  const stat = fs.lstatSync(from)

  if (stat.isDirectory() && depth > 0) {
    for (const item of fs.readdirSync(from)) {
      if (item.startsWith('.') || item === '@types') {
        continue
      }

      lazyLoadNodeModules(mockedFileSystem, path.join(from, item), depth - 1)
    }
  } else if (stat.isFile()) {
    mockedFileSystem[from] = mockFS.load(from, { lazy: true })
  }
}

const mockBuffer = Buffer.from([0x02, 0x06, 0x12, 0x22])

export function mockFileSystem(files: ReadonlyArray<string>) {
  const beforeHook = async () => {
    const mockedFileSystem = files.reduce(
      (acc, curr) => ({
        ...acc,
        [curr]: mockBuffer,
      }),
      {},
    )

    lazyLoadNodeModules(mockedFileSystem, path.resolve(path.join(process.cwd(), 'node_modules')))

    mockFS(mockedFileSystem)
  }

  const afterHook = async () => {
    mockFS.restore()
  }

  return [beforeHook, afterHook]
}

export async function testExpectedTags(filesAndTags: Record<string, { [tag: string]: string }>) {
  for await (const [file, expected] of Object.entries(filesAndTags)) {
    const buffer = await fs.promises.readFile(file)
    const tags = await id3.read(buffer)

    for (const [key, value] of Object.entries(expected)) {
      expect(tags[key as keyof Tags]).toEqual(value)
    }
  }
}
