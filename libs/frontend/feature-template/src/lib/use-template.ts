import { IApiTemplate, useTemplateApi } from '@pubstudio/frontend/data-access-api'
import { ApiInjectionKey } from '@pubstudio/frontend/data-access-injection'
import { parseApiErrorKey, PSApi, toApiError } from '@pubstudio/frontend/util-api'
import {
  GLOBAL_TEMPLATE_COLLECTION_ID,
  ICreatePlatformTemplateRequest,
  IGetPlatformTemplateResponse,
  IListPlatformTemplatesRequest,
  IListPlatformTemplatesResponse,
  IUpdatePlatformTemplateRequest,
} from '@pubstudio/shared/type-api-platform-template'
import { inject, Ref, ref } from 'vue'

export interface ITemplateFeature {
  api: IApiTemplate
  saving: Ref<boolean>
  saveError: Ref<string>
  listLoading: Ref<boolean>
  templates: Ref<IListPlatformTemplatesResponse | undefined>
  getTemplate: (id: string) => Promise<IGetPlatformTemplateResponse | undefined>
  listTemplates: (query?: IListPlatformTemplatesRequest) => Promise<void>
  createTemplate: (data: ICreatePlatformTemplateRequest) => Promise<void>
  updateTemplate: (id: string, data: IUpdatePlatformTemplateRequest) => Promise<void>
}

export const useTemplate = (): ITemplateFeature => {
  const rootApi = inject(ApiInjectionKey) as PSApi
  const api = useTemplateApi(rootApi)
  const saving = ref(false)
  const saveError = ref()
  const listLoading = ref(false)
  const templates = ref<IListPlatformTemplatesResponse>()

  const createTemplate = async (data: ICreatePlatformTemplateRequest): Promise<void> => {
    saving.value = true
    saveError.value = undefined
    try {
      await api.createTemplate(data)
    } catch (e) {
      saveError.value = parseApiErrorKey(toApiError(e))
    } finally {
      saving.value = false
    }
  }

  const updateTemplate = async (
    id: string,
    data: IUpdatePlatformTemplateRequest,
  ): Promise<void> => {
    saving.value = true
    saveError.value = undefined
    try {
      await api.updateTemplate(id, data)
    } catch (e) {
      saveError.value = parseApiErrorKey(toApiError(e))
    } finally {
      saving.value = false
    }
  }

  const getTemplate = async (
    id: string,
  ): Promise<IGetPlatformTemplateResponse | undefined> => {
    try {
      const template = await api.getTemplate(id)
      return template
    } catch (_e) {
      // TODO -- handle error
    }
  }

  const listTemplates = async (query?: IListPlatformTemplatesRequest): Promise<void> => {
    listLoading.value = true
    if (!query) {
      query = {}
    }
    if (!query.collection_id) {
      query.collection_id = GLOBAL_TEMPLATE_COLLECTION_ID
    }
    try {
      templates.value = await api.listTemplates(query)
    } catch (e) {
      console.log('Failed to list template:', e)
    } finally {
      listLoading.value = false
    }
  }

  return {
    api,
    saving,
    saveError,
    listLoading,
    templates,
    createTemplate,
    listTemplates,
    getTemplate,
    updateTemplate,
  }
}
