export const mockAddRowPayload1 = () => {
  return JSON.parse(`
  {
    "table_name": "contact_form",
    "row": {
      "name": "John",
      "age": "30",
      "email": "john_test@abc.com"
    }
  }
  `)
}

export const mockAddRowPayload2 = () => {
  return JSON.parse(`
  {
    "table_name": "contact_form",
    "row": {
      "name": "Andy",
      "age": "40",
      "email": "andy123@gmail.com"
    }
  }
  `)
}

export const mockAddRowPayload3 = () => {
  return JSON.parse(`
  {
    "table_name": "contact_form",
    "row": {
      "name": "Flora",
      "age": "18",
      "email": "flora@samatech.com"
    }
  }
  `)
}

export const mockAddRowPayload4 = () => {
  return JSON.parse(`
  {
    "table_name": "contact_form",
    "row": {
      "name": "Cindy",
      "age": "22",
      "email": "ccc@hotmail.com",
      "phone": "0987654321"
    }
  }
  `)
}

export const mockAddInvalidRow1 = () => {
  return JSON.parse(`
  {
    "table_name": "contact_form",
    "row": {
      "name": "John",
      "age": "32",
      "email": "john@samatech.com"
    }
  }
  `)
}

export const mockAddInvalidRow2 = () => {
  return JSON.parse(`
  {
    "table_name": "contact_form",
    "row": {
      "name": "Lily",
      "age": "",
      "email": "lll@bbb.com"
    }
  }
  `)
}

export const mockAddInvalidRow3 = () => {
  return JSON.parse(`
  {
    "table_name": "contact_form",
    "row": {
      "name": "Eden",
      "age": "1000",
      "email": "eden@qqq.com"
    }
  }
  `)
}

export const mockAddInvalidRow4 = (email: string) => {
  return JSON.parse(`
  {
    "table_name": "contact_form",
    "row": {
      "name": "Lisa",
      "age": "50",
      "email": "${email}"
    }
  }
  `)
}

export const mockAddInvalidRow5 = () => {
  return JSON.parse(`
  {
    "table_name": "contact_form",
    "row": {
      "name": "Iris",
      "age": "40",
      "email": "iris@lol.com",
      "phone": "100000000000000"
    }
  }
  `)
}
