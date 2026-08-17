import { IUseSiteSource } from '@pubstudio/frontend/feature-site-store'
import { IApiError } from '@pubstudio/shared/type-api'
import { ISite, SiteSaveState } from '@pubstudio/shared/type-site'
import { computed, reactive, ref } from 'vue'
import { makeTestSite } from '../op/test-site'
import { endSession, formatSaveError, startSession } from './session'
import { status } from './status'

interface IFakeSourceOptions {
  apiSiteId?: string
  saveError?: IApiError
  lastSavedAt?: number
}

// Mirrors useSiteSource: a reactive() store whose refs unwrap on read.
const fakeSource = (site: ISite, options: IFakeSourceOptions): IUseSiteSource =>
  ({
    site: ref(site),
    apiSiteId: ref(options.apiSiteId),
    isSaving: computed(() => false),
    isSiteApi: computed(
      () =>
        !!options.apiSiteId &&
        options.apiSiteId !== 'scratch' &&
        options.apiSiteId !== 'identity',
    ),
    siteStore: reactive({
      saveState: ref(SiteSaveState.Saved),
      saveError: ref(options.saveError),
      lastSavedAt: ref(options.lastSavedAt),
    }),
  }) as unknown as IUseSiteSource

describe('status save reporting', () => {
  let site: ISite

  const install = (options: IFakeSourceOptions) => {
    startSession(fakeSource(site, options))
  }

  beforeEach(() => {
    site = makeTestSite()
  })

  afterEach(() => {
    endSession()
  })

  it('treats an identity site as remote-backed', () => {
    install({ apiSiteId: 'identity' })
    const result = status()
    expect(result.storage).toEqual('api')
    expect(result.saveStateMeaningful).toEqual(true)
  })

  it('treats a scratch site as local', () => {
    install({ apiSiteId: 'scratch' })
    const result = status()
    expect(result.storage).toEqual('local')
    expect(result.saveStateMeaningful).toEqual(false)
  })

  it('reports a failed save that saveState hides', () => {
    install({
      apiSiteId: 'identity',
      saveError: {
        status: 400,
        code: 'UpdateStale',
        message: 'update_key did not match',
      },
      lastSavedAt: 1000,
    })
    const result = status()
    expect(result.saveState).toEqual(SiteSaveState.Saved)
    expect(result.lastSaveError).toEqual('400 UpdateStale: update_key did not match')
    expect(result.lastSavedAt).toEqual(1000)
  })

  it('omits the error when the last save succeeded', () => {
    install({ apiSiteId: 'identity', lastSavedAt: 1000 })
    expect(status().lastSaveError).toBeUndefined()
  })
})

describe('formatSaveError', () => {
  it('is undefined for no error', () => {
    expect(formatSaveError(undefined)).toBeUndefined()
  })

  it('falls back to the status and code when there is no message', () => {
    expect(formatSaveError({ status: 500, code: 'InternalError' })).toEqual(
      '500 InternalError',
    )
  })

  it('never returns an empty string', () => {
    expect(formatSaveError({ status: 0, code: '' })).toEqual('Unknown save error')
  })

  it('does not emit a dangling separator when only a message is present', () => {
    expect(formatSaveError({ status: 0, code: '', message: 'network down' })).toEqual(
      'network down',
    )
  })
})
