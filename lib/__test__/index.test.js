const execa = require('execa')
const utils = require('../utils')
const nuxtOptout = require('../index')

jest.mock('execa')
jest.mock('../utils')

const noop = _ => _

describe('index', () => {
  afterEach(() => jest.restoreAllMocks())

  test('Not calling execa when not run as main executable', async () => {
    const pExit = jest.spyOn(process, 'exit').mockImplementation(noop)
    const findPackages = jest.spyOn(utils, 'findPackages').mockImplementation(noop)
    const getNuxtCommand = jest.spyOn(utils, 'getNuxtCommand').mockReturnValue(['test-cmd', 'argv'])
    const isMainExecutable = jest.spyOn(utils, 'isMainExecutable').mockReturnValue(false)

    await nuxtOptout()

    expect(pExit).not.toHaveBeenCalled()
    expect(findPackages).toHaveBeenCalled()
    expect(isMainExecutable).toHaveBeenCalled()
    expect(getNuxtCommand).not.toHaveBeenCalled()
    expect(execa).not.toHaveBeenCalled()
  })

  test('Not calling execa when not run as main executable', async () => {
    const pExit = jest.spyOn(process, 'exit').mockImplementation(noop)
    const findPackages = jest.spyOn(utils, 'findPackages').mockImplementation(noop)
    const getNuxtCommand = jest.spyOn(utils, 'getNuxtCommand').mockReturnValue(['test-cmd', 'argv'])
    const isMainExecutable = jest.spyOn(utils, 'isMainExecutable').mockReturnValue(true)

    await nuxtOptout()

    expect(pExit).not.toHaveBeenCalled()
    expect(findPackages).toHaveBeenCalled()
    expect(isMainExecutable).toHaveBeenCalled()
    expect(getNuxtCommand).toHaveBeenCalled()
    expect(execa).toHaveBeenCalled()
  })
})
