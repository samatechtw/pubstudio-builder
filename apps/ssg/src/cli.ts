import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { generateSite } from './lib/generate-site'
import { ISsgSiteInput } from './lib/ssg-types'

// CLI for local generation / full static exports:
//   npx esno --tsconfig apps/ssg/tsconfig.json apps/ssg/src/cli.ts \
//     --site site.json --out dist/ssg-out [--base-url https://example.com] \
//     [--runtime /_ps/site.js] [--no-js] [--force]
// The site JSON file holds an ISsgSiteInput (fields may be plain objects or
// JSON-encoded strings, e.g. copied from a site DB or API response).

interface ICliArgs {
  site: string
  out: string
  baseUrl?: string
  runtime?: string
  noJs: boolean
  force: boolean
}

const parseArgs = (argv: string[]): ICliArgs => {
  const args: Partial<ICliArgs> = { noJs: false, force: false }
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === '--site') {
      args.site = argv[(i += 1)]
    } else if (arg === '--out') {
      args.out = argv[(i += 1)]
    } else if (arg === '--base-url') {
      args.baseUrl = argv[(i += 1)]
    } else if (arg === '--runtime') {
      args.runtime = argv[(i += 1)]
    } else if (arg === '--no-js') {
      args.noJs = true
    } else if (arg === '--force') {
      args.force = true
    } else {
      throw new Error(`Unknown argument: ${arg}`)
    }
  }
  if (!args.site || !args.out) {
    throw new Error('Usage: cli.ts --site <site.json> --out <dir> [--base-url <url>]')
  }
  return args as ICliArgs
}

const routeToFile = (route: string): string => {
  if (route === '/') {
    return 'index.html'
  } else if (route === '/not-found') {
    return '404.html'
  } else if (route === '/sitemap.xml' || route === '/robots.txt') {
    return route.slice(1)
  }
  return path.join(route.replace(/^\//, ''), 'index.html')
}

const main = async () => {
  const args = parseArgs(process.argv.slice(2))
  const input = JSON.parse(await readFile(args.site, 'utf8')) as ISsgSiteInput
  const result = await generateSite(input, {
    baseUrl: args.baseUrl,
    noJs: args.noJs,
    force: args.force,
    runtimeSrc: args.runtime,
  })
  for (const page of result.pages) {
    const file = path.join(args.out, routeToFile(page.route))
    await mkdir(path.dirname(file), { recursive: true })
    await writeFile(file, page.body)
    console.log(`${page.route} -> ${file} (${page.body.length} bytes)`)
  }
  for (const warning of result.warnings) {
    console.warn(`WARNING: ${warning}`)
  }
  if (result.blockers.length) {
    console.log(
      `Interactive features (noJs blockers):\n  ${result.blockers.join('\n  ')}`,
    )
  }
  console.log(
    `Generated ${result.pages.length} files (noJs=${result.noJs}) with ${result.generator}`,
  )
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e)
  process.exit(1)
})
