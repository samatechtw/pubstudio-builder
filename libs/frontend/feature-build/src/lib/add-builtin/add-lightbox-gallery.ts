import {
  appendEvent,
  appendLastCommand,
  toggleComponentTreeHidden,
} from '@pubstudio/frontend/data-access-command'
import { descSortedBreakpoints } from '@pubstudio/frontend/feature-site-source'
import { lightboxGallery } from '@pubstudio/frontend/util-builtin'
import { makeAddComponentData } from '@pubstudio/frontend/util-command-data'
import {
  downloadImageBehaviorId,
  hideLightboxBehaviorId,
  lightboxImageLoadBehaviorId,
  showLightboxBehaviorId,
  updateNavIndexId,
} from '@pubstudio/frontend/util-ids'
import { resolveComponent } from '@pubstudio/frontend/util-resolve'
import { CommandType } from '@pubstudio/shared/type-command'
import {
  ComponentEventType,
  Css,
  IComponentEvent,
  ISite,
  Keys,
} from '@pubstudio/shared/type-site'
import { makeSetComponentCustomStyle } from '../command-wrap/component-style'
import {
  addComponentToParent,
  getMissingComponentFields,
  pushCommandWithBuiltins,
} from './add-builtin-component'

// Gets the breakpoint ID for a site with max-width less than `maxWidth`
const getBreakpointUnder = (maxWidth: number): string | undefined => {
  for (const bp of descSortedBreakpoints.value) {
    if (bp.maxWidth !== undefined && bp.maxWidth < maxWidth) {
      return bp.id
    }
  }
}

export const addLightboxGallery = (site: ISite) => {
  const data = addComponentToParent(site, { id: lightboxGallery.id }, (parent) =>
    makeAddComponentData(lightboxGallery, parent, site.editor?.selectedComponent?.id),
  )
  if (data) {
    const missing = getMissingComponentFields(site, lightboxGallery)
    pushCommandWithBuiltins(site, CommandType.AddComponent, data, missing)
    const galleryWrap = resolveComponent(site.context, data?.id)

    const lightbox = galleryWrap?.children?.[0]
    const lightboxTop = lightbox?.children?.[0]?.children?.[0]
    const lightboxId = lightbox?.id
    const lightboxImageWrap = lightbox?.children?.[0]?.children?.[1]
    const loaderId = lightboxImageWrap?.children?.[3]?.id
    // Show lightbox on image click
    const imageGrid = galleryWrap?.children?.[1]
    const imageWraps = imageGrid?.children ?? []
    for (let i = 0; i < imageWraps.length; i += 1) {
      const image = imageWraps[i]
      const imageClick: IComponentEvent = {
        name: ComponentEventType.Click,
        behaviors: [
          {
            behaviorId: showLightboxBehaviorId,
            args: { lightboxId, imageIndex: i, loaderId },
          },
        ],
      }
      appendEvent(site, image, imageClick, false)
    }
    const breakpointId = getBreakpointUnder(600)
    if (breakpointId && imageGrid) {
      const gridResponsiveStyle = makeSetComponentCustomStyle(
        imageGrid,
        breakpointId,
        Css.GridTemplateColumns,
        undefined,
        'repeat(2, 1fr)',
      )
      appendLastCommand(site, gridResponsiveStyle, false)
    }
    const download = lightboxTop?.children?.[0]
    const lightboxImage = lightboxImageWrap?.children?.[1]
    const lightboxPrev = lightboxImageWrap?.children?.[0]
    const lightboxNext = lightboxImageWrap?.children?.[2]
    const lightboxLoader = lightboxImageWrap?.children?.[3]
    if (lightboxImage) {
      const loadEvent: IComponentEvent = {
        name: ComponentEventType.Load,
        behaviors: [
          {
            behaviorId: lightboxImageLoadBehaviorId,
            args: { loaderId: lightboxLoader?.id },
          },
        ],
      }
      appendEvent(site, lightboxImage, loadEvent, false)
    }
    if (lightboxPrev) {
      const prevEvent: IComponentEvent = {
        name: ComponentEventType.Click,
        behaviors: [
          {
            behaviorId: updateNavIndexId,
            args: { navDataId: lightboxId, increment: -1 },
          },
        ],
      }
      appendEvent(site, lightboxPrev, prevEvent, false)
    }
    if (lightboxNext) {
      const nextEvent: IComponentEvent = {
        name: ComponentEventType.Click,
        behaviors: [
          { behaviorId: updateNavIndexId, args: { navDataId: lightboxId, increment: 1 } },
        ],
      }
      appendEvent(site, lightboxNext, nextEvent, false)
    }

    if (download) {
      const downloadImage: IComponentEvent = {
        name: ComponentEventType.Click,
        behaviors: [
          { behaviorId: downloadImageBehaviorId, args: { imageId: lightboxImage?.id } },
        ],
      }
      appendEvent(site, download, downloadImage, false)
    }
    const hideLightbox: IComponentEvent = {
      name: ComponentEventType.Click,
      behaviors: [{ behaviorId: hideLightboxBehaviorId, args: { lightboxId } }],
    }
    if (lightbox) {
      const keyEvent: IComponentEvent = {
        name: ComponentEventType.Keydown,
        behaviors: [
          {
            behaviorId: updateNavIndexId,
            args: { navDataId: lightboxId, increment: -1, onKey: Keys.ArrowLeft },
          },
          {
            behaviorId: updateNavIndexId,
            args: { navDataId: lightboxId, increment: 1, onKey: Keys.ArrowRight },
          },
          {
            behaviorId: hideLightboxBehaviorId,
            args: { lightboxId, onKey: Keys.Escape },
          },
        ],
      }
      appendEvent(site, lightbox, hideLightbox, false)
      appendEvent(site, lightbox, keyEvent, false)
    }
    const escape = lightboxTop?.children?.[1]
    if (escape) {
      appendEvent(site, escape, hideLightbox, true)
    }
    toggleComponentTreeHidden(site, lightbox?.id, true)
  }
}
