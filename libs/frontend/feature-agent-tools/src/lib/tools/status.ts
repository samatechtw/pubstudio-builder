import { activeCanvasRoute } from '@pubstudio/frontend/data-access-command'
import { SiteSaveState } from '@pubstudio/shared/type-site'
import {
  currentIdentity,
  editingEnabled,
  formatSaveError,
  isReady,
  lastSavedAt,
  requireSite,
  saveError,
  saveState,
  siteSource,
  storageKind,
} from './session'

export interface IStatus {
  ready: boolean
  identified: boolean
  editable: boolean
  storage: 'api' | 'local'
  saveState: SiteSaveState
  saving: boolean
  /** saveState never changes on a scratch site, so polling it there is pointless. */
  saveStateMeaningful: boolean
  /** Cleared only by a save that succeeds, not by the next attempt starting. */
  lastSaveError?: string
  lastSavedAt?: number
  siteId?: string
  activePageRoute?: string
  /** Definition open in the component edit screen. */
  editingComponentId?: string
  selectedComponentId?: string
  historyDepth: number
  redoDepth: number
}

export const status = (): IStatus => {
  const ready = isReady()
  const storage = storageKind()
  const site = ready ? requireSite() : undefined
  return {
    ready,
    identified: !!currentIdentity(),
    editable: editingEnabled(),
    storage,
    saveState: saveState(),
    saving: siteSource().isSaving.value,
    saveStateMeaningful: storage === 'api',
    lastSaveError: formatSaveError(saveError()),
    lastSavedAt: lastSavedAt(),
    siteId: siteSource().apiSiteId.value,
    activePageRoute: site ? activeCanvasRoute(site) : undefined,
    editingComponentId: site?.editor?.editingComponentId,
    selectedComponentId: site?.editor?.selectedComponent?.id,
    historyDepth: site?.history.back.length ?? 0,
    redoDepth: site?.history.forward.length ?? 0,
  }
}
