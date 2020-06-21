const execa = require('execa')
const { packageName } = require('./constants')
const logger = require('./logger')
const { isMainExecutable, getEnvVars, getModulePaths, getNuxtCommand, findPackages } = require('./utils')

async function nuxtOptout () {
  // Return if this pkg was used as resolution for @nuxt/telemetry
  if (__dirname.endsWith('@nuxt/telemetry/lib')) {
    logger.info(`nuxt-optout has been used as resolution for ${packageName}`)
    return
  }

  logger.info(`Patching ${packageName} in all resolve paths`)
  await findPackages(packageName, getModulePaths())

  const isRunningAsMainExecutable = isMainExecutable()
  if (isRunningAsMainExecutable) {
    const [nuxtCmd, argv] = getNuxtCommand()

    logger.info(`Executing ${nuxtCmd}`)

    await execa(`node_modules/.bin/${nuxtCmd}`, argv, {
      stdout: process.stdout,
      stderr: process.stderr,
      stdin: process.stdin,
      env: getEnvVars()
    })
  }
}

module.exports = nuxtOptout
