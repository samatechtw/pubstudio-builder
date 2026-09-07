import { CollaborationServerMessage, ICommandBatch } from '@pubstudio/shared/type-command'
import supertest from 'supertest'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

const waitForMessage = (
  socket: WebSocket,
  type: CollaborationServerMessage['type'],
): Promise<CollaborationServerMessage> =>
  new Promise((resolve, reject) => {
    const cleanup = () => {
      clearTimeout(timer)
      socket.removeEventListener('message', listener)
      socket.removeEventListener('close', closed)
      socket.removeEventListener('error', closed)
    }
    const closed = () => {
      cleanup()
      reject(new Error(`Socket closed waiting for ${type}`))
    }
    const listener = (event: MessageEvent) => {
      try {
        const message = JSON.parse(String(event.data)) as CollaborationServerMessage
        if (message.type !== type) return
        cleanup()
        resolve(message)
      } catch (error) {
        cleanup()
        reject(error)
      }
    }
    const timer = setTimeout(() => {
      cleanup()
      reject(new Error(`Timed out waiting for ${type}`))
    }, 3000)
    socket.addEventListener('message', listener)
    socket.addEventListener('close', closed)
    socket.addEventListener('error', closed)
  })

export const collaborationTests = (options: {
  name: string
  apiUrl: string
  endpoint: string
  snapshotEndpoint?: string
  auth: string
  otherOwnerAuth: string
  reset: () => Promise<unknown>
}) =>
  describe(options.name, () => {
    const { apiUrl, endpoint, auth, reset } = options
    const snapshotEndpoint = options.snapshotEndpoint ?? endpoint
    const api = supertest(apiUrl)
    const sockets: WebSocket[] = []
    beforeEach(reset)
    afterEach(() => {
      for (const socket of sockets.splice(0)) socket.close()
    })

    const submit = (batch: ICommandBatch, status = 200) =>
      api
        .post(`${endpoint}/operations`)
        .set('Authorization', auth)
        .send(batch)
        .expect(status)

    it('atomically merges non-overlapping stale batches and logs revisions', async () => {
      const initial = await api
        .get(snapshotEndpoint)
        .set('Authorization', auth)
        .expect(200)
      const context = JSON.parse(JSON.parse(initial.body.context))
      expect(initial.body.revision).toEqual(0)

      const contextBatch: ICommandBatch = {
        protocol_version: 1,
        batch_id: 'local-context-batch',
        client_id: 'local-client-a',
        base_revision: 0,
        commands: [
          {
            type: 'set',
            section: 'context',
            path: ['namespace'],
            expected: { kind: 'value', value: context.namespace },
            value: 'collaborative-namespace',
          },
        ],
      }
      const nameBatch: ICommandBatch = {
        protocol_version: 1,
        batch_id: 'local-name-batch',
        client_id: 'local-client-b',
        base_revision: 0,
        commands: [
          {
            type: 'set',
            section: 'name',
            path: [],
            expected: { kind: 'value', value: initial.body.name },
            value: 'Merged identity',
          },
        ],
      }

      const concurrent = await Promise.all([submit(contextBatch), submit(nameBatch)])
      expect(
        concurrent
          .map((response) => response.body.operation.revision)
          .sort((left, right) => left - right),
      ).toEqual([1, 2])

      const merged = await api
        .get(snapshotEndpoint)
        .set('Authorization', auth)
        .expect(200)
      expect(merged.body.name).toEqual('Merged identity')
      expect(JSON.parse(JSON.parse(merged.body.context)).namespace).toEqual(
        'collaborative-namespace',
      )
      expect(merged.body.revision).toEqual(2)

      const operations = await api
        .get(`${endpoint}/operations`)
        .query({ after_revision: 0 })
        .set('Authorization', auth)
        .expect(200)
      expect(
        operations.body.operations.map(
          (operation: { revision: number }) => operation.revision,
        ),
      ).toEqual([1, 2])
    })

    it('deduplicates retries and rejects conflicting batches without partial writes', async () => {
      const initial = await api
        .get(snapshotEndpoint)
        .set('Authorization', auth)
        .expect(200)
      const accepted: ICommandBatch = {
        protocol_version: 1,
        batch_id: 'local-deduplicated-batch',
        client_id: 'local-client',
        base_revision: 0,
        commands: [
          {
            type: 'set',
            section: 'name',
            path: [],
            expected: { kind: 'value', value: initial.body.name },
            value: 'Accepted name',
          },
        ],
      }
      await submit(accepted)
      const retry = await submit(accepted)
      expect(retry.body.duplicate).toEqual(true)
      expect(retry.body.operation.revision).toEqual(1)

      const conflict: ICommandBatch = {
        protocol_version: 1,
        batch_id: 'local-conflict-batch',
        client_id: 'local-client-other',
        base_revision: 0,
        commands: [
          {
            type: 'set',
            section: 'version',
            path: [],
            expected: { kind: 'value', value: initial.body.version },
            value: 'should-not-land',
          },
          {
            type: 'set',
            section: 'name',
            path: [],
            expected: { kind: 'value', value: initial.body.name },
            value: 'Rejected name',
          },
        ],
      }
      const rejected = await submit(conflict, 409)
      expect(rejected.body).toMatchObject({
        code: 'CollaborationConflict',
        conflict: { command_index: 1, reason: 'the scalar value changed' },
      })

      const current = await api
        .get(snapshotEndpoint)
        .set('Authorization', auth)
        .expect(200)
      expect(current.body.name).toEqual('Accepted name')
      expect(current.body.version).toEqual(initial.body.version)
      expect(current.body.revision).toEqual(1)
    })

    it('authenticates in the first socket message and pushes committed operations', async () => {
      const initial = await api
        .get(snapshotEndpoint)
        .set('Authorization', auth)
        .expect(200)
      const url = new URL(`${endpoint}/operations/ws`, apiUrl)
      url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
      const socket = new WebSocket(url)
      sockets.push(socket)
      const authenticated = waitForMessage(socket, 'authenticated')
      await new Promise<void>((resolve) =>
        socket.addEventListener('open', () => resolve()),
      )
      socket.send(
        JSON.stringify({
          type: 'authenticate',
          token: auth.slice('Bearer '.length),
          after_revision: 0,
        }),
      )
      await authenticated

      const operationMessage = waitForMessage(socket, 'operation')
      await submit({
        protocol_version: 1,
        batch_id: 'local-websocket-batch',
        client_id: 'local-websocket-client',
        base_revision: 0,
        commands: [
          {
            type: 'set',
            section: 'name',
            path: [],
            expected: { kind: 'value', value: initial.body.name },
            value: 'Socket identity name',
          },
        ],
      })
      await expect(operationMessage).resolves.toMatchObject({
        type: 'operation',
        operation: { batch_id: 'local-websocket-batch', revision: 1 },
      })
    })
    it('streams durable catch-up on reconnect and signals snapshot replacement', async () => {
      const initial = await api
        .get(snapshotEndpoint)
        .set('Authorization', auth)
        .expect(200)
      await submit({
        protocol_version: 1,
        batch_id: 'before-reconnect',
        client_id: 'other-client',
        base_revision: 0,
        commands: [
          {
            type: 'set',
            section: 'name',
            path: [],
            expected: { kind: 'value', value: initial.body.name },
            value: 'Before reconnect',
          },
        ],
      })
      const url = new URL(`${endpoint}/operations/ws`, apiUrl)
      url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
      const socket = new WebSocket(url)
      sockets.push(socket)
      const operation = waitForMessage(socket, 'operation')
      const caughtUp = waitForMessage(socket, 'revision')
      await new Promise<void>((resolve) =>
        socket.addEventListener('open', () => resolve(), { once: true }),
      )
      socket.send(
        JSON.stringify({
          type: 'authenticate',
          token: auth.slice('Bearer '.length),
          after_revision: 0,
        }),
      )
      await expect(operation).resolves.toMatchObject({
        operation: { batch_id: 'before-reconnect', revision: 1 },
      })
      await expect(caughtUp).resolves.toMatchObject({ current_revision: 1 })
      const resetMessage = waitForMessage(socket, 'snapshot_reset')
      await api
        .patch(endpoint)
        .set('Authorization', auth)
        .send({ name: 'Snapshot replacement' })
        .expect(200)
      await expect(resetMessage).resolves.toMatchObject({
        type: 'snapshot_reset',
        revision: 2,
      })
    })

    it('rejects unauthenticated sockets', async () => {
      const url = new URL(`${endpoint}/operations/ws`, apiUrl)
      url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
      const socket = new WebSocket(url)
      sockets.push(socket)
      const error = waitForMessage(socket, 'error')
      await new Promise<void>((resolve) =>
        socket.addEventListener('open', () => resolve(), { once: true }),
      )
      socket.send(
        JSON.stringify({ type: 'authenticate', token: 'invalid', after_revision: 0 }),
      )
      await expect(error).resolves.toMatchObject({ type: 'error', code: 'InvalidAuth' })
    })

    it('rejects another owner without modifying the canonical snapshot', async () => {
      const initial = await api
        .get(snapshotEndpoint)
        .set('Authorization', auth)
        .expect(200)
      await api
        .patch(endpoint)
        .set('Authorization', options.otherOwnerAuth)
        .send({ name: 'Unauthorized replacement' })
        .expect(403)
      const current = await api
        .get(snapshotEndpoint)
        .set('Authorization', auth)
        .expect(200)
      expect(current.body.name).toEqual(initial.body.name)
      expect(current.body.revision).toEqual(initial.body.revision)
      const url = new URL(`${endpoint}/operations/ws`, apiUrl)
      url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
      const socket = new WebSocket(url)
      sockets.push(socket)
      const error = waitForMessage(socket, 'error')
      await new Promise<void>((resolve) =>
        socket.addEventListener('open', () => resolve(), { once: true }),
      )
      socket.send(
        JSON.stringify({
          type: 'authenticate',
          token: options.otherOwnerAuth.slice('Bearer '.length),
          after_revision: 0,
        }),
      )
      await expect(error).resolves.toMatchObject({ type: 'error', code: 'Forbidden' })
    })

    it('rejects unsupported clients without changing state', async () => {
      const initial = await api
        .get(snapshotEndpoint)
        .set('Authorization', auth)
        .expect(200)
      const rejected = await submit(
        {
          protocol_version: 99,
          batch_id: 'unsupported',
          client_id: 'test',
          base_revision: 0,
          commands: [],
        },
        426,
      )
      expect(rejected.body.code).toEqual('ClientUpgradeRequired')
      const current = await api
        .get(snapshotEndpoint)
        .set('Authorization', auth)
        .expect(200)
      expect(current.body.revision).toEqual(initial.body.revision)
    })
  })
