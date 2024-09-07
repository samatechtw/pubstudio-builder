import { useCustomDataApi } from '@pubstudio/frontend/data-access-api'
import {
  appendLastCommand,
  setContactFormWalkthrough,
} from '@pubstudio/frontend/data-access-command'
import { store } from '@pubstudio/frontend/data-access-web-store'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import { appendEvent, loadCustomTables } from '@pubstudio/frontend/feature-walkthrough'
import { parseApiErrorKey, toApiError } from '@pubstudio/frontend/util-api'
import { makeRemoveComponentData } from '@pubstudio/frontend/util-command-data'
import { makeColumnInfo } from '@pubstudio/frontend/util-custom-data'
import { clearErrorBehaviorId, contactFormBehaviorId } from '@pubstudio/frontend/util-ids'
import { resolveComponent } from '@pubstudio/frontend/util-resolve'
import { IApiCustomData } from '@pubstudio/shared/type-api-interfaces'
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
  tableName: Ref<string>
  hasName: Ref<boolean>
  recipients: Ref<[number, string][]>
  recipientKey: Ref<number>
  loadContactFormTables: () => Promise<void>
  showContactFormWalkthrough: (formId: string | undefined) => Promise<void>
  createContactTable: (
    tableName: string,
    recipients: string[],
    hasName: boolean,
  ) => Promise<void>
  linkContactTable: (tableName: string) => Promise<void>
}

const isContactTable = (table: ICustomTableViewModel): boolean => {
  const columns = Object.keys(table.columns)
  const hasEmail = columns.some((name) => name.toLowerCase() === 'email')
  const hasMessage = columns.some((name) => name.toLowerCase() === 'message')
  return hasEmail && hasMessage
}

const resetContactTables = () => {
  tables.value = undefined
  contactTables.value = []
  tableName.value = ''
  hasName.value = false
  recipientKey.value = 0
  recipients.value = [[recipientKey.value, store.user.email.value ?? '']]
}

const tables = ref<ICustomTableViewModel[] | undefined>()
const contactTables = ref<ICustomTableViewModel[]>([])
const loadingTables = ref(false)
const tableName = ref('')
const hasName = ref(false)
const recipients = ref<[number, string][]>([])
const recipientKey = ref(0)

export const useContactForm = (): IContactFormFeature => {
  const { apiSite, site, apiSiteId } = useSiteSource()

  const api = useCustomDataApi(apiSiteId.value as string)

  const loadContactFormTables = async () => {
    resetContactTables()
    await loadCustomTables({ api, tables, loadingTables })
    contactTables.value = tables.value?.filter(isContactTable) ?? []
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
      await loadContactFormTables()
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
        if (emailInput && messageInput) {
          appendEvent(site.value, emailInput, inputEvent, false)
          appendEvent(site.value, messageInput, inputEvent, true)
        }
      }
    }
  }

  // Creates a contact table or throws an error key
  const createContactTable = async (
    tableName: string,
    recipients: string[],
    hasName: boolean,
  ) => {
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
        message: makeColumnInfo({
          name: 'message',
          validation_rules: [
            { rule_type: 'Required' },
            { rule_type: 'MinLength', parameter: 5 },
            { rule_type: 'MaxLength', parameter: 800 },
          ],
        }),
      },
      events: [
        {
          event_type: 'EmailRow',
          trigger: 'AddRow',
          options: { recipients },
        },
      ],
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
    tableName,
    hasName,
    recipientKey,
    recipients,
    loadContactFormTables,
    showContactFormWalkthrough,
    createContactTable,
    linkContactTable,
  }
}
