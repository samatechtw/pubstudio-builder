// Where a definition sat before v3 moved it out of its page, so the migration can roll back
export interface IDefinitionOrigin {
  definitionId: string
  parentId: string
  parentIndex: number
  instanceId: string
}

export interface ISiteMigrationData {
  oldVersion: string
  newVersion: string
  definitionOrigins?: IDefinitionOrigin[]
}
