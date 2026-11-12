export interface IRegisterUserApiRequest {
  email: string
  password: string
  identity: string
  subdomain: string
  challenge_token?: string
}
