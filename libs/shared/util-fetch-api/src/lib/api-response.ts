import { IJsonObject } from '@sampullman/fetch-api'

export class ApiResponse<T = IJsonObject> extends Response {
  data!: T
}
