import { PSApi } from '@pubstudio/frontend/util-api'
import {
  ICreatePlatformTemplateRequest,
  ICreatePlatformTemplateResponse,
  IGetPlatformTemplateResponse,
  IListPlatformTemplatesRequest,
  IListPlatformTemplatesResponse,
  IUpdatePlatformTemplateRequest,
  IUpdatePlatformTemplateResponse,
} from '@pubstudio/shared/type-api-platform-template'
import { RequestParams } from '@sampullman/fetch-api'

export interface IApiTemplate {
  getTemplate(templateId: string): Promise<IGetPlatformTemplateResponse>
  createTemplate(
    payload: ICreatePlatformTemplateRequest,
  ): Promise<ICreatePlatformTemplateResponse>
  updateTemplate(
    templateId: string,
    payload: IUpdatePlatformTemplateRequest,
  ): Promise<IUpdatePlatformTemplateResponse>
  deleteTemplate(templateId: string): Promise<void>
  listTemplates(
    query: IListPlatformTemplatesRequest,
  ): Promise<IListPlatformTemplatesResponse>
}

export const useTemplateApi = (api: PSApi): IApiTemplate => {
  const getTemplate = async (
    templateId: string,
  ): Promise<IGetPlatformTemplateResponse> => {
    const { data } = await api.authRequest({
      url: `templates/${templateId}`,
      method: 'GET',
    })
    const serialized = data as IGetPlatformTemplateResponse
    return {
      id: serialized.id,
      collection_id: serialized.collection_id,
      description: serialized.description,
      categories: serialized.categories,
      name: serialized.name,
      preview_url: serialized.preview_url,
      version: serialized.version,
      context: JSON.parse(serialized.context),
      defaults: JSON.parse(serialized.defaults),
      pages: JSON.parse(serialized.pages),
      created_at: serialized.created_at,
      public: serialized.public,
    }
  }

  const listTemplates = async (
    params: IListPlatformTemplatesRequest,
  ): Promise<IListPlatformTemplatesResponse> => {
    const { data } = await api.authOptRequest({
      url: 'templates',
      method: 'GET',
      params: params as RequestParams,
    })
    return data as IListPlatformTemplatesResponse
  }

  const createTemplate = async (
    payload: ICreatePlatformTemplateRequest,
  ): Promise<ICreatePlatformTemplateResponse> => {
    const { data } = await api.authRequest({
      url: 'templates',
      method: 'POST',
      data: payload,
    })
    const serialized = data as ICreatePlatformTemplateResponse
    return {
      id: serialized.id,
      collection_id: serialized.collection_id,
      description: serialized.description,
      categories: serialized.categories,
      name: serialized.name,
      preview_url: serialized.preview_url,
      signed_preview_url: serialized.signed_preview_url,
      version: serialized.version,
      context: JSON.parse(serialized.context),
      defaults: JSON.parse(serialized.defaults),
      pages: JSON.parse(serialized.pages),
      created_at: serialized.created_at,
      public: serialized.public,
    }
  }

  const updateTemplate = async (
    templateId: string,
    payload: IUpdatePlatformTemplateRequest,
  ): Promise<IUpdatePlatformTemplateResponse> => {
    const { data } = await api.authRequest({
      url: `templates/${templateId}`,
      method: 'PATCH',
      data: payload,
    })
    const serialized = data as IUpdatePlatformTemplateResponse
    return {
      id: serialized.id,
      collection_id: serialized.collection_id,
      description: serialized.description,
      categories: serialized.categories,
      name: serialized.name,
      preview_url: serialized.preview_url,
      signed_preview_url: serialized.signed_preview_url,
      version: serialized.version,
      context: JSON.parse(serialized.context),
      defaults: JSON.parse(serialized.defaults),
      pages: JSON.parse(serialized.pages),
      created_at: serialized.created_at,
      public: serialized.public,
    }
  }

  const deleteTemplate = async (templateId: string): Promise<void> => {
    await api.authRequest({
      url: `templates/${templateId}`,
      method: 'DELETE',
    })
  }

  return {
    createTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplate,
    listTemplates,
  }
}
