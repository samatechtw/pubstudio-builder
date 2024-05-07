import { IApiCustomData } from '@pubstudio/shared/type-api-interfaces'
import { ICustomTableViewModel } from '@pubstudio/shared/type-api-site-custom-data'
import { Ref } from 'vue'

export interface ILoadCustomTables {
  api: IApiCustomData
  tables: Ref<ICustomTableViewModel[] | undefined>
  loadingTables: Ref<boolean>
}

// Loads and filters custom tables from API, and sets input reactive variables
export const loadCustomTables = async (params: ILoadCustomTables) => {
  const { api, tables, loadingTables } = params
  loadingTables.value = true
  try {
    const data = await api.listTables({})
    tables.value = data.results.map((table) => ({
      id: table.id,
      name: table.name,
      columns: table.columns,
      events: table.events,
    }))
  } catch (e) {
    console.log('List tables error:', e)
  }
  loadingTables.value = false
}
