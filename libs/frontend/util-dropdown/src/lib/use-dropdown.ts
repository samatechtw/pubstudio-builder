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
  onMounted,
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

  const toggleRef = ref()
  const menuRef = ref()
  const opened = ref(openedInit ?? false)

  if (openControl) {
    watch(openControl, (isOpen: boolean) => {
      opened.value = isOpen
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

  let autoUpdateCleanup: (() => void) | undefined = undefined

  const closeMenu = () => {
    if (!disableClose?.value) {
      opened.value = false
      autoUpdateCleanup?.()
      openChanged?.(opened.value)
    }
  }

  useControlledClickaway(clickawayIgnoreSelector, closeMenu)

  const setMenuOpened = (value: boolean) => {
    opened.value = value
    if (value) {
      updateMenuPosition()
    } else {
      autoUpdateCleanup?.()
    }
    openChanged?.(opened.value)
  }

  const toggleMenu = () => setMenuOpened(!opened.value)

  const updateMenuPositionOnResize = () => {
    if (opened.value) {
      updateMenuPosition()
    }
  }

  onMounted(() => {
    autoUpdateCleanup = autoUpdate(toggleRef.value, menuRef.value, updateMenuPosition)
    window.addEventListener('resize', updateMenuPositionOnResize)
  })

  onUnmounted(() => {
    autoUpdateCleanup?.()
    window.removeEventListener('resize', updateMenuPositionOnResize)
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
