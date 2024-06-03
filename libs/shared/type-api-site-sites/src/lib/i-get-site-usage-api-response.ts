export interface IGetSiteUsageApiResponse {
  site_size: number
  max_context_length: number
  max_history_length: number
  max_pages_length: number
  request_count: number
  request_error_count: number
  total_bandwidth: number
  bandwidth_allowance: number
  custom_data_usage: number
  custom_data_allowance: number
  last_updated: Date
}
