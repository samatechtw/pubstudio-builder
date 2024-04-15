import { IApiCustomData, useCustomDataApi } from '@pubstudio/frontend/data-access-api'
import {
  appendLastCommand,
  setContactFormWalkthrough,
} from '@pubstudio/frontend/data-access-command'
import { useBuild } from '@pubstudio/frontend/feature-build'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import { parseApiErrorKey, PSApi, toApiError } from '@pubstudio/frontend/util-api'
import { resolveComponent } from '@pubstudio/frontend/util-builtin'
import { makeRemoveComponentData } from '@pubstudio/frontend/util-command-data'
import { contactFormBehaviorId } from '@pubstudio/frontend/util-ids'
import {
  ICreateTableApiRequest,
  ICustomTableViewModel,
} from '@pubstudio/shared/type-api-site-custom-data'
import { CommandType } from '@pubstudio/shared/type-command'
import {
  ComponentEventType,
  ContactFormWalkthroughState,
  IComponentEvent,
} from '@pubstudio/shared/type-site'
import { Ref, ref } from 'vue'

export interface IContactFormFeature {
  api: IApiCustomData
  tables: Ref<ICustomTableViewModel[] | undefined>
  loadingTables: Ref<boolean>
  contactTables: Ref<ICustomTableViewModel[]>
  loadCustomTables: () => Promise<void>
  showContactFormWalkthrough: (formId: string | undefined) => Promise<void>
  createContactTable: (tableName: string, hasName: boolean) => Promise<void>
  linkContactTable: (tableName: string) => Promise<void>
}

const isContactTable = (table: ICustomTableViewModel): boolean => {
  return Object.keys(table.columns).some((name) => name.toLowerCase() === 'email')
}

const tables = ref<ICustomTableViewModel[] | undefined>()
const contactTables = ref<ICustomTableViewModel[]>([])
const loadingTables = ref(false)

export const useContactForm = (): IContactFormFeature => {
  const { apiSite, site, apiSiteId } = useSiteSource()

  const api = useCustomDataApi(apiSite as PSApi, apiSiteId.value as string)

  const loadCustomTables = async () => {
    loadingTables.value = true
    try {
      const data = await api.listTables({})
      tables.value = data.results.map((table) => ({
        id: table.id,
        name: table.name,
        columns: JSON.parse(table.columns),
      }))
      contactTables.value = tables.value?.filter(isContactTable) ?? []
    } catch (e) {
      console.log('List tables error:', e)
    }
    loadingTables.value = false
  }

  const showContactFormWalkthrough = async (formId: string | undefined) => {
    if (formId) {
      // Show loading animation immediately
      loadingTables.value = true
      setContactFormWalkthrough(
        site.value.editor,
        ContactFormWalkthroughState.Init,
        formId,
      )
      await loadCustomTables()
      if (!contactTables.value.length) {
        setContactFormWalkthrough(
          site.value.editor,
          ContactFormWalkthroughState.CreateTable,
        )
      }
    }
  }

  const setupContactForm = (tableName: string, hasName: boolean) => {
    const { context } = site.value
    const { addComponentEventData } = useBuild()
    const formId = site.value.editor?.contactFormWalkthrough?.formId
    if (context && formId) {
      const form = resolveComponent(context, formId)?.children?.[0]
      if (form) {
        const nameInput = form.children?.[1]?.children?.[1]
        const emailInput = form.children?.[1]?.children?.[0]
        const messageInput = form.children?.[2]
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
              behaviorId: contactFormBehaviorId,
              args: {
                tableName,
                emailId: emailInput?.id ?? '',
                messageId: messageInput?.id ?? '',
                nameId: nameInput?.id ?? '',
                errorId: error?.id ?? '',
                apiEmailField: 'email',
                apiMessageField: 'message',
                apiNameField: hasName ? 'name' : '',
              },
            },
          ],
        }
        const addEvent = addComponentEventData(form, submitEvent)
        appendLastCommand(site.value, {
          type: CommandType.SetComponentEvent,
          data: addEvent,
        })
      }
    }
  }

  // Creates a contact table or throws an error key
  const createContactTable = async (tableName: string, hasName: boolean) => {
    if (tableName.length < 2 || tableName.length > 100) {
      throw 'errors.table_name'
    }
    const tablePayload: ICreateTableApiRequest = {
      table_name: tableName,
      columns: {
        email: {
          data_type: 'TEXT',
          validation_rules: [{ rule_type: 'Email' }, { rule_type: 'Unique' }],
        },
        message: {
          data_type: 'TEXT',
          validation_rules: [
            { rule_type: 'MinLength', parameter: 5 },
            { rule_type: 'MaxLength', parameter: 800 },
          ],
        },
      },
    }
    if (hasName) {
      tablePayload.columns.name = {
        data_type: 'TEXT',
        validation_rules: [
          { rule_type: 'MinLength', parameter: 2 },
          { rule_type: 'MaxLength', parameter: 100 },
        ],
      }
    }
    try {
      const table = await api.createTable(tablePayload)
      setupContactForm(table.name, hasName)
    } catch (e) {
      console.log('Failed to setup form:', e)
      throw parseApiErrorKey(toApiError(e))
    }
  }

  // Links a contact table or throws an error key
  // Checks if the linked table has a `name` column, and updates the contact form
  const linkContactTable = async (tableName: string) => {
    const table = contactTables.value.find((table) => table.name === tableName)
    if (table) {
      const hasName = Object.keys(table.columns).some(
        (name) => name.toLowerCase() === 'name',
      )
      try {
        setupContactForm(tableName, hasName)
      } catch (e) {
        console.log('Failed to link form:', e)
        throw parseApiErrorKey(toApiError(e))
      }
    }
  }

  return {
    api,
    tables,
    contactTables,
    loadingTables,
    loadCustomTables,
    showContactFormWalkthrough,
    createContactTable,
    linkContactTable,
  }
}
