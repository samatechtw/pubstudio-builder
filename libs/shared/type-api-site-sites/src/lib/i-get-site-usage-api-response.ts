export interface IGetSiteUsageApiResponse {
  site_size: number
  request_count: number
  request_error_count: number
  total_bandwidth: number
  bandwidth_allowance: number
  last_updated: Date
}
