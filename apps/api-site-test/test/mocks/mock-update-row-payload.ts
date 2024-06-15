import { IUpdateRowApiRequest } from '@pubstudio/shared/type-api-site-custom-data'

export const mockUpdateRowPayload1 = (): IUpdateRowApiRequest => {
  return {
    table_name: 'contact_form',
    row_id: 1,
    new_row: {
      name: 'Jessie',
      message: 'Hello there!',
      email: 'jjj@abc.com',
    },
  }
}

export const mockUpdateRowPayload2 = (): IUpdateRowApiRequest => {
  return {
    table_name: 'contact_form',
    row_id: 1,
    new_row: {
      name: 'Albert',
    },
  }
}

export const mockUpdateInvalidRow1 = (): IUpdateRowApiRequest => {
  return {
    table_name: 'contact_form',
    row_id: 1,
    new_row: {
      name: 'Andy',
    },
  }
}

export const mockUpdateInvalidRow2 = (): IUpdateRowApiRequest => {
  return {
    table_name: 'contact_form',
    row_id: 1,
    new_row: {
      message: '',
    },
  }
}

export const mockUpdateInvalidRow3 = (): IUpdateRowApiRequest => {
  return {
    table_name: 'contact_form',
    row_id: 1,
    new_row: {
      message: '1234567890'.repeat(11),
    },
  }
}

export const mockUpdateInvalidRow4 = (email: string): IUpdateRowApiRequest => {
  return {
    table_name: 'contact_form',
    row_id: 1,
    new_row: { email },
  }
}
