import { Keys } from './enum-keys'

export interface IHotkeys {
  [HotkeyStates.None]?: { [k in Keys]?: MenuHotkeys }
  [HotkeyStates.ComponentBasic]?: { [k in Keys]?: ComponentHotkeys }
  [HotkeyStates.ComponentAdvanced]?: { [k in Keys]?: ComponentAdvancedHotkeys }
  [HotkeyStates.CustomComponents]?: { [k in Keys]?: CustomComponentHotkeys }
  [HotkeyStates.Pages]?: { [k in Keys]?: PageHotkeys }
  [HotkeyStates.Theme]?: { [k in Keys]?: ThemeHotkeys }
  [HotkeyStates.Style]?: { [k in Keys]?: StyleHotkeys }
  [HotkeyStates.Assets]?: { [k in Keys]?: AssetHotkeys }
  [HotkeyStates.Behavior]?: { [k in Keys]?: BehaviorHotkeys }
  [HotkeyStates.History]?: { [k in Keys]?: HistoryHotkeys }
  [HotkeyStates.File]?: { [k in Keys]?: FileHotkeys }
}

export type IInvertedHotkeys = Record<HotkeyStates, Record<string, string>>
/*
export interface IInvertedHotkeys {
  [HotkeyStates.None]?: { [k in MenuHotkeys]?: Keys }
  [HotkeyStates.ComponentBasic]?: { [k in ComponentHotkeys]?: Keys }
  [HotkeyStates.ComponentAdvanced]?: { [k in ComponentAdvancedHotkeys]?: Keys }
  [HotkeyStates.CustomComponents]?: { [k in CustomComponentHotkeys]?: Keys }
  [HotkeyStates.Pages]?: { [k in PageHotkeys]?: Keys }
  [HotkeyStates.Theme]?: { [k in ThemeHotkeys]?: Keys }
  [HotkeyStates.Style]?: { [k in StyleHotkeys]?: Keys }
  [HotkeyStates.Assets]?: { [k in AssetHotkeys]?: Keys }
  [HotkeyStates.Behavior]?: { [k in BehaviorHotkeys]?: Keys }
  [HotkeyStates.History]?: { [k in HistoryHotkeys]?: Keys }
  [HotkeyStates.File]?: { [k in FileHotkeys]?: Keys }
}
  */

export enum HotkeyStates {
  None = 'none',
  ComponentBasic = 'cb',
  ComponentAdvanced = 'ca',
  CustomComponents = 'cc',
  Pages = 'p',
  Theme = 't',
  Style = 's',
  Assets = 'a',
  Behavior = 'b',
  History = 'h',
  File = 'f',
}

export enum MenuHotkeys {
  OpenNewComponent = 'oNC',
  OpenCustomComponent = 'oCC',
  OpenPages = 'oP',
  OpenTheme = 'oT',
  OpenStyle = 'oS',
  OpenAssets = 'oA',
  OpenTranslations = 'oTr',
  OpenBehavior = 'oB',
  OpenHistory = 'oH',
  OpenFile = 'oF',
}

export enum ComponentHotkeys {
  Close = 'cc',
  NewSwitch = 'nS',
  // Basic components
  NewContainerH = 'nCH',
  NewContainerV = 'nCV',
  NewGrid = 'nG',
  NewSvg = 'nSvg',
  NewImage = 'nI',
  NewText = 'nT',
  NewLink = 'nL',
  NewH1 = 'nH1',
  NewH2 = 'nH2',
  NewH3 = 'nH3',
  NewH4 = 'nH4',
  NewH5 = 'nH5',
  NewH6 = 'nH6',
  NewNumberList = 'nLN',
  NewBulletList = 'nLB',
  NewInput = 'nIn',
  NewTextarea = 'nTa',
  NewDividerH = 'nDH',
  NewDividerV = 'nDV',
  NewVue = 'nV',
}

export enum ComponentAdvancedHotkeys {
  Close = 'cac',
  NewButton = 'nB',
  NewNavMenu = 'nNM',
  NewHeader = 'nH',
  NewFooter = 'nF',
  NewContactForm = 'nCF',
  NewMailingList = 'nML',
}

export enum CustomComponentHotkeys {
  Close = 'ccc',
  Custom1 = 'c1',
  Custom2 = 'c2',
  Custom3 = 'c3',
  Custom4 = 'c4',
  Custom5 = 'c5',
  Custom6 = 'c6',
  Custom7 = 'c7',
  Custom8 = 'c8',
  Custom9 = 'c9',
}

export enum PageHotkeys {
  Close = 'pc',
  PageNew = 'pN',
  Page1 = 'p1',
  Page2 = 'p2',
  Page3 = 'p3',
  Page4 = 'p4',
  Page5 = 'p5',
  Page6 = 'p6',
  Page7 = 'p7',
  Page8 = 'p8',
  Page9 = 'p9',
}

export enum ThemeHotkeys {
  Close = 'tc',
}

export enum StyleHotkeys {
  Close = 'sc',
  StyleSwitch = 'sS',
  NewMixin = 'nM',
  NewGlobal = 'nG',
}

export enum AssetHotkeys {
  Close = 'ac',
  NewAsset = 'nA',
}

export enum BehaviorHotkeys {
  Close = 'bc',
  NewBehavior = 'nBe',
}

export enum HistoryHotkeys {
  Close = 'hc',
}

export enum FileHotkeys {
  Close = 'fc',
  Export = 'e',
  Import = 'i',
  Templates = 't',
}
