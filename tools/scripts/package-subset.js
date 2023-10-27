// Generate a filtered package.json according to rules in subset.config.js
const { packageSubset } = require('./package-subset-module')

const usage = () => {
  console.info(`
    Generate a package.json with dependencies filtered on
      a whitelist of package names. Pass in an optional "patch" object
      to patch the package.json

    > node package-subset.js [target] [subsetFile] [pkgSource] [pkgDest]

    Example subset.config.js
      module.exports = {
        '[target]': {
          include: [
            'vite',
          ],
          patch: { "pnpm": {
            "neverBuiltDependencies": [
              "@parcel/watcher",
              "cypress"
            ]
          } },
        },
      };
  `)
}

const errorExit = (reason) => {
  usage()
  console.error(reason)
  process.exit(1)
}

const target = process.argv[2]
const subsetFile = process.argv[3]
const packageSource = process.argv[4]
const packageDestination = process.argv[5]

packageSubset({
  target,
  subsetFile,
  packageSource,
  packageDestination,
  onError: errorExit,
})
