export enum ApiErrorCode {
  SignupsAtCapacity = 'SignupsAtCapacity',
  AuthEmailUnavailable = 'AuthEmailUnavailable',
  AuthEmailSendFailed = 'AuthEmailSendFailed',
  AccountCreatedEmailUnavailable = 'AccountCreatedEmailUnavailable',
  AccountCreatedEmailFailed = 'AccountCreatedEmailFailed',

  UpdateStale = 'UpdateStale',
  CollaborationConflict = 'CollaborationConflict',
  InvalidFormData = 'InvalidFormData',
}
