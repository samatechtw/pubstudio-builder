import {
  autoUpdate,
  computePosition,
  flip,
  Middleware,
  offset as offsetMiddleware,
  OffsetOptions,
  Placement,
  shift,
} from '@floating-ui/vue'
import { useControlledClickaway } from '@pubstudio/frontend/util-clickaway'
import {
  ComponentPublicInstance,
  ComputedRef,
  CSSProperties,
  onUnmounted,
  ref,
  Ref,
  watch,
} from 'vue'

export interface IUseDropdown {
  toggleRef: Ref
  menuRef: Ref
  opened: Ref<boolean>
  menuStyle: Ref<CSSProperties>
  updateMenuPosition: () => void
  setMenuOpened: (opened: boolean) => void
  toggleMenu: () => void
  setToggleRef: (el: ComponentPublicInstance | null | Element) => void
  setMenuRef: (el: ComponentPublicInstance | null | Element) => void
}

export interface IUseDropdownOptions {
  clickawayIgnoreSelector: string
  placement?: Placement
  offset?: OffsetOptions
  openedInit?: boolean
  // Override actions/events that cause the menu to close
  disableClose?: ComputedRef<boolean> | Ref<boolean>
  middlewares?: Middleware[]
  // Control autoUpdate options
  layoutShift?: boolean
  elementResize?: boolean
  // An external function that controls whether the menu is open
  openControl?: () => boolean
  // Open change callback
  openChanged?: (open: boolean) => void
}

export const useDropdown = (options: IUseDropdownOptions): IUseDropdown => {
  const {
    clickawayIgnoreSelector,
    disableClose,
    placement = 'bottom-end',
    offset,
    openedInit,
    middlewares,
    openControl,
    openChanged,
  } = options

  const opened = ref()
  let autoUpdateCleanup: (() => void) | undefined = undefined

  const setOpened = (value: boolean) => {
    opened.value = value
    if (value) {
      autoUpdateCleanup = autoUpdate(
        toggleRef.value,
        menuRef.value,
        autoUpdateMenuPosition,
        {
          ancestorScroll: false,
          ancestorResize: false,
          elementResize: options.elementResize ?? false,
          layoutShift: options.layoutShift ?? true,
        },
      )
    } else {
      autoUpdateCleanup?.()
    }
  }

  const toggleRef = ref()
  const menuRef = ref()
  setOpened(openedInit ?? false)

  if (openControl) {
    watch(openControl, async (isOpen: boolean) => {
      setOpened(isOpen)
    })
  }

  const menuStyle = ref<CSSProperties>({
    left: '0px',
    top: '0px',
  })

  const setToggleRef = (el: ComponentPublicInstance | null | Element) => {
    if (el && '$el' in el) {
      toggleRef.value = el?.$el
    }
  }

  const setMenuRef = (el: ComponentPublicInstance | null | Element) => {
    if (el && '$el' in el) {
      menuRef.value = el?.$el
    }
  }

  const updateMenuPosition = async () => {
    const { x, y } = await computePosition(toggleRef.value, menuRef.value, {
      placement,
      middleware: [flip(), shift(), offsetMiddleware(offset), ...(middlewares ?? [])],
    })
    menuStyle.value = {
      left: `${x}px`,
      top: `${y}px`,
    }
  }

  const closeMenu = () => {
    if (!disableClose?.value) {
      setOpened(false)
      openChanged?.(opened.value)
    }
  }

  useControlledClickaway(clickawayIgnoreSelector, closeMenu)

  const setMenuOpened = (value: boolean) => {
    if (opened.value === value) {
      return
    }
    setOpened(value)
    if (value) {
      updateMenuPosition()
    } else {
      autoUpdateCleanup?.()
    }
    openChanged?.(opened.value)
  }

  const toggleMenu = () => setMenuOpened(!opened.value)

  const autoUpdateMenuPosition = () => {
    updateMenuPosition()
  }

  onUnmounted(() => {
    autoUpdateCleanup?.()
  })

  return {
    toggleRef,
    menuRef,
    opened,
    menuStyle,
    updateMenuPosition,
    setMenuOpened,
    toggleMenu,
    setToggleRef,
    setMenuRef,
  }
}
