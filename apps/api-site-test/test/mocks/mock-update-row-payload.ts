export const mockUpdateRowPayload1 = () => {
  return JSON.parse(`
  {
    "table_name": "contact_form",
    "row_id": 1,
    "new_row": {
        "name": "Jessie",
        "age": "19",
        "email": "jjj@abc.com"
    }
  }`)
}

export const mockUpdateRowPayload2 = () => {
  return JSON.parse(`
    {
      "table_name": "contact_form",
      "row_id": 1,
      "new_row": {
          "name": "Albert"  
      }
    }`)
}

export const mockUpdateInvalidRow1 = () => {
  return JSON.parse(`
  {
    "table_name": "contact_form",
    "row_id": 1,
    "new_row": {
        "name": "Andy"
    }
  }
  `)
}

export const mockUpdateInvalidRow2 = () => {
  return JSON.parse(`
  {
    "table_name": "contact_form",
    "row_id": 1,
    "new_row": {
        "age": ""
    }
  }
  `)
}

export const mockUpdateInvalidRow3 = () => {
  return JSON.parse(`
    {
        "table_name": "contact_form",
        "row_id": 1,
        "new_row": {
            "age": "1000"
        }
      }
    `)
}

export const mockUpdateInvalidRow4 = (email: string) => {
  return JSON.parse(`
    {
        "table_name": "contact_form",
        "row_id": 1,
        "new_row": {
            "email": "${email}"
        }
      }
    `)
}
