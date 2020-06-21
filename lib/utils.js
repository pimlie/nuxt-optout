const path = require('path')
const fs = require('fs-extra')
const { cliAliases, distributionNames, mainFields } = require('./constants')
const logger = require('./logger')

function getNpmEvent () {
  return process.env.npm_lifecycle_event || ''
}

function getExecName () {
  return path.basename(process.argv[1])
}

function isMainExecutable () {
  const executableName = getExecName()
  if (cliAliases.includes(executableName)) {
    return true
  }

  const npmEvent = getNpmEvent()
  return !npmEvent
}

function getEnvVars () {
  return {
    NUXT_TELEMETRY_DISABLED: 'true',
    NUXT_TELEMETRY_ENDPOINT: 'http://127.0.0.1'
  }
}

function getNuxtCommand () {
  let nuxtCmd = getExecName().replace(/-optout$/i, '')

  /* istanbul ignore next */
  if (nuxtCmd === 'run.js') {
    // In case its run directly (ie when testing)
    nuxtCmd = 'nuxt'
  }

  const argv = process.argv.slice(2)

  return [nuxtCmd, argv]
}

function getModulePaths () {
  return module.paths
}

async function findPackages (pkgName, resolvePaths = []) {
  try {
    const extraPaths = [process.cwd()]

    // Package could also be stored within distribution folder
    // in node_modules if there are multiple versions used
    // Note: this is only to cover all cases as this isnt
    // of influence how Nuxt.js resolve module paths
    for (const distributionName of distributionNames) {
      try {
        extraPaths.push(require.resolve(distributionName))
      } catch (err) {}
    }

    for (const extraPath of extraPaths) {
      // Walk all node_modules up the folder tree
      if (!resolvePaths.includes(`${extraPath}/node_modules`)) {
        let basePwd = extraPath

        while (basePwd.length) {
          const resolvePath = `${basePwd}${basePwd.endsWith('/') ? '' : '/'}node_modules`
          if (!resolvePaths.includes(resolvePath)) {
            resolvePaths.push(resolvePath)
          }

          const parentPwd = path.dirname(basePwd)

          if (basePwd === parentPwd) {
            break
          }

          basePwd = parentPwd
        }
      }
    }

    for (const modulePath of resolvePaths) {
      if (await fs.pathExists(modulePath) && await fs.pathExists(`${modulePath}/${pkgName}`)) {
        await stubPackage(pkgName, modulePath)
      }
    }

    // Lets make absolutely sure we have included the main resolve path for $pkgName
    // eg needed for the tests so we can use jest's moduleNameMapper
    let resolvedPath
    try {
      resolvedPath = require.resolve(`${pkgName}/package.json`)
    } catch (err) {
      try {
        resolvedPath = require.resolve(`${pkgName}/package.disabled.json`)
      } catch (err) {
        throw new Error(`${pkgName} could not be resolved using require.resolve`)
      }
    }

    if (resolvedPath) {
      while (resolvedPath.length > 1 && !resolvedPath.endsWith('node_modules')) {
        resolvedPath = path.dirname(resolvedPath)
      }

      if (!resolvePaths.includes(resolvedPath)) {
        await stubPackage(pkgName, resolvedPath)
      }
    }
  } catch (err) {
    logger.fatal(`An error occured while stubbing the ${pkgName} package:`, err)
    process.exit(1)
  }
}

async function stubPackage (pkgName, pkgPath) {
  let pkg, pkgJsonPath

  try {
    pkgJsonPath = path.join(pkgPath, pkgName, 'package.json')
    pkg = require(pkgJsonPath)

    await fs.move(pkgJsonPath, `${pkgJsonPath.slice(0, -4)}disabled.json`)
  } catch (err) {
    pkgJsonPath = path.join(pkgPath, pkgName, 'package.disabled.json')
    pkg = require(pkgJsonPath)
  }

  const basePath = path.dirname(pkgJsonPath)

  const promises = []
  for (const field of mainFields) {
    if (!pkg[field]) {
      continue
    }

    const filePath = path.join(basePath, pkg[field])
    promises.push(stubFile(filePath))
  }

  await Promise.all(promises)
}

function stubFile (filePath) {
  // TODO: we could make this more generic
  return fs.outputFile(filePath, 'module.exports = function () {}')
}

module.exports = {
  isMainExecutable,
  getEnvVars,
  getExecName,
  getModulePaths,
  getNpmEvent,
  getNuxtCommand,
  findPackages,
  stubPackage,
  stubFile
}
