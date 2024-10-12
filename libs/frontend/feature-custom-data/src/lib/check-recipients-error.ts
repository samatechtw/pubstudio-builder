export interface IRecipientError {
  errorKey: string
  index: number
}

export const checkRecipientsError = (
  recipients: string[],
): IRecipientError | undefined => {
  const len = recipients.length
  for (let i = 0; i < len; i += 1) {
    const recipient = recipients[i]
    if (recipient.length < 3 || recipient.length > 100 || !recipient?.includes('@')) {
      return {
        errorKey: 'errors.invalid_email',
        index: i,
      }
    }
  }
  return undefined
}
