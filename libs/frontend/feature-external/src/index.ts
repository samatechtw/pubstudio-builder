/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import {
  ApiInjectionKey,
  StoreInjectionKey,
} from '@pubstudio/frontend/data-access-injection'
import { store } from '@pubstudio/frontend/data-access-web-store'
import { useBuild, useHistory } from '@pubstudio/frontend/feature-build'
import { hotkeysDisabled, useBuildEvent } from '@pubstudio/frontend/feature-build-event'
import { iteratePage, useRender } from '@pubstudio/frontend/feature-render'
import { useDragDropData } from '@pubstudio/frontend/feature-render-builder'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import { initializeSiteStore } from '@pubstudio/frontend/feature-site-store-init'
import {
  BuildContent,
  BuildMenu,
  ComponentMenu,
  ComponentTree,
  PageMenu,
  SitePreview,
  StyleMenu,
  StyleToolbar,
  ThemeMenu,
} from '@pubstudio/frontend/ui-build'
import {
  AlertModal,
  AppHUD,
  SiteErrorModal,
  SiteSaveErrorModal,
} from '@pubstudio/frontend/ui-widgets'
import { PSApi } from '@pubstudio/frontend/util-api'
import { toggleEditorMenu } from '@pubstudio/frontend/util-command'
import { Keys, useKeyListener } from '@pubstudio/frontend/util-key-listener'
import { RenderMode } from '@pubstudio/frontend/util-render'
import {
  computeLocationParts,
  getCurrentPath,
  useRoute,
  useRouter,
} from '@pubstudio/frontend/util-router'
import {
  deserializedHelper,
  deserializeSite,
  unstoreSite,
} from '@pubstudio/frontend/util-site-deserialize'
import {
  serializeSite,
  storeSite,
  stringifySite,
} from '@pubstudio/frontend/util-site-store'
import { EditorMode } from '@pubstudio/shared/type-site'

import type { IPage, ISite } from '@pubstudio/shared/type-site'
import type { IRouteWithPathRegex } from '@pubstudio/frontend/util-router'
/* eslint-enable @nrwl/nx/enforce-module-boundaries */

export {
  store,
  PSApi,
  ApiInjectionKey,
  StoreInjectionKey,
  computeLocationParts,
  getCurrentPath,
  useSiteSource,
  initializeSiteStore,
  useBuild,
  useHistory,
  useRoute,
  useRouter,
  useRender,
  iteratePage,
  deserializedHelper,
  deserializeSite,
  unstoreSite,
  serializeSite,
  storeSite,
  stringifySite,
  toggleEditorMenu,
  useDragDropData,
  useBuildEvent,
  hotkeysDisabled,
  useKeyListener,
  Keys,
  EditorMode,
  RenderMode,
  IPage,
  ISite,
  IRouteWithPathRegex,
  // Components
  AlertModal,
  AppHUD,
  BuildContent,
  BuildMenu,
  ComponentMenu,
  ComponentTree,
  PageMenu,
  StyleToolbar,
  SiteErrorModal,
  SitePreview,
  SiteSaveErrorModal,
  StyleMenu,
  ThemeMenu,
}
