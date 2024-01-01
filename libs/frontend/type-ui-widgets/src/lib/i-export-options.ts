export enum ExportOptions {
  PubStudio = 'pubstudio',
  Pdf = 'pdf',
}

export interface IExportData {
  type: ExportOptions
  fileName: string
}
