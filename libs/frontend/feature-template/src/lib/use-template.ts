import { IApiTemplate, useTemplateApi } from '@pubstudio/frontend/data-access-api'
import { createEditorContext } from '@pubstudio/frontend/data-access-command'
import { ApiInjectionKey } from '@pubstudio/frontend/data-access-injection'
import { parseApiErrorKey, PSApi, toApiError } from '@pubstudio/frontend/util-api'
import { S3_TEMPLATE_PREVIEWS_URL } from '@pubstudio/frontend/util-config'
import { serializeEditor } from '@pubstudio/frontend/util-site-store'
import {
  GLOBAL_TEMPLATE_COLLECTION_ID,
  ICreatePlatformTemplateRequest,
  IGetPlatformTemplateResponse,
  IListPlatformTemplatesRequest,
  IListPlatformTemplatesResponse,
  ITemplateViewModel,
  IUpdatePlatformTemplateRequest,
} from '@pubstudio/shared/type-api-platform-template'
import { IPage, ISerializedSite } from '@pubstudio/shared/type-site'
import { inject, Ref, ref } from 'vue'

export interface ITemplateFeature {
  api: IApiTemplate
  saving: Ref<boolean>
  templateError: Ref<string>
  listLoading: Ref<boolean>
  templates: Ref<IListPlatformTemplatesResponse | undefined>
  getTemplate: (id: string) => Promise<IGetPlatformTemplateResponse | undefined>
  listTemplates: (query?: IListPlatformTemplatesRequest) => Promise<void>
  createTemplate: (data: ICreatePlatformTemplateRequest) => Promise<void>
  updateTemplate: (id: string, data: IUpdatePlatformTemplateRequest) => Promise<void>
  templateToSerializedSite: (
    template: ITemplateViewModel | undefined,
  ) => ISerializedSite | undefined
}

export const templatePreviewUrl = (rel: string) => {
  return `url(${S3_TEMPLATE_PREVIEWS_URL}/${rel})`
}

export const useTemplate = (): ITemplateFeature => {
  const rootApi = inject(ApiInjectionKey) as PSApi
  const api = useTemplateApi(rootApi)
  const saving = ref(false)
  const templateError = ref()
  const listLoading = ref(false)
  const templates = ref<IListPlatformTemplatesResponse>()

  const createTemplate = async (data: ICreatePlatformTemplateRequest): Promise<void> => {
    saving.value = true
    templateError.value = undefined
    try {
      await api.createTemplate(data)
    } catch (e) {
      templateError.value = parseApiErrorKey(toApiError(e))
    } finally {
      saving.value = false
    }
  }

  const updateTemplate = async (
    id: string,
    data: IUpdatePlatformTemplateRequest,
  ): Promise<void> => {
    saving.value = true
    templateError.value = undefined
    try {
      await api.updateTemplate(id, data)
    } catch (e) {
      templateError.value = parseApiErrorKey(toApiError(e))
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

  const templateToSerializedSite = (
    template: ITemplateViewModel | undefined,
  ): ISerializedSite | undefined => {
    if (template) {
      const pages = JSON.parse(template.pages)
      const homePage = Object.values(pages)[0] as IPage
      return {
        name: template.name,
        version: template.version,
        context: JSON.parse(template.context),
        defaults: JSON.parse(template.defaults),
        editor: serializeEditor(createEditorContext(homePage)),
        history: { back: [], forward: [] },
        pages,
        pageOrder: JSON.parse(template.pageOrder ?? null) || Object.keys(pages),
      }
    }
  }

  return {
    api,
    saving,
    templateError,
    listLoading,
    templates,
    createTemplate,
    listTemplates,
    getTemplate,
    updateTemplate,
    templateToSerializedSite,
  }
}
