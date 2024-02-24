import { uiAlert } from '@pubstudio/frontend/util-ui-alert'
import { ref } from 'vue'

export enum SiteSaveAlert {
  Disabled = 'disabled',
}

export const siteSaveAlert = uiAlert<SiteSaveAlert | undefined>(ref(), 1400)
