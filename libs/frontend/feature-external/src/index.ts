/* eslint-disable @nx/enforce-module-boundaries */

import { toggleEditorMenu } from '@pubstudio/frontend/data-access-command'
import {
  ApiInjectionKey,
  StoreInjectionKey,
} from '@pubstudio/frontend/data-access-injection'
import { useSiteApi } from '@pubstudio/frontend/data-access-site-api'
import { store } from '@pubstudio/frontend/data-access-web-store'
import { useBuild, useHistory } from '@pubstudio/frontend/feature-build'
import { hotkeysDisabled, useBuildEvent } from '@pubstudio/frontend/feature-build-event'
import { replaceNamespace, useCopyPaste } from '@pubstudio/frontend/feature-copy-paste'
import { useRender } from '@pubstudio/frontend/feature-render'
import { useDragDropData } from '@pubstudio/frontend/feature-render-builder'
import { SiteSaveErrorModal } from '@pubstudio/frontend/feature-site-error'
import {
  CustomDomains,
  DeleteDraftModal,
  useSiteResources,
} from '@pubstudio/frontend/feature-site-settings'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import { initializeSiteStore } from '@pubstudio/frontend/feature-site-store-init'
import { useSiteVersion } from '@pubstudio/frontend/feature-site-version'
import { useSiteDomains, useSites } from '@pubstudio/frontend/feature-sites'
import {
  BuildContent,
  BuildMenu,
  ComponentMenu,
  ComponentTree,
  PageMenu,
  SitePreview,
  SiteToolbar,
  StyleMenu,
  ThemeMenu,
} from '@pubstudio/frontend/ui-build'
import {
  AlertModal,
  AppToast,
  ErrorMessage,
  Modal,
  NotFound,
  PSButton,
  PSToggle,
  SiteErrorModal,
  UsageProgress,
} from '@pubstudio/frontend/ui-widgets'
import { PSApi } from '@pubstudio/frontend/util-api'
import { builderConfig, setConfig } from '@pubstudio/frontend/util-config'
import {
  copy,
  isColor,
  loadFile,
  saveFile,
  scrollTop,
  uidSingleton,
  useListDrag,
} from '@pubstudio/frontend/util-doc'
import { iteratePage, RenderMode } from '@pubstudio/frontend/util-render'
import {
  computeLocationParts,
  createRouter,
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
import { EditorMode, Keys } from '@pubstudio/shared/type-site'
import { arrayChanged } from '@pubstudio/shared/util-core'
import { rootSiteApi } from '@pubstudio/shared/util-web-site-api'

import type {
  ISiteMetadata,
  IUpdateSiteApiRequest,
} from '@pubstudio/shared/type-api-site-sites'
import type { ICustomDomainRelationViewModel } from '@pubstudio/shared/type-api-shared'
import type { IPage, ISite } from '@pubstudio/shared/type-site'
import type { IRouteWithPathRegex } from '@pubstudio/frontend/util-router'
import type { IMergedSiteData } from '@pubstudio/frontend/feature-sites'
/* eslint-enable @nx/enforce-module-boundaries */

export {
  store,
  builderConfig,
  rootSiteApi,
  setConfig,
  PSApi,
  ApiInjectionKey,
  StoreInjectionKey,
  arrayChanged,
  computeLocationParts,
  getCurrentPath,
  useSiteSource,
  initializeSiteStore,
  replaceNamespace,
  useBuild,
  useHistory,
  createRouter,
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
  useCopyPaste,
  useDragDropData,
  useBuildEvent,
  hotkeysDisabled,
  useSiteVersion,
  useSiteApi,
  useSiteDomains,
  useSiteResources,
  useSites,
  ICustomDomainRelationViewModel,
  ISiteMetadata,
  IMergedSiteData,
  IUpdateSiteApiRequest,
  Keys,
  EditorMode,
  RenderMode,
  IPage,
  ISite,
  IRouteWithPathRegex,
  // frontend/util-doc
  copy,
  isColor,
  loadFile,
  saveFile,
  scrollTop,
  uidSingleton,
  useListDrag,
  // Components
  AlertModal,
  AppToast,
  BuildContent,
  BuildMenu,
  ComponentMenu,
  ComponentTree,
  CustomDomains,
  DeleteDraftModal,
  ErrorMessage,
  Modal,
  NotFound,
  PageMenu,
  PSButton,
  PSToggle,
  SiteToolbar,
  SiteErrorModal,
  SitePreview,
  SiteSaveErrorModal,
  StyleMenu,
  ThemeMenu,
  UsageProgress,
}
