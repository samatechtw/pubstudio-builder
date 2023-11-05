export enum CommandType {
  // Undo and redo are "special" commands that operate on the command stack,
  // but are not processed by the command queue.
  // The purpose of including here is to have a unified interface for commands,
  // that the UI can use for indication
  Undo = 'undo',
  Redo = 'redo',

  Group = 'g',
  AddComponent = 'addC',
  EditComponent = 'editC',
  RemoveComponent = 'rmC',
  SetComponentCustomStyle = 'setCCS',
  MergeComponentStyle = 'mergeCS',
  AddComponentMixin = 'addCM',
  RemoveComponentMixin = 'rmCM',
  ReplaceComponentMixin = 'repCm',
  SetComponentInput = 'setCI',
  SetComponentEvent = 'setCE',
  SetBehavior = 'setB',
  SetBehaviorArg = 'setBA',
  AddStyleMixin = 'addS',
  EditStyleMixin = 'editS',
  RemoveStyleMixin = 'rmS',
  AddThemeVariable = 'addTV',
  EditThemeVariable = 'editTV',
  RemoveThemeVariable = 'rmTV',
  AddThemeFont = 'addTF',
  EditThemeFont = 'editTF',
  RemoveThemeFont = 'rmTF',
  AddPage = 'addP',
  EditPage = 'editP',
  RemovePage = 'rmP',
  ChangePage = 'changeP',
  SetHomePage = 'shP',
  MoveComponent = 'mvC',
  SetDefaultsHead = 'setDH',
  SetPageHead = 'setPH',
  SetBreakpoint = 'setBP',
  SetTranslations = 'setT',
}
