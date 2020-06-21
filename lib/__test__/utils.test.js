const path = require('path')
const fs = require('fs-extra')
const utils = require('../utils')

function mockEnv (env, testFn) {
  const orig = {}
  for (const key in env) {
    orig[key] = env[key]
  }

  Object.assign(process.env, env)

  testFn()

  Object.assign(process.env, orig)
}

function mockArgv (argv, testFn) {
  const origArgv = process.argv.slice(0)
  process.argv = argv

  testFn()

  process.argv = origArgv
}

const noop = _ => _

describe('utils', () => {
  afterEach(() => jest.restoreAllMocks())

  test('getNpmEvent', () => {
    mockEnv({ npm_lifecycle_event: 'test' }, () => expect(utils.getNpmEvent()).toBe('test'))
  })

  test('getExecName', () => {
    mockArgv(['node', '/path/file.js'], () => expect(utils.getExecName()).toBe('file.js'))
  })

  test('isMainExecutable: predev', () => {
    mockArgv(['node', 'nuxt-optout'], () => mockEnv({ npm_lifecycle_event: 'predev' }, () => expect(utils.isMainExecutable()).toBe(false)))
  })

  test('isMainExecutable: dev', () => {
    mockEnv({ npm_lifecycle_event: 'dev' }, () => expect(utils.isMainExecutable()).toBe(false))
  })

  test('isMainExecutable: ./bin/run.js', () => {
    mockArgv(['node', './bin/run.js'], () => mockEnv({ npm_lifecycle_event: '' }, () => expect(utils.isMainExecutable()).toBe(true)))
  })

  test('isMainExecutable: nuxt-ts-optout', () => {
    mockArgv(['node', 'nuxt-ts-optout'], () => mockEnv({ npm_lifecycle_event: '' }, () => expect(utils.isMainExecutable()).toBe(true)))
  })

  test('getEnvVars', () => {
    expect(utils.getEnvVars()).toEqual(expect.any(Object))
  })

  test('getNuxtCommand', () => {
    mockArgv(['node', 'nuxt-optout', 'dev', 'src'], () => expect(utils.getNuxtCommand()).toStrictEqual(['nuxt', ['dev', 'src']]))
  })

  test('getModulePaths', () => {
    const paths = utils.getModulePaths()
    expect(Array.isArray(paths)).toBe(true)
    expect(paths.length).not.toBe(0)
  })

  test('stubFile', async () => {
    const outputFile = jest.spyOn(fs, 'outputFile').mockImplementation(noop)

    await utils.stubFile('/file')

    expect(outputFile).toHaveBeenCalledTimes(1)
    expect(outputFile).toHaveBeenCalledWith('/file', 'module.exports = function () {}')
  })

  test('stubPackage: not-yet disabled', async () => {
    const pExit = jest.spyOn(process, 'exit').mockImplementation(noop)
    const move = jest.spyOn(fs, 'move').mockImplementation(noop)
    const outputFile = jest.spyOn(fs, 'outputFile').mockImplementation(noop)

    await utils.findPackages('package1')

    expect(pExit).not.toHaveBeenCalled()

    expect(move).toHaveBeenCalledTimes(1)
    expect(move).toHaveBeenCalledWith(expect.stringContaining('/package.json'), expect.stringContaining('/package.disabled.json'))

    expect(outputFile).toHaveBeenCalledTimes(1)
    expect(outputFile).toHaveBeenCalledWith(expect.stringContaining('/file.js'), expect.any(String))
  })

  test('stubPackage: already disabled', async () => {
    const pExit = jest.spyOn(process, 'exit').mockImplementation(noop)
    const move = jest.spyOn(fs, 'move').mockImplementation(noop)
    const outputFile = jest.spyOn(fs, 'outputFile').mockImplementation(noop)

    await utils.findPackages('package2')

    expect(pExit).not.toHaveBeenCalled()
    expect(move).not.toHaveBeenCalled()
    expect(outputFile).toHaveBeenCalledTimes(1)
  })

  test('stubPackage: using subfolder with main & module', async () => {
    const pExit = jest.spyOn(process, 'exit').mockImplementation(noop)
    const move = jest.spyOn(fs, 'move').mockImplementation(noop)
    const outputFile = jest.spyOn(fs, 'outputFile').mockImplementation(noop)

    await utils.findPackages('package3')

    expect(pExit).not.toHaveBeenCalled()

    expect(move).toHaveBeenCalledTimes(1)
    expect(move).toHaveBeenCalledWith(expect.stringContaining('/package.json'), expect.stringContaining('/package.disabled.json'))

    expect(outputFile).toHaveBeenCalledTimes(2)
    expect(outputFile).toHaveBeenCalledWith(expect.stringContaining('/dist/main.js'), expect.any(String))
    expect(outputFile).toHaveBeenCalledWith(expect.stringContaining('/dist/module.js'), expect.any(String))
  })

  test('stubPackage: node_modules path', async () => {
    const pExit = jest.spyOn(process, 'exit').mockImplementation(noop)
    const move = jest.spyOn(fs, 'move').mockImplementation(noop)
    const outputFile = jest.spyOn(fs, 'outputFile').mockImplementation(noop)

    await utils.findPackages('package-4', [path.resolve(__dirname, '../__mocks__/node_modules')])

    expect(pExit).not.toHaveBeenCalled()

    expect(move).toHaveBeenCalledTimes(2)
    expect(move).toHaveBeenCalledWith(expect.stringContaining('__mocks__/node_modules/package-4/package.json'), expect.stringContaining('/package.disabled.json'))
    expect(move).toHaveBeenCalledWith(expect.stringContaining('__mocks__/node_modules/nuxt/node_modules/package-4/package.json'), expect.stringContaining('/package.disabled.json'))

    expect(outputFile).toHaveBeenCalledTimes(2)
    expect(outputFile).toHaveBeenCalledWith(expect.stringContaining('__mocks__/node_modules/package-4/file.js'), expect.any(String))
    expect(outputFile).toHaveBeenCalledWith(expect.stringContaining('__mocks__/node_modules/nuxt/node_modules/package-4/file.js'), expect.any(String))
  })
})
