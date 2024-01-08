import fs from 'fs'
import path from 'path'

export const packageSubset = async ({
  target,
  subsetFile,
  packageSource,
  packageDestination,
  onError,
}) => {
  const checkParam = (param, reason) => {
    if (!param) {
      onError(reason)
    }
  }

  const filterDeps = (deps, include) => {
    const newDeps = {}
    for (const [dep, version] of Object.entries(deps)) {
      if (include.includes(dep)) {
        newDeps[dep] = version
      }
    }
    return newDeps
  }

  checkParam(target !== '-h', 'Usage:')
  checkParam(target, 'Missing target arg')
  checkParam(target, 'Missing subset file')

  let subset
  try {
    const subsetPath = path.resolve(subsetFile)
    checkParam(fs.existsSync(subsetPath), 'Subset file not found')
    subset = (await import(subsetPath)).default
    checkParam(subset && subset[target], `Target ${target} not found in subset.config.js`)
  } catch (_e) {
    onError(`Unable to resolve subset file: ${subsetFile}`)
  }

  let pkg
  try {
    checkParam(packageSource, 'Missing source package.json location')
    checkParam(packageDestination, 'Missing destination package.json location')

    pkg = await import(path.resolve(packageSource), { assert: { type: 'json' } })
    pkg = pkg.default
  } catch (_e) {
    onError(`Unable to resolve source package.json: ${packageSource}`)
  }

  const { dependencies, devDependencies } = pkg
  const include = subset[target].include || []
  const patch = subset[target].patch || {}

  // Delete scripts prepare section in the generated file
  if (pkg.scripts.prepare) {
    delete pkg.scripts.prepare
  }

  if (dependencies) {
    pkg.dependencies = filterDeps(dependencies, include)
  }

  if (devDependencies) {
    pkg.devDependencies = filterDeps(devDependencies, include)
  }

  pkg = { ...pkg, ...patch }

  try {
    const destPath = path.resolve(packageDestination)
    fs.writeFileSync(destPath, JSON.stringify(pkg, null, 2))
    console.info(`Successfully wrote package subset to ${destPath}`)
  } catch (_e) {
    onError('Failed to write to pkgDest')
  }
}
