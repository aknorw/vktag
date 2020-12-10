module.exports = {
  // Automatically clear mock calls and instances between every test
  clearMocks: true,
  // An array of file extensions your modules use
  moduleFileExtensions: ['ts', 'js'],
  preset: 'ts-jest',
  // A list of paths to directories that Jest should use to search for files in
  roots: ['<rootDir>'],
  // The regexp pattern Jest uses to detect test files
  testRegex: '/tests/.*\\.test\\.(ts|js)?$',
}
