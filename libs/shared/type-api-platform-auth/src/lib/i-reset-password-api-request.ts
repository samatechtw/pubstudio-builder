export interface IResetPasswordApiRequest {
  email: string
  challenge_token?: string
}
