import { useCustomDataApi } from '@pubstudio/frontend/data-access-api'
import {
  appendLastCommand,
  setMailingListWalkthrough,
} from '@pubstudio/frontend/data-access-command'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import { appendEvent, loadCustomTables } from '@pubstudio/frontend/feature-walkthrough'
import { parseApiErrorKey, toApiError } from '@pubstudio/frontend/util-api'
import { makeRemoveComponentData } from '@pubstudio/frontend/util-command-data'
import { makeColumnInfo } from '@pubstudio/frontend/util-custom-data'
import { clearErrorBehaviorId, mailingListBehaviorId } from '@pubstudio/frontend/util-ids'
import { resolveComponent } from '@pubstudio/frontend/util-resolve'
import { IApiCustomData } from '@pubstudio/shared/type-api-interfaces'
import {
  ICreateTableApiRequest,
  ICustomTableViewModel,
} from '@pubstudio/shared/type-api-site-custom-data'
import { CommandType } from '@pubstudio/shared/type-command'
import {
  ComponentEventType,
  IComponentEvent,
  MailingListWalkthroughState,
} from '@pubstudio/shared/type-site'
import { Ref, ref } from 'vue'

export interface IMailingListFormFeature {
  api: IApiCustomData
  tables: Ref<ICustomTableViewModel[] | undefined>
  loadingTables: Ref<boolean>
  mailingListTables: Ref<ICustomTableViewModel[]>
  tableName: Ref<string>
  hasName: Ref<boolean>
  loadMailingListTables: () => Promise<void>
  showMailingListWalkthrough: (formId: string | undefined) => Promise<void>
  createMailingListTable: (tableName: string, hasName: boolean) => Promise<void>
  linkMailingListTable: (tableName: string) => Promise<void>
}

const isMailingListTable = (table: ICustomTableViewModel): boolean => {
  return Object.keys(table.columns).some((name) => name.toLowerCase() === 'email')
}

const resetMailingListForm = () => {
  tables.value = undefined
  mailingListTables.value = []
  tableName.value = ''
  hasName.value = false
}

const tables = ref<ICustomTableViewModel[] | undefined>()
const mailingListTables = ref<ICustomTableViewModel[]>([])
const loadingTables = ref(false)
const tableName = ref('')
const hasName = ref(false)

export const useMailingListForm = (): IMailingListFormFeature => {
  const { apiSite, site, apiSiteId } = useSiteSource()

  const api = useCustomDataApi(apiSiteId.value as string)

  const loadMailingListTables = async () => {
    resetMailingListForm()
    await loadCustomTables(apiSite, { api, tables, loadingTables })
    mailingListTables.value = tables.value?.filter(isMailingListTable) ?? []
  }

  const showMailingListWalkthrough = async (formId: string | undefined) => {
    if (formId) {
      // Show loading animation immediately
      loadingTables.value = true
      setMailingListWalkthrough(
        site.value.editor,
        MailingListWalkthroughState.Init,
        formId,
      )
      await loadMailingListTables()
      if (!mailingListTables.value.length) {
        setMailingListWalkthrough(
          site.value.editor,
          MailingListWalkthroughState.CreateTable,
        )
      }
    }
  }

  const setupMailingListForm = (tableName: string, hasName: boolean) => {
    const { context } = site.value
    const formId = site.value.editor?.mailingListWalkthrough?.formId
    if (context && formId) {
      const form = resolveComponent(context, formId)
      if (form) {
        const nameInput = form.children?.[2]
        const emailInput = form.children?.[1]
        const error = form.children?.[3]
        // Remove name input if not included in table
        if (!hasName && nameInput) {
          const removeName = makeRemoveComponentData(site.value, nameInput)
          appendLastCommand(site.value, {
            type: CommandType.RemoveComponent,
            data: removeName,
          })
        }
        // Add form submit event behavior
        const submitEvent: IComponentEvent = {
          name: ComponentEventType.Submit,
          eventParams: {},
          behaviors: [
            {
              behaviorId: mailingListBehaviorId,
              args: {
                tableName,
                emailId: emailInput?.id ?? '',
                nameId: nameInput?.id ?? '',
                errorId: error?.id ?? '',
                apiEmailField: 'email',
                apiNameField: hasName ? 'name' : '',
              },
            },
          ],
        }
        appendEvent(site.value, form, submitEvent, false)

        // Add form input error reset behavior
        const inputEvent: IComponentEvent = {
          name: ComponentEventType.Input,
          eventParams: {},
          behaviors: [
            {
              behaviorId: clearErrorBehaviorId,
              args: {
                errorId: error?.id ?? '',
              },
            },
          ],
        }
        if (nameInput) {
          appendEvent(site.value, nameInput, inputEvent, false)
        }
        if (emailInput) {
          appendEvent(site.value, emailInput, inputEvent, false)
        }
      }
    }
  }

  // Creates a mailing list table or throws an error key
  const createMailingListTable = async (tableName: string, hasName: boolean) => {
    if (tableName.length < 2 || tableName.length > 100) {
      throw 'errors.table_name'
    }
    const tablePayload: ICreateTableApiRequest = {
      table_name: tableName,
      columns: {
        email: makeColumnInfo({
          name: 'email',
          validation_rules: [
            { rule_type: 'Required' },
            { rule_type: 'Email' },
            { rule_type: 'Unique' },
          ],
        }),
      },
      events: [],
    }
    if (hasName) {
      tablePayload.columns.name = makeColumnInfo({
        name: 'message',
        validation_rules: [
          { rule_type: 'MinLength', parameter: 2 },
          { rule_type: 'MaxLength', parameter: 100 },
        ],
      })
    }
    try {
      const table = await api.createTable(apiSite, tablePayload)
      setupMailingListForm(table.name, hasName)
    } catch (e) {
      console.log('Failed to setup form:', e)
      throw parseApiErrorKey(toApiError(e))
    }
  }

  // Links a mailing list table or throws an error key
  // Checks if the linked table has a `name` column, and updates the mailing list form
  const linkMailingListTable = async (tableName: string) => {
    const table = mailingListTables.value.find((table) => table.name === tableName)
    if (table) {
      const hasName = Object.keys(table.columns).some(
        (name) => name.toLowerCase() === 'name',
      )
      try {
        setupMailingListForm(tableName, hasName)
      } catch (e) {
        console.log('Failed to link form:', e)
        throw parseApiErrorKey(toApiError(e))
      }
    }
  }

  return {
    api,
    tables,
    mailingListTables,
    loadingTables,
    tableName,
    hasName,
    loadMailingListTables,
    showMailingListWalkthrough,
    createMailingListTable,
    linkMailingListTable,
  }
}
