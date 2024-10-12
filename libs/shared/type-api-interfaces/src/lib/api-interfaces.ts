import { ApiResponse } from '@pubstudio/shared/type-api'
import {
  IGetLocalSiteApiRequest,
  IGetLocalSiteApiResponse,
  IUpdateLocalSiteApiRequest,
  IUpdateLocalSiteApiResponse,
} from '@pubstudio/shared/type-api-local-site'
import {
  ICreatePlatformSiteRequest,
  ICreatePlatformSiteResponse,
  IGetPlatformSiteApiResponse,
  IListPlatformSitesRequest,
  IListPlatformSitesResponse,
  IPublishPlatformSiteRequest,
  IUpdatePlatformSiteApiResponse,
  IUpdatePlatformSiteRequest,
} from '@pubstudio/shared/type-api-platform-site'
import {
  ICreatePlatformSiteAssetRequest,
  ICreatePlatformSiteAssetResponse,
  IListPlatformSiteAssetsRequest,
  IListPlatformSiteAssetsResponse,
  IReplacePlatformSiteAssetRequest,
  IReplacePlatformSiteAssetResponse,
  IUpdatePlatformSiteAssetRequest,
  IUpdatePlatformSiteAssetResponse,
  IVerifyPlatformSiteAssetResponse,
} from '@pubstudio/shared/type-api-platform-site-asset'
import {
  ICreatePlatformTemplateRequest,
  ICreatePlatformTemplateResponse,
  IGetPlatformTemplateResponse,
  IListPlatformTemplatesRequest,
  IListPlatformTemplatesResponse,
  IUpdatePlatformTemplateRequest,
  IUpdatePlatformTemplateResponse,
} from '@pubstudio/shared/type-api-platform-template'
import {
  IAddColumnApiRequest,
  IAddRowApiRequest,
  IAddRowApiResponse,
  ICreateTableApiRequest,
  ICreateTableResponse,
  IDeleteTableApiRequest,
  IListRowsApiQuery,
  IListRowsResponse,
  IListTablesApiQuery,
  IListTablesResponse,
  IModifyColumnApiRequest,
  IRemoveRowApiRequest,
  IUpdateRowApiRequest,
  IUpdateRowResponse,
  IUpdateTableApiRequest,
} from '@pubstudio/shared/type-api-site-custom-data'
import { FetchRequestConfig } from '@sampullman/fetch-api'
import { EnumFileFormat, IImageJobConfig } from '@samatech/image-api-types'

// Shim for PSApi, which is a utility class
export interface PSApiShim {
  authRequest<T = unknown>(config: FetchRequestConfig): Promise<ApiResponse<T>>
  authOptRequest<T = unknown>(config: FetchRequestConfig): Promise<ApiResponse<T>>
}

export interface IApiCustomData {
  listRows: (
    api: PSApiShim | undefined,
    query: IListRowsApiQuery,
  ) => Promise<IListRowsResponse>
  createTable: (
    api: PSApiShim | undefined,
    payload: ICreateTableApiRequest,
  ) => Promise<ICreateTableResponse>
  listTables: (
    api: PSApiShim | undefined,
    query: IListTablesApiQuery,
  ) => Promise<IListTablesResponse>
  addRow: (
    api: PSApiShim | undefined,
    payload: IAddRowApiRequest,
  ) => Promise<IAddRowApiResponse>
  updateRow: (
    api: PSApiShim | undefined,
    payload: IUpdateRowApiRequest,
  ) => Promise<IUpdateRowResponse>
  removeRow: (api: PSApiShim | undefined, payload: IRemoveRowApiRequest) => Promise<void>
  addColumn: (api: PSApiShim | undefined, payload: IAddColumnApiRequest) => Promise<void>
  modifyColumn: (
    api: PSApiShim | undefined,
    payload: IModifyColumnApiRequest,
  ) => Promise<void>
  updateTable: (
    api: PSApiShim | undefined,
    payload: IUpdateTableApiRequest,
  ) => Promise<void>
  deleteTable: (
    api: PSApiShim | undefined,
    payload: IDeleteTableApiRequest,
  ) => Promise<void>
}

export interface IApiLocalSite {
  updateLocalSite: (
    id: string,
    data: IUpdateLocalSiteApiRequest,
    keepalive?: boolean,
  ) => Promise<IUpdateLocalSiteApiResponse>
  // Wrapper for API compatibility with site-api `getSiteVersion`
  getLocalSiteVersion(
    siteId: string,
    versionId: string,
    query?: IGetLocalSiteApiRequest,
  ): Promise<IGetLocalSiteApiResponse | undefined>
  getLocalSite(
    siteId: string,
    query?: IGetLocalSiteApiRequest,
  ): Promise<IGetLocalSiteApiResponse | undefined>
}

export interface IApiPlatformSite {
  createSite: (data: ICreatePlatformSiteRequest) => Promise<ICreatePlatformSiteResponse>
  updateSite: (
    id: string,
    data: IUpdatePlatformSiteRequest,
  ) => Promise<IUpdatePlatformSiteApiResponse>
  publishSite: (id: string, data: IPublishPlatformSiteRequest) => Promise<void>
  listSites: (params: IListPlatformSitesRequest) => Promise<IListPlatformSitesResponse>
  getSite(siteId: string): Promise<IGetPlatformSiteApiResponse>
  deleteSite(siteId: string): Promise<void>
  addSiteDomain(siteId: string, domain: string): Promise<void>
  deleteSiteDomain(siteId: string, domain: string): Promise<void>
  verifySiteDomain(siteId: string, domain: string): Promise<void>
}

export interface IOptimizationParams extends IImageJobConfig {
  url: string
  file: File
  inputFormat: EnumFileFormat
  outputFormat: EnumFileFormat
  timeout?: number
}

export interface IApiSiteAsset {
  createSiteAsset: (
    data: ICreatePlatformSiteAssetRequest,
  ) => Promise<ICreatePlatformSiteAssetResponse>
  replaceSiteAsset: (
    id: string,
    data: IReplacePlatformSiteAssetRequest,
  ) => Promise<IReplacePlatformSiteAssetResponse>
  verifySiteAsset: (id: string) => Promise<IVerifyPlatformSiteAssetResponse>
  updateSiteAsset: (
    id: string,
    payload: IUpdatePlatformSiteAssetRequest,
  ) => Promise<IUpdatePlatformSiteAssetResponse>
  listSiteAssets: (
    params: IListPlatformSiteAssetsRequest,
  ) => Promise<IListPlatformSiteAssetsResponse>
  deleteSiteAsset: (id: string) => Promise<void>
  uploadFileWithSignedUrl(url: string, file: File): Promise<Response>
  uploadOptimizedFileWithSignedUrl(params: IOptimizationParams): Promise<void>
}

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
