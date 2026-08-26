import { ICommandBatch } from '@pubstudio/shared/type-command'
import { SiteApiResetService } from '@pubstudio/shared/util-test-reset'
import supertest from 'supertest'
import TestAgent from 'supertest/lib/agent'
import { adminAuthHeader, ownerAuthHeader } from '../helpers/auth-helpers'
import { SITE_SEEDS } from '../mocks/site-seeds'
import { testConfig } from '../test.config'

describe('Hosted Site Collaboration', () => {
  const siteId = '6d2c8359-6094-402c-bcbb-37202fd7c336'
  const endpoint = `/api/sites/${siteId}`
  let api: TestAgent
  let reset: SiteApiResetService
  let auth: string

  beforeAll(() => {
    api = supertest(testConfig.get('apiUrl'))
    auth = ownerAuthHeader('903b3c28-deaa-45dc-a43f-511fe965d34e')
    reset = new SiteApiResetService(
      'http://127.0.0.1:3100',
      adminAuthHeader(),
      SITE_SEEDS,
    )
  })

  beforeEach(() => reset.reset())

  const submit = (batch: ICommandBatch, status = 200) =>
    api
      .post(`${endpoint}/operations`)
      .set('Authorization', auth)
      .send(batch)
      .expect(status)

  it('merges stale non-overlapping batches and exposes ordered catch-up', async () => {
    const initial = await api
      .get(`${endpoint}/versions/latest`)
      .set('Authorization', auth)
      .expect(200)
    const context = JSON.parse(JSON.parse(initial.body.context))
    const contextBatch: ICommandBatch = {
      protocol_version: 1,
      batch_id: 'hosted-context-batch',
      client_id: 'hosted-client-a',
      base_revision: 0,
      commands: [
        {
          type: 'set',
          section: 'context',
          path: ['namespace'],
          expected: { kind: 'value', value: context.namespace },
          value: 'hosted-collaboration',
        },
      ],
    }
    const nameBatch: ICommandBatch = {
      protocol_version: 1,
      batch_id: 'hosted-name-batch',
      client_id: 'hosted-client-b',
      base_revision: 0,
      commands: [
        {
          type: 'set',
          section: 'name',
          path: [],
          expected: { kind: 'value', value: initial.body.name },
          value: 'Merged hosted site',
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
      .get(`${endpoint}/versions/latest`)
      .set('Authorization', auth)
      .expect(200)
    expect(merged.body.name).toEqual('Merged hosted site')
    expect(JSON.parse(JSON.parse(merged.body.context)).namespace).toEqual(
      'hosted-collaboration',
    )
    expect(merged.body.revision).toEqual(2)

    const catchup = await api
      .get(`${endpoint}/operations`)
      .query({ after_revision: 0 })
      .set('Authorization', auth)
      .expect(200)
    expect(catchup.body.operations).toHaveLength(2)
    expect(catchup.body.current_revision).toEqual(2)
  })

  it('is retry-idempotent and rejects unsupported clients without changing state', async () => {
    const initial = await api
      .get(`${endpoint}/versions/latest`)
      .set('Authorization', auth)
      .expect(200)
    const batch: ICommandBatch = {
      protocol_version: 1,
      batch_id: 'hosted-retry-batch',
      client_id: 'hosted-client',
      base_revision: 0,
      commands: [
        {
          type: 'set',
          section: 'name',
          path: [],
          expected: { kind: 'value', value: initial.body.name },
          value: 'Accepted hosted name',
        },
      ],
    }
    await submit(batch)
    expect((await submit(batch)).body).toMatchObject({
      duplicate: true,
      operation: { revision: 1 },
    })

    const unsupported = { ...batch, batch_id: 'newer-client', protocol_version: 99 }
    const rejected = await submit(unsupported, 426)
    expect(rejected.body.code).toEqual('ClientUpgradeRequired')
    const current = await api
      .get(`${endpoint}/versions/latest`)
      .set('Authorization', auth)
      .expect(200)
    expect(current.body.name).toEqual('Accepted hosted name')
    expect(current.body.revision).toEqual(1)
  })
})
