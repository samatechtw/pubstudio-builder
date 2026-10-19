export enum ApiErrorCode {
  SignupsAtCapacity = 'SignupsAtCapacity',
  AuthEmailUnavailable = 'AuthEmailUnavailable',
  AuthEmailSendFailed = 'AuthEmailSendFailed',
  AccountCreatedEmailUnavailable = 'AccountCreatedEmailUnavailable',
  AccountCreatedEmailFailed = 'AccountCreatedEmailFailed',
  ChallengeFailed = 'ChallengeFailed',
  ChallengeUnavailable = 'ChallengeUnavailable',

  UpdateStale = 'UpdateStale',
  CollaborationConflict = 'CollaborationConflict',
  InvalidFormData = 'InvalidFormData',
}
