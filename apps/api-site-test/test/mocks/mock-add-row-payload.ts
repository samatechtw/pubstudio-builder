import { IAddRowApiRequest } from '@pubstudio/shared/type-api-site-custom-data'

export const mockAddRowPayload1 = (): IAddRowApiRequest => {
  return {
    table_name: 'contact_form',
    row: {
      name: 'John',
      message: 'Hello there!',
      email: 'john_test@abc.com',
    },
  }
}

export const mockAddRowPayload2 = (): IAddRowApiRequest => {
  return {
    table_name: 'contact_form',
    row: {
      name: 'Andy',
      message: 'Hello there!',
      email: 'andy123@gmail.com',
    },
  }
}

export const mockAddRowPayload3 = (): IAddRowApiRequest => {
  return {
    table_name: 'contact_form',
    row: {
      name: 'Flora',
      message: 'Hello there!',
      email: 'flora@samatech.com',
    },
  }
}

export const mockAddRowPayload4 = (): IAddRowApiRequest => {
  return {
    table_name: 'contact_form',
    row: {
      name: 'Cindy',
      message: 'Hello there!',
      email: 'ccc@hotmail.com',
      phone: '0987654321',
    },
  }
}

export const mockAddInvalidRow1 = (): IAddRowApiRequest => {
  return {
    table_name: 'contact_form',
    row: {
      name: 'John',
      message: 'Hello there!',
      email: 'john@samatech.com',
    },
  }
}

export const mockAddInvalidRow2 = (): IAddRowApiRequest => {
  return {
    table_name: 'contact_form',
    row: {
      name: 'Lily',
      message: '',
      email: 'lll@bbb.com',
    },
  }
}

export const mockAddInvalidRow3 = (): IAddRowApiRequest => {
  return {
    table_name: 'contact_form',
    row: {
      name: 'Eden',
      message: '1234567890'.repeat(11),
      email: 'eden@qqq.com',
    },
  }
}

export const mockAddInvalidRow4 = (email: string): IAddRowApiRequest => {
  return {
    table_name: 'contact_form',
    row: {
      name: 'Lisa',
      message: 'Hello there!',
      email,
    },
  }
}

export const mockAddInvalidRow5 = (): IAddRowApiRequest => {
  return {
    table_name: 'contact_form',
    row: {
      name: 'Iris',
      message: 'Hello there!',
      email: 'iris@lol.com',
      phone: '100000000000000',
    },
  }
}
