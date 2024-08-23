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
  ICreateTableApiRequest,
  ICreateTableResponse,
  IListTablesApiQuery,
  IListTablesResponse,
} from '@pubstudio/shared/type-api-site-custom-data'
import { EnumFileFormat, IImageJobConfig } from '@samatech/image-api-types'

export interface IApiCustomData {
  createTable(payload: ICreateTableApiRequest): Promise<ICreateTableResponse>
  listTables(query: IListTablesApiQuery): Promise<IListTablesResponse>
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
