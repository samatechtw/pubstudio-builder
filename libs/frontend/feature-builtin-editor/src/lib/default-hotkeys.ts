import {
  AssetHotkeys,
  BehaviorHotkeys,
  ComponentAdvancedHotkeys,
  ComponentHotkeys,
  CustomComponentHotkeys,
  FileHotkeys,
  HistoryHotkeys,
  HotkeyStates,
  IHotkeys,
  Keys,
  MenuHotkeys,
  PageHotkeys,
  StyleHotkeys,
  ThemeHotkeys,
} from '@pubstudio/shared/type-site'

export const HotkeyStateToMenuAction: Record<HotkeyStates, MenuHotkeys> = {
  [HotkeyStates.None]: '' as MenuHotkeys,
  [HotkeyStates.ComponentBasic]: MenuHotkeys.OpenNewComponent,
  [HotkeyStates.ComponentAdvanced]: MenuHotkeys.OpenNewComponent,
  [HotkeyStates.CustomComponents]: MenuHotkeys.OpenCustomComponent,
  [HotkeyStates.Pages]: MenuHotkeys.OpenPages,
  [HotkeyStates.Theme]: MenuHotkeys.OpenTheme,
  [HotkeyStates.Style]: MenuHotkeys.OpenStyle,
  [HotkeyStates.Assets]: MenuHotkeys.OpenAssets,
  [HotkeyStates.Behavior]: MenuHotkeys.OpenBehavior,
  [HotkeyStates.History]: MenuHotkeys.OpenHistory,
  [HotkeyStates.File]: MenuHotkeys.OpenFile,
}

export const DefaultHotkeys: IHotkeys = {
  [HotkeyStates.None]: {
    [Keys.a]: MenuHotkeys.OpenNewComponent,
    [Keys.c]: MenuHotkeys.OpenCustomComponent,
    [Keys.p]: MenuHotkeys.OpenPages,
    [Keys.t]: MenuHotkeys.OpenTheme,
    [Keys.s]: MenuHotkeys.OpenStyle,
    [Keys.m]: MenuHotkeys.OpenAssets,
    [Keys.i]: MenuHotkeys.OpenTranslations,
    [Keys.b]: MenuHotkeys.OpenBehavior,
    [Keys.h]: MenuHotkeys.OpenHistory,
    [Keys.f]: MenuHotkeys.OpenFile,
  },
  [HotkeyStates.ComponentBasic]: {
    [Keys.a]: ComponentHotkeys.Close,
    [Keys.Tab]: ComponentHotkeys.NewSwitch,
    [Keys.h]: ComponentHotkeys.NewContainerH,
    [Keys.v]: ComponentHotkeys.NewContainerV,
    [Keys.s]: ComponentHotkeys.NewSvg,
    [Keys.p]: ComponentHotkeys.NewImage,
    [Keys.t]: ComponentHotkeys.NewText,
    [Keys.l]: ComponentHotkeys.NewLink,
    [Keys.Digit1]: ComponentHotkeys.NewH1,
    [Keys.Digit2]: ComponentHotkeys.NewH2,
    [Keys.Digit3]: ComponentHotkeys.NewH3,
    [Keys.Digit4]: ComponentHotkeys.NewH4,
    [Keys.Digit5]: ComponentHotkeys.NewH5,
    [Keys.Digit6]: ComponentHotkeys.NewH6,
    [Keys.n]: ComponentHotkeys.NewNumberList,
    [Keys.b]: ComponentHotkeys.NewBulletList,
    [Keys.i]: ComponentHotkeys.NewInput,
    [Keys.x]: ComponentHotkeys.NewTextarea,
    [Keys.d]: ComponentHotkeys.NewDividerH,
    [Keys.f]: ComponentHotkeys.NewDividerV,
  },
  [HotkeyStates.ComponentAdvanced]: {
    [Keys.a]: ComponentAdvancedHotkeys.Close,
    [Keys.b]: ComponentAdvancedHotkeys.NewButton,
    [Keys.n]: ComponentAdvancedHotkeys.NewNavMenu,
    [Keys.h]: ComponentAdvancedHotkeys.NewHeader,
    [Keys.f]: ComponentAdvancedHotkeys.NewFooter,
    [Keys.c]: ComponentAdvancedHotkeys.NewContactForm,
    [Keys.m]: ComponentAdvancedHotkeys.NewMailingList,
  },
  [HotkeyStates.CustomComponents]: {
    [Keys.c]: CustomComponentHotkeys.Close,
    [Keys.Digit1]: CustomComponentHotkeys.Custom1,
    [Keys.Digit2]: CustomComponentHotkeys.Custom2,
    [Keys.Digit3]: CustomComponentHotkeys.Custom3,
    [Keys.Digit4]: CustomComponentHotkeys.Custom4,
    [Keys.Digit5]: CustomComponentHotkeys.Custom5,
    [Keys.Digit6]: CustomComponentHotkeys.Custom6,
    [Keys.Digit7]: CustomComponentHotkeys.Custom7,
    [Keys.Digit8]: CustomComponentHotkeys.Custom8,
    [Keys.Digit9]: CustomComponentHotkeys.Custom9,
  },
  [HotkeyStates.Pages]: {
    [Keys.p]: PageHotkeys.Close,
    [Keys.n]: PageHotkeys.PageNew,
    [Keys.Digit1]: PageHotkeys.Page1,
    [Keys.Digit2]: PageHotkeys.Page2,
    [Keys.Digit3]: PageHotkeys.Page3,
    [Keys.Digit4]: PageHotkeys.Page4,
    [Keys.Digit5]: PageHotkeys.Page5,
    [Keys.Digit6]: PageHotkeys.Page6,
    [Keys.Digit7]: PageHotkeys.Page7,
    [Keys.Digit8]: PageHotkeys.Page8,
    [Keys.Digit9]: PageHotkeys.Page9,
  },
  [HotkeyStates.Theme]: {
    [Keys.t]: ThemeHotkeys.Close,
  },
  [HotkeyStates.Style]: {
    [Keys.s]: StyleHotkeys.Close,
    [Keys.Tab]: StyleHotkeys.StyleSwitch,
    [Keys.n]: StyleHotkeys.NewMixin,
    [Keys.g]: StyleHotkeys.NewGlobal,
  },
  [HotkeyStates.Assets]: {
    [Keys.m]: AssetHotkeys.Close,
    [Keys.n]: AssetHotkeys.NewAsset,
  },
  [HotkeyStates.Behavior]: {
    [Keys.b]: BehaviorHotkeys.Close,
    [Keys.n]: BehaviorHotkeys.NewBehavior,
  },
  [HotkeyStates.History]: {
    [Keys.h]: HistoryHotkeys.Close,
  },
  [HotkeyStates.File]: {
    [Keys.f]: FileHotkeys.Close,
    [Keys.i]: FileHotkeys.Import,
    [Keys.e]: FileHotkeys.Export,
    [Keys.t]: FileHotkeys.Templates,
  },
}
