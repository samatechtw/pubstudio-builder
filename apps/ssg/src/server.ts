import http from 'node:http'
import { generateSite } from './lib/generate-site'
import { ISsgOptions, ISsgSiteInput, SSG_GENERATOR } from './lib/ssg-types'

// HTTP wrapper around generateSite, called by site-api at publish time.
// POST /api/generate { site: ISsgSiteInput, options?: ISsgOptions } -> ISsgResult

const MAX_BODY_BYTES = 50 * 1024 * 1024

interface IGenerateRequest {
  site: ISsgSiteInput
  options?: ISsgOptions
}

const readBody = (req: http.IncomingMessage): Promise<string> => {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    let size = 0
    req.on('data', (chunk: Buffer) => {
      size += chunk.length
      if (size > MAX_BODY_BYTES) {
        reject(new Error('Request body too large'))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

const sendJson = (res: http.ServerResponse, status: number, data: unknown) => {
  const body = JSON.stringify(data)
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  })
  res.end(body)
}

export const requestHandler = async (
  req: http.IncomingMessage,
  res: http.ServerResponse,
) => {
  const url = req.url?.split('?')[0]
  try {
    if (req.method === 'GET' && (url === '/api/healthz' || url === '/healthz')) {
      sendJson(res, 200, { status: 'ok', generator: SSG_GENERATOR })
    } else if (req.method === 'POST' && url === '/api/generate') {
      const body = await readBody(req)
      const request = JSON.parse(body) as IGenerateRequest
      if (!request?.site) {
        sendJson(res, 400, { error: 'Missing site input' })
        return
      }
      const start = Date.now()
      const result = await generateSite(request.site, request.options)
      console.log(
        `Generated site name=${request.site.name} pages=${result.pages.length}` +
          ` noJs=${result.noJs} in ${Date.now() - start}ms`,
      )
      sendJson(res, 200, result)
    } else {
      sendJson(res, 404, { error: 'Not found' })
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    console.error(`Generation failed: ${message}`)
    sendJson(res, 400, { error: message })
  }
}

// Note: not SSG_PORT — the Kubernetes service named `ssg` injects
// SSG_PORT=tcp://... service-link vars into pods in the namespace
const port = Number(process.env.PORT || 3200)
const host = process.env.HOST || '0.0.0.0'

const server = http.createServer((req, res) => {
  requestHandler(req, res).catch((e) => {
    console.error('Unhandled request error', e)
    if (!res.headersSent) {
      sendJson(res, 500, { error: 'Internal error' })
    }
  })
})

server.listen(port, host, () => {
  console.log(`${SSG_GENERATOR} listening on ${host}:${port}`)
})
